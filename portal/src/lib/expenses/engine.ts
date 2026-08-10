import { withTransaction } from "../db";
import {
  calcularInteresesPeriodo,
  reimputarTodosPagos,
  type DeudaPeriodo,
  type TasaInteres,
  type Pago,
} from "./interest-engine";

// Helper to format numbers to 2 decimal places
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

interface EmployeeObligations {
  f931: number;
  art: number;
  scvo: number;
  suterh: number;
  fateryh: number;
  seracarh: number;
}

// Calculate employer obligations (F.931, SUTERH, FATERYH, etc.) for an employee payroll record
export function calculateEmployerObligations(
  totalRemunerativo: number,
  funcion: string,
  jornada: string,
  diasTrabajadosSuplente: number,
  artPctVariable: number,
  svCostoFijo: number,
  diffOsVal: number,
  suterhPct = 0.045,
  faterhPct = 0.065,
  seracarhPct = 0.005,
  isSacPeriod = false,
  artCostoFijo = 0,
  detraccionBase = 12003.68,
  pctAportesSS = 0.1445,   // Jubilación 11% + Ley 19032 3% + ANSSAL 0.45%
  pctAportesOS = 0.0255,   // OS aportes
  pctContribOS = 0.051,    // OS contribución patronal
  pctContribSS = 0.18,     // SS contribución patronal sobre base con detracción
  pctContribANSSAL = 0.009 // ANSSAL contribución patronal
): EmployeeObligations {
  const R = totalRemunerativo;

  // Determine detracción
  let detraccion = 0;
  const isSuplente = String(funcion || '').toLowerCase().includes('suplente');

  let diasTrabajados = 30;
  if (isSuplente && typeof diasTrabajadosSuplente === 'number') {
    diasTrabajados = diasTrabajadosSuplente;
  }

  // In SAC months (June=6, December=12) the F931 detracción is multiplied by 1.5
  const sacMultiplier = isSacPeriod ? 1.5 : 1;

  if (String(funcion || '').toLowerCase().includes('media') ||
      String(jornada || '').toLowerCase().includes('media')) {
    detraccion = round2(detraccionBase / 2 * sacMultiplier);
  } else if (isSuplente) {
    detraccion = round2(detraccionBase * diasTrabajados / 30 * sacMultiplier);
  } else {
    detraccion = round2(detraccionBase * sacMultiplier);
  }

  const base1 = R;
  const base4 = R + (diffOsVal > 0 ? (diffOsVal / 0.03) : 0);
  const base10 = Math.max(0, R - detraccion);

  // AFIP F.931 Split
  const aportesSS = round2(base1 * pctAportesSS); // Jubilación + Ley 19032 + ANSSAL
  const aportesOS = round2(base4 * pctAportesOS); // OS aportes
  const contribucionesOS = round2(base4 * pctContribOS); // OS contribución patronal
  const contribucionesSS = round2(base10 * pctContribSS + base4 * pctContribANSSAL); // SS + ANSSAL contribución patronal

  const f931 = round2(aportesSS + contribucionesSS + aportesOS + contribucionesOS);
  const art = round2(R * artPctVariable + artCostoFijo);
  const scvo = svCostoFijo;
  
  const suterh = round2(R * suterhPct);
  const fateryh = round2(R * faterhPct);
  const seracarh = round2(R * seracarhPct);

  return { f931, art, scvo, suterh, fateryh, seracarh };
}

