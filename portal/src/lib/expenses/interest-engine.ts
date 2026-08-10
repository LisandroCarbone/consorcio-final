// Motor de Intereses Real — pure calculation module.
// NO DB access here. Callers (engine.ts, actions.ts) own queries and transactions.
// Implements per-period interest (Art. 776 CCyC: FIFO, interest before capital).

// Local helper — deliberately NOT imported from engine.ts, which pulls in
// DB-connected modules (../db). Keeping this module free of any DB import
// preserves the "pure functions, no DB access" design decision.
function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export interface DeudaPeriodo {
  id: number;
  unidadId: number;
  periodoId: number;
  montoOriginal: number;
  montoCapitalPendiente: number;
  montoInteresesAcumulado: number;
  montoInteresesPendiente: number;
  mesesAtraso: number;
  estado: "pendiente" | "parcial" | "pagada";
  fechaVencimiento: Date;
}

export interface TasaInteres {
  tasa: number; // e.g. 0.03 = 3% monthly
  fechaDesde: Date;
  fechaHasta: Date | null;
}

export interface InteresResult {
  deudaPeriodoId: number;
  mesesAtraso: number;
  tasaAplicada: number;
  interesCalculado: number;
  montoInteresesPendiente: number;
}

export interface ImputacionLinea {
  deudaPeriodoId: number;
  montoAInteres: number;
  montoACapital: number;
}

export interface ImputacionResult {
  imputaciones: ImputacionLinea[];
  creditoRestante: number;
}

export interface Pago {
  id: number;
  monto: number;
  fecha: Date;
}

/**
 * Calcula la cantidad de meses de atraso (discreto, no diario) entre la
 * fecha de vencimiento de un período y la fecha de cálculo.
 * Spec: "Interest on single unpaid period" — 2026-03 vencido, calculado
 * 2026-06-01 → 3 meses de atraso.
 */
export function calcularMesesAtraso(fechaVencimiento: Date, fechaCalculo: Date): number {
  // Use UTC getters: date-only values (from DB `date` columns or ISO
  // "YYYY-MM-DD" strings) are parsed as UTC midnight. Using local getters
  // shifts the month/day in timezones behind UTC (e.g. Argentina, UTC-3),
  // silently producing an off-by-one month error.
  const vencAnio = fechaVencimiento.getUTCFullYear();
  const vencMes = fechaVencimiento.getUTCMonth();
  const calcAnio = fechaCalculo.getUTCFullYear();
  const calcMes = fechaCalculo.getUTCMonth();

  // Discrete calendar-month difference (spec: "months of delay, discrete, not daily").
  // A period is considered delayed as soon as its due-date month has passed;
  // within the same month as the due date it is not yet delayed (see the
  // "Zero delay" scenario, where calc date < due date but same month → 0).
  const meses = (calcAnio - vencAnio) * 12 + (calcMes - vencMes);

  return Math.max(0, meses);
}

/**
 * Selecciona la tasa vigente para una fecha de vencimiento dada:
 * la de fechaDesde más reciente que sea <= fechaVencimiento.
 * Spec: "Rate lookup" — usa la tasa vigente al vencimiento del período,
 * no la tasa actual.
 */
function buscarTasaVigente(tasas: TasaInteres[], fechaVencimiento: Date): TasaInteres | null {
  const candidatas = tasas
    .filter(t => t.fechaDesde.getTime() <= fechaVencimiento.getTime())
    .sort((a, b) => b.fechaDesde.getTime() - a.fechaDesde.getTime());

  return candidatas[0] ?? null;
}

/**
 * Calcula intereses por período de forma independiente para cada deuda,
 * usando la tasa vigente al vencimiento de cada período y los meses de
 * atraso respecto a fechaCalculo.
 * Spec: "Per-Period Interest Calculation", "Historical Rate Registry".
 */
