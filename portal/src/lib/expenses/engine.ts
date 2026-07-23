import { query, queryOne } from "../db";

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

export async function runCalculateExpenses(periodoId: number): Promise<void> {
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
  const interestRate = consorcio.interest_rate !== undefined ? Number(consorcio.interest_rate) : 0.03;

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

  // 6. Find previous period
  let prevAnio = periodo.mes === 1 ? periodo.anio - 1 : periodo.anio;
  let prevMes = periodo.mes === 1 ? 12 : periodo.mes - 1;
  const prevPeriodo = await queryOne<{ id: number }>(
    "SELECT id FROM app.periodos_expensas WHERE consorcio_cuit = $1 AND anio = $2 AND mes = $3",
    [cuit, prevAnio, prevMes]
  );

  // Get previous period's total_pagar for each unit to carry over as saldo_anterior
  const prevResCuentaMap = new Map<number, number>(); // Map of unidad_id -> total_pagar
  if (prevPeriodo) {
    const prevResCuenta = await query<{ unidad_id: number; total_pagar: number }>(
      "SELECT unidad_id, total_pagar::numeric FROM app.res_cuenta_periodo WHERE periodo_id = $1",
      [prevPeriodo.id]
    );
    prevResCuenta.forEach(r => {
      prevResCuentaMap.set(r.unidad_id, r.total_pagar);
    });
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

  // 9. Calculate prorrateo for each unit and save to res_cuenta_periodo
  for (const u of units) {
    const expensasA = round2(totalProrrateoA * Number(u.coef_a) / divisorA) + (isFija ? 0 : round2(unitAMap.get(u.id) || 0));
    const expensasB = (isFija && pctA >= 1) ? 0 : round2(totalProrrateoB * Number(u.coef_b) / divisorB) + (isFija ? 0 : round2(unitBMap.get(u.id) || 0));
    const gastPart = isFija ? 0 : round2(unitParticularMap.get(u.id) || 0);

    const exist = existingMap.get(u.id);
    const sAsamblea = exist ? Number(exist.s_asamblea || 0) : 0;
    const otros = exist ? Number(exist.otros || 0) : 0;

    // Carryover saldo_anterior: either previous total_pagar or fallback to existing saldo_anterior
    const saldoAnterior = prevPeriodo 
      ? (prevResCuentaMap.get(u.id) || 0) 
      : (exist ? Number(exist.saldo_anterior || 0) : 0);

    // su_pago: from pagos table or fallback to existing res_cuenta_periodo.su_pago
    const suPago = pagosMap.has(u.id)
      ? Number(pagosMap.get(u.id) || 0)
      : (exist ? Number(exist.su_pago || 0) : 0);

    const deuda = round2(saldoAnterior - suPago);
    const intereses = deuda > 0 ? round2(deuda * interestRate) : 0;

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
}