export async function runCalculateExpenses(periodoId: number): Promise<{ warnings: string[] }> {
  return withTransaction(async (client) => {
    const warnings: string[] = [];

    async function query<T extends Record<string, unknown>>(
      sql: string,
      params?: unknown[]
    ): Promise<T[]> {
      const result = await client.query<T>(sql, params);
      return result.rows;
    }
    async function queryOne<T extends Record<string, unknown>>(
      sql: string,
      params?: unknown[]
    ): Promise<T | null> {
      const rows = await query<T>(sql, params);
      return rows[0] ?? null;
    }

  // 1. Fetch period
  const periodo = await queryOne<{
    consorcio_cuit: string;
    anio: number;
    mes: number;
    total_previsiones: number;
    monto_fijo: number | null;
  }>(
    "SELECT consorcio_cuit, anio, mes, COALESCE(total_previsiones, 0)::numeric AS total_previsiones, monto_fijo::numeric FROM app.periodos_expensas WHERE id = $1",
    [periodoId]
  );
  if (!periodo) {
    throw new Error(`Periodo con ID ${periodoId} no encontrado.`);
  }

  const cuit = periodo.consorcio_cuit;

  // 2. Fetch consorcio details
  const consorcio = await queryOne<{
    cuit: string;
    divisor_a: number;
    divisor_b: number;
    interest_rate: number;
    tipo_expensas: string;
    pct_expensa_a: number;
    formato_cobro: string;
  }>(
    "SELECT cuit, divisor_a, divisor_b, interest_rate, tipo_expensas, COALESCE(pct_expensa_a, 1)::numeric AS pct_expensa_a, COALESCE(formato_cobro, 'exacto') AS formato_cobro FROM app.consorcios WHERE cuit = $1",
    [cuit]
  );
  if (!consorcio) {
    throw new Error(`Consorcio con CUIT ${cuit} no encontrado.`);
  }

  const divisorA = consorcio.divisor_a || 100;
  const divisorB = consorcio.divisor_b || 100;

  // 3. Fetch all units for this consorcio
  const units = await query<{
    id: number;
    uf: number;
    uf_numero: number | null;
    depto: string;
    coef_a: number;
    coef_b: number;
  }>(
    "SELECT id, uf, uf_numero, depto, coef_a::numeric, coef_b::numeric FROM app.unidades WHERE consorcio_cuit = $1 ORDER BY uf",
    [cuit]
  );

  // 4. Fetch all expenses for this period
  const expenses = await query<{
    id: number;
    categoria: number;
    descripcion: string;
    monto: number;
    tipo: "A" | "B" | "Particular";
    unidad_id: number | null;
    pct_a: number;
  }>(
    "SELECT id, categoria, descripcion, monto::numeric, tipo, unidad_id, pct_a::numeric FROM app.gastos_periodo WHERE periodo_id = $1 AND provision_pagada = false",
    [periodoId]
  );

  // 5. Query manual overrides or existing res_cuenta_periodo details to keep custom values (like s_asamblea or otros)
  const existingResCuenta = await query<{
    unidad_id: number;
    s_asamblea: number;
    otros: number;
    saldo_anterior: number;
    su_pago: number;
  }>(
    "SELECT unidad_id, s_asamblea::numeric, otros::numeric, saldo_anterior::numeric, su_pago::numeric FROM app.res_cuenta_periodo WHERE periodo_id = $1",
    [periodoId]
  );
  const existingMap = new Map(existingResCuenta.map(r => [r.unidad_id, r]));

  // 6. Real per-period interest engine (Motor de Intereses Real):
  // load every pending deuda_periodo row for this consorcio (excluding the
  // period being calculated now, whose row is created fresh below) plus the
  // consorcio's historical rate registry, and compute interest per period
  // instead of a flat rate on the total balance.
  const deudaPeriodoRows = await query<{
    id: number;
    unidad_id: number;
    periodo_id: number;
    monto_original: number;
    monto_capital_pendiente: number;
    monto_intereses_acumulado: number;
    monto_intereses_pendiente: number;
    meses_atraso: number;
    estado: "pendiente" | "parcial" | "pagada";
    fecha_vencimiento: string;
  }>(
    `SELECT dp.id, dp.unidad_id, dp.periodo_id,
            dp.monto_original::numeric, dp.monto_capital_pendiente::numeric,
            dp.monto_intereses_acumulado::numeric, dp.monto_intereses_pendiente::numeric,
            dp.meses_atraso, dp.estado,
            COALESCE(pe.fecha_vencimiento, (pe.anio || '-' || LPAD(pe.mes::text, 2, '0') || '-01')::date) AS fecha_vencimiento
     FROM app.deuda_periodo dp
     JOIN app.periodos_expensas pe ON pe.id = dp.periodo_id
     JOIN app.unidades u ON u.id = dp.unidad_id
     WHERE u.consorcio_cuit = $1 AND dp.periodo_id != $2 AND dp.estado != 'pagada'
       AND (pe.anio < $3 OR (pe.anio = $3 AND pe.mes < $4))`,
    [cuit, periodoId, periodo.anio, periodo.mes]
  );

  const tasasRows = await query<{ tasa: number; fecha_desde: string; fecha_hasta: string | null }>(
    "SELECT tasa::numeric, fecha_desde, fecha_hasta FROM app.tasas_interes WHERE consorcio_cuit = $1",
    [cuit]
  );
  const tasas: TasaInteres[] = tasasRows.map(t => ({
    tasa: Number(t.tasa),
    fechaDesde: new Date(t.fecha_desde),
    fechaHasta: t.fecha_hasta ? new Date(t.fecha_hasta) : null,
  }));

  const deudasPorUnidad = new Map<number, DeudaPeriodo[]>();
  for (const row of deudaPeriodoRows) {
    const deuda: DeudaPeriodo = {
      id: row.id,
      unidadId: row.unidad_id,
      periodoId: row.periodo_id,
      montoOriginal: Number(row.monto_original),
      montoCapitalPendiente: Number(row.monto_capital_pendiente),
      montoInteresesAcumulado: Number(row.monto_intereses_acumulado),
      montoInteresesPendiente: Number(row.monto_intereses_pendiente),
      mesesAtraso: row.meses_atraso,
      estado: row.estado,
      fechaVencimiento: new Date(row.fecha_vencimiento),
    };
    const list = deudasPorUnidad.get(row.unidad_id) || [];
    list.push(deuda);
    deudasPorUnidad.set(row.unidad_id, list);
  }

  // Use the period being liquidated as the reference date for interest
  // calculation, not the wall-clock date, so recalculating an old period
  // does not accrue interest up to today.
  const fechaCalculo = new Date(Date.UTC(periodo.anio, periodo.mes - 1, 15));
  const interesesResultPorUnidad = new Map<
    number,
    { resultados: ReturnType<typeof calcularInteresesPeriodo>["resultados"]; deudas: DeudaPeriodo[] }
  >();
  for (const [unidadId, deudas] of deudasPorUnidad) {
    const { resultados, errores } = calcularInteresesPeriodo(deudas, tasas, fechaCalculo);
    if (errores.length > 0) {
      for (const e of errores) {
        const msg = `[interest-engine] unidad ${unidadId}, deuda_periodo ${e.deudaPeriodoId}: ${e.mensaje}`;
        console.warn(msg);
        warnings.push(msg);
      }
    }
    interesesResultPorUnidad.set(unidadId, { resultados, deudas });
  }

  // 7. Sum up expenses by type
  let totalPagosA = 0;
  let totalPagosB = 0;
  let totalGastosParticulares = 0;
  const unitParticularMap = new Map<number, number>(); // Map of unidad_id -> particular amount
  const unitAMap = new Map<number, number>(); // Map of unidad_id -> unit-specific Coef A amount (from split B expenses)
  const unitBMap = new Map<number, number>(); // Map of unidad_id -> unit-specific Coef B amount

  expenses.forEach(e => {
    const val = Number(e.monto || 0);
    if (e.tipo === "Particular") {
      totalGastosParticulares += val;
      if (e.unidad_id) {
        unitParticularMap.set(e.unidad_id, (unitParticularMap.get(e.unidad_id) || 0) + val);
      }
    } else {
      const montoA = round2(val * (Number(e.pct_a ?? 100) / 100));
      const montoB = round2(val - montoA);
      if (e.tipo === "B" && e.unidad_id) {
        if (montoA > 0) unitAMap.set(e.unidad_id, (unitAMap.get(e.unidad_id) || 0) + montoA);
        if (montoB > 0) unitBMap.set(e.unidad_id, (unitBMap.get(e.unidad_id) || 0) + montoB);
      } else if (e.tipo === "B") {
        totalPagosA += montoA;
        totalPagosB += montoB;
      } else {
        totalPagosA += montoA;
        totalPagosB += montoB;
      }
    }
  });

  const isFija = consorcio.tipo_expensas === "fija";
  const totalPrevisiones = Number(periodo.total_previsiones || 0);
  const pctA = Number(consorcio.pct_expensa_a);
  const montoFijo = Number(periodo.monto_fijo || 0);
  const totalProrrateoA = isFija
    ? round2(montoFijo * pctA)
    : round2(totalPagosA + totalPrevisiones);
  const totalProrrateoB = isFija ? round2(montoFijo * (1 - pctA)) : round2(totalPagosB);
  // Calculate total prorrateo including specific Coef B expenses and particulars for trace
  const totalBAndPart = isFija ? 0 : Array.from(unitBMap.values()).reduce((sum, v) => sum + v, 0);
  const totalProrrateoAyB = round2(totalProrrateoA + totalProrrateoB + totalBAndPart);

  // 8. Fetch payments in app.pagos for each unit in this period
  // We can query payments registered for this consorcio in this month
  const startDate = `${periodo.anio}-${String(periodo.mes).padStart(2, '0')}-01`;
  const endDate = `${periodo.anio}-${String(periodo.mes).padStart(2, '0')}-${new Date(periodo.anio, periodo.mes, 0).getDate()}`;
  
  const pagos = await query<{ unidad_id: number; total_pagos: number }>(
    `SELECT unidad_id, COALESCE(SUM(monto), 0)::numeric AS total_pagos 
     FROM app.pagos 
     WHERE consorcio_cuit = $1 AND fecha >= $2::date AND fecha <= $3::date
     GROUP BY unidad_id`,
    [cuit, startDate, endDate]
  );
  const pagosMap = new Map(pagos.map(p => [p.unidad_id, p.total_pagos]));

  // 8b. Fetch ALL historical payments for every unit in this consorcio, used
  // below to re-run FIFO imputation (interest before capital, Art. 776 CCyC)
  // against the freshly-recalculated deuda_periodo rows.
  const pagosHistoricos = await query<{ id: number; unidad_id: number; monto: number; fecha: string }>(
    `SELECT id, unidad_id, monto::numeric, fecha
     FROM app.pagos
     WHERE consorcio_cuit = $1
     ORDER BY fecha ASC`,
    [cuit]
  );
  const pagosPorUnidad = new Map<number, Pago[]>();
  for (const p of pagosHistoricos) {
    const list = pagosPorUnidad.get(p.unidad_id) || [];
    list.push({ id: p.id, monto: Number(p.monto), fecha: new Date(p.fecha) });
    pagosPorUnidad.set(p.unidad_id, list);
  }

  // 9. Calculate prorrateo for each unit and save to res_cuenta_periodo
  for (const u of units) {
    const expensasA = round2(totalProrrateoA * Number(u.coef_a) / divisorA) + (isFija ? 0 : round2(unitAMap.get(u.id) || 0));
    const expensasB = (isFija && pctA >= 1) ? 0 : round2(totalProrrateoB * Number(u.coef_b) / divisorB) + (isFija ? 0 : round2(unitBMap.get(u.id) || 0));
    const gastPart = isFija ? 0 : round2(unitParticularMap.get(u.id) || 0);

    const exist = existingMap.get(u.id);
    const sAsamblea = exist ? Number(exist.s_asamblea || 0) : 0;
    const otros = exist ? Number(exist.otros || 0) : 0;

    // Motor de Intereses Real: saldo_anterior is the sum of pending capital
    // across every unpaid deuda_periodo row for this unit (not derived from
    // the previous period's total_pagar), and intereses is the sum of the
    // real per-period interest calculated by calcularInteresesPeriodo,
    // instead of a flat rate applied to the whole balance.
    const unitInterestData = interesesResultPorUnidad.get(u.id);
    const intereses = unitInterestData
      ? round2(unitInterestData.resultados.reduce((sum, r) => sum + r.interesCalculado, 0))
      : 0;

    // Step 1: write the freshly-calculated theoretical interest back into
    // deuda_periodo (monto_intereses_acumulado = full accrual,
    // monto_intereses_pendiente = full accrual as well, for now). This MUST
    // run before the FIFO reimputación below, which then reduces
    // monto_intereses_pendiente/monto_capital_pendiente by whatever has
    // actually been paid — otherwise the write-back would clobber the
    // effect of past payments.
    if (unitInterestData) {
      for (const r of unitInterestData.resultados) {
        if (r.mesesAtraso <= 0) continue;
        await query(
          `UPDATE app.deuda_periodo SET
             monto_intereses_acumulado = $1,
             monto_intereses_pendiente = $2,
             meses_atraso = $3,
             updated_at = now()
           WHERE id = $4`,
          [r.interesCalculado, r.montoInteresesPendiente, r.mesesAtraso, r.deudaPeriodoId]
        );
      }
    }

    // Step 2: re-run FIFO payment imputation (interest before capital,
    // Art. 776 CCyC) across ALL of this unit's historical payments against
    // the just-refreshed deuda_periodo rows, so monto_capital_pendiente and
    // monto_intereses_pendiente correctly reflect what has actually been
    // paid instead of being silently overwritten by the interest recalc.
    let saldoAnterior = unitInterestData
      ? round2(unitInterestData.deudas.reduce((sum, d) => sum + d.montoCapitalPendiente, 0))
      : (exist ? Number(exist.saldo_anterior || 0) : 0);

    if (unitInterestData && unitInterestData.deudas.length > 0) {
      const resultadoPorDeudaId = new Map(unitInterestData.resultados.map(r => [r.deudaPeriodoId, r]));
      const deudasBase: DeudaPeriodo[] = unitInterestData.deudas.map(d => {
        const r = resultadoPorDeudaId.get(d.id);
        return r && r.mesesAtraso > 0 ? { ...d, montoInteresesAcumulado: r.interesCalculado } : d;
      });

      const pagosUnidad = pagosPorUnidad.get(u.id) || [];
      if (pagosUnidad.length > 0) {
        const { imputacionesPorPago, deudasFinales } = reimputarTodosPagos(deudasBase, pagosUnidad);
        const deudaIds = deudasBase.map(d => d.id);

        // Clear previous imputaciones for this unit's deudas before
        // persisting the freshly re-run FIFO allocation.
        await query(`DELETE FROM app.imputacion_pagos WHERE deuda_periodo_id = ANY($1::int[])`, [deudaIds]);

        for (const [pagoId, resultado] of imputacionesPorPago) {
          for (const imp of resultado.imputaciones) {
            await query(
              `INSERT INTO app.imputacion_pagos (pago_id, deuda_periodo_id, monto_a_interes, monto_a_capital, fecha)
               VALUES ($1, $2, $3, $4, now())`,
              [pagoId, imp.deudaPeriodoId, imp.montoAInteres, imp.montoACapital]
            );
          }
        }

        for (const df of deudasFinales) {
          await query(
            `UPDATE app.deuda_periodo SET
               monto_capital_pendiente = $1,
               monto_intereses_pendiente = $2,
               monto_intereses_acumulado = $3,
               estado = $4,
               updated_at = now()
             WHERE id = $5`,
            [df.montoCapitalPendiente, df.montoInteresesPendiente, df.montoInteresesAcumulado, df.estado, df.id]
          );
        }

        saldoAnterior = round2(deudasFinales.reduce((sum, d) => sum + d.montoCapitalPendiente, 0));

        // Any leftover credit from the last chronological payment becomes
        // the unit's current overpayment credit; prior open credits are
        // superseded by this fresh reimputación.
        const ultimoPago = pagosUnidad[pagosUnidad.length - 1];
        const resultadoUltimoPago = imputacionesPorPago.get(ultimoPago.id);
        const creditoFinal = resultadoUltimoPago ? resultadoUltimoPago.creditoRestante : 0;

        await query(
          `UPDATE app.credito_unidad SET aplicado = true WHERE unidad_id = $1 AND consorcio_cuit = $2 AND aplicado = false`,
          [u.id, cuit]
        );
        if (creditoFinal > 0) {
          await query(
            `INSERT INTO app.credito_unidad (unidad_id, consorcio_cuit, monto, aplicado)
             VALUES ($1, $2, $3, false)`,
            [u.id, cuit, creditoFinal]
          );
        }
      }
    }

    // su_pago: from pagos table or fallback to existing res_cuenta_periodo.su_pago
    const suPago = pagosMap.has(u.id)
      ? Number(pagosMap.get(u.id) || 0)
      : (exist ? Number(exist.su_pago || 0) : 0);

    const deuda = round2(saldoAnterior - suPago);

    const totalMes = round2(expensasA + expensasB + sAsamblea + otros + gastPart);
    let totalPagar = round2(totalMes + deuda + intereses);

    if (consorcio.formato_cobro === 'identificacion_uf' && u.uf_numero && totalPagar > 0) {
      const ufNum = u.uf_numero % 100;
      totalPagar = Math.floor(totalPagar) + ufNum / 100;
    }

    const estado = totalPagar <= 0 ? "pagada" : "pendiente";

    await query(
      `INSERT INTO app.res_cuenta_periodo
         (periodo_id, unidad_id, coef_a, coef_b, saldo_anterior, su_pago,
          expensas_a, expensas_b, s_asamblea, otros, gast_part, deuda, intereses, total_mes, total_pagar, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (periodo_id, unidad_id) DO UPDATE SET
         coef_a = EXCLUDED.coef_a,
         coef_b = EXCLUDED.coef_b,
         saldo_anterior = EXCLUDED.saldo_anterior,
         su_pago = EXCLUDED.su_pago,
         expensas_a = EXCLUDED.expensas_a,
         expensas_b = EXCLUDED.expensas_b,
         s_asamblea = EXCLUDED.s_asamblea,
         otros = EXCLUDED.otros,
         gast_part = EXCLUDED.gast_part,
         deuda = EXCLUDED.deuda,
         intereses = EXCLUDED.intereses,
         total_mes = EXCLUDED.total_mes,
         total_pagar = EXCLUDED.total_pagar,
         estado = EXCLUDED.estado,
         updated_at = now()`,
      [
        periodoId, u.id, u.coef_a, u.coef_b, saldoAnterior, suPago,
        expensasA, expensasB, sAsamblea, otros, gastPart, deuda, intereses, totalMes, totalPagar, estado
      ]
    );

    // Create/refresh the deuda_periodo row for the CURRENT period: it
    // represents this unit's newly generated debt (this period's expensas),
    // which starts with no accrued interest and becomes subject to the
    // interest engine once it is overdue in a future liquidación.
    const deudaPeriodoEstado = totalMes <= 0 ? "pagada" : "pendiente";
    await query(
      `INSERT INTO app.deuda_periodo
         (unidad_id, periodo_id, monto_original, monto_capital_pendiente,
          monto_intereses_acumulado, monto_intereses_pendiente, meses_atraso, estado)
       VALUES ($1, $2, $3, $3, 0, 0, 0, $4)
       ON CONFLICT (unidad_id, periodo_id) DO UPDATE SET
         monto_original = EXCLUDED.monto_original,
         monto_capital_pendiente = CASE
           WHEN app.deuda_periodo.monto_capital_pendiente = app.deuda_periodo.monto_original
           THEN EXCLUDED.monto_original
           ELSE app.deuda_periodo.monto_capital_pendiente + (EXCLUDED.monto_original - app.deuda_periodo.monto_original)
         END,
         estado = CASE WHEN app.deuda_periodo.monto_capital_pendiente < app.deuda_periodo.monto_original
                        THEN app.deuda_periodo.estado
                        ELSE EXCLUDED.estado END,
         updated_at = now()`,
      [u.id, periodoId, totalMes, deudaPeriodoEstado]
    );
  }

  // 10. Update periodos_expensas totals and status
  await query(
    `UPDATE app.periodos_expensas SET
       total_pagos_a_b = $1,
       total_gastos_particulares = $2,
       total_prorrateo_a_b = $3,
       estado = 'liquidado',
       fecha_cierre = CURRENT_DATE,
       updated_at = now()
     WHERE id = $4`,
    [totalProrrateoAyB, totalGastosParticulares, totalProrrateoAyB, periodoId]
  );

    return { warnings };
  });
}