export function calcularInteresesPeriodo(
  deudas: DeudaPeriodo[],
  tasas: TasaInteres[],
  fechaCalculo: Date
): { resultados: InteresResult[]; errores: { deudaPeriodoId: number; mensaje: string }[] } {
  const resultados: InteresResult[] = [];
  const errores: { deudaPeriodoId: number; mensaje: string }[] = [];

  for (const deuda of deudas) {
    const mesesAtraso = calcularMesesAtraso(deuda.fechaVencimiento, fechaCalculo);

    if (mesesAtraso <= 0 || deuda.montoCapitalPendiente <= 0) {
      resultados.push({
        deudaPeriodoId: deuda.id,
        mesesAtraso: 0,
        tasaAplicada: 0,
        interesCalculado: 0,
        montoInteresesPendiente: deuda.montoInteresesPendiente,
      });
      continue;
    }

    try {
      const tasaVigente = buscarTasaVigente(tasas, deuda.fechaVencimiento);
      if (!tasaVigente) {
        throw new Error(
          `No se encontró tasa de interés vigente para el período con vencimiento ${deuda.fechaVencimiento.toISOString()}`
        );
      }

      const interesCalculado = round2(deuda.montoCapitalPendiente * tasaVigente.tasa * mesesAtraso);

      resultados.push({
        deudaPeriodoId: deuda.id,
        mesesAtraso,
        tasaAplicada: tasaVigente.tasa,
        interesCalculado,
        montoInteresesPendiente: interesCalculado,
      });
    } catch (err) {
      errores.push({
        deudaPeriodoId: deuda.id,
        mensaje: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { resultados, errores };
}

/**
 * Imputa un pago según FIFO (Art. 776 CCyC): período más antiguo primero,
 * dentro de cada período interés antes que capital. El excedente se
 * devuelve como creditoRestante para ser aplicado por el llamador.
 * Spec: "FIFO Payment Imputation", "Overpayment Credit".
 */
export function imputarPago(
  deudas: DeudaPeriodo[],
  monto: number,
  creditoPrevio: number = 0
): ImputacionResult {
  if (monto < 0) {
    throw new Error("imputarPago: monto must be >= 0");
  }

  let disponible = round2(monto + creditoPrevio);
  const imputaciones: ImputacionLinea[] = [];

  const ordenadas = [...deudas].sort(
    (a, b) => a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime()
  );

  for (const deuda of ordenadas) {
    if (disponible <= 0) break;

    const interesPendiente = Math.max(0, deuda.montoInteresesPendiente);
    const capitalPendiente = Math.max(0, deuda.montoCapitalPendiente);

    if (interesPendiente <= 0 && capitalPendiente <= 0) continue;

    const aInteres = round2(Math.min(disponible, interesPendiente));
    disponible = round2(disponible - aInteres);

    const aCapital = round2(Math.min(disponible, capitalPendiente));
    disponible = round2(disponible - aCapital);

    if (aInteres > 0 || aCapital > 0) {
      imputaciones.push({
        deudaPeriodoId: deuda.id,
        montoAInteres: aInteres,
        montoACapital: aCapital,
      });
    }
  }

  return {
    imputaciones,
    creditoRestante: round2(Math.max(0, disponible)),
  };
}

/**
 * Revierte la imputación de un pago: retorna las deudas con los montos
 * de interés y capital previamente imputados restituidos como pendientes.
 * Spec: "Payment Reversal and Re-imputation".
 */
export function revertirImputacion(
  deudas: DeudaPeriodo[],
  imputaciones: ImputacionLinea[]
): DeudaPeriodo[] {
  const porDeuda = new Map<number, ImputacionLinea>();
  imputaciones.forEach(imp => porDeuda.set(imp.deudaPeriodoId, imp));

  return deudas.map(deuda => {
    const imp = porDeuda.get(deuda.id);
    if (!imp) return deuda;

    const montoCapitalPendiente = round2(deuda.montoCapitalPendiente + imp.montoACapital);
    const montoInteresesPendiente = round2(deuda.montoInteresesPendiente + imp.montoAInteres);
    const montoInteresesAcumulado = round2(deuda.montoInteresesAcumulado); // unchanged; accrual is independent of imputation

    return {
      ...deuda,
      montoCapitalPendiente,
      montoInteresesPendiente,
      montoInteresesAcumulado,
      estado: (montoCapitalPendiente > 0 || montoInteresesPendiente > 0 ? "pendiente" : "pagada") as DeudaPeriodo["estado"],
    };
  });
}

/**
 * Re-imputa todos los pagos de una unidad en orden cronológico, partiendo
 * de las deudas en su estado "sin imputar" (montoCapitalPendiente =
 * montoOriginal, montoInteresesPendiente = montoInteresesAcumulado).
 * Usado al editar o eliminar un pago.
 * Spec: "Payment deleted triggers re-imputation".
 */
export function reimputarTodosPagos(
  deudasBase: DeudaPeriodo[],
  pagos: Pago[]
): { imputacionesPorPago: Map<number, ImputacionResult>; deudasFinales: DeudaPeriodo[] } {
  let deudas = deudasBase.map(d => ({
    ...d,
    montoCapitalPendiente: d.montoOriginal,
    montoInteresesPendiente: d.montoInteresesAcumulado,
    estado: "pendiente" as DeudaPeriodo["estado"],
  }));

  const ordenados = [...pagos].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  const imputacionesPorPago = new Map<number, ImputacionResult>();

  let creditoAcumulado = 0;

  for (const pago of ordenados) {
    const resultado = imputarPago(deudas, pago.monto, creditoAcumulado);
    imputacionesPorPago.set(pago.id, resultado);
    creditoAcumulado = resultado.creditoRestante;

    const porDeuda = new Map(resultado.imputaciones.map(i => [i.deudaPeriodoId, i]));
    deudas = deudas.map(d => {
      const imp = porDeuda.get(d.id);
      if (!imp) return d;
      const montoCapitalPendiente = round2(d.montoCapitalPendiente - imp.montoACapital);
      const montoInteresesPendiente = round2(d.montoInteresesPendiente - imp.montoAInteres);
      return {
        ...d,
        montoCapitalPendiente,
        montoInteresesPendiente,
        estado: (montoCapitalPendiente <= 0 && montoInteresesPendiente <= 0 ? "pagada" : "pendiente") as DeudaPeriodo["estado"],
      };
    });
  }

  return { imputacionesPorPago, deudasFinales: deudas };
}
