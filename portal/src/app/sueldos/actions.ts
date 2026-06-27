"use server";

import { pool, query, queryOne } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { calcularLiquidacion as engineCalcLiquidacion, calcularPeriodo } from "@/lib/liquidacion/engine";
import { calculateEmployerObligations } from "@/lib/expenses/engine";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EmpleadoForm {
  cuil: string;
  nombre: string;
  legajo?: string;
  fecha_nacimiento?: string;
  fecha_ingreso: string;
  consorcio_cuit: string;
  funcion: string;
  categoria_edificio: number;
  jornada: "Completa" | "Media" | "Suplente";
  tiene_vivienda: boolean;
  obra_social?: string;
  cod_obra_social?: number;
  banco?: string;
  cbu?: string;
  retiro_residuos: boolean;
  clasificacion_residuos: boolean;
  plus_cocheras: boolean;
  plus_movimiento_coches: boolean;
  plus_jardin: boolean;
  plus_zona_desfavorable: boolean;
  plus_pileta: boolean;
  tiene_titulo: boolean;
  adicional_voluntario: number;
}

export interface NovedadesForm {
  empleado_cuil: string;
  periodo: string; // YYYY-MM-01
  dias_trabajados_suplente: number;
  horas_jornada?: number;
  horas_extras_50: number;
  horas_extras_100: number;
  feriados_trabajados_hs: number;
  suplencia_100_hs: number;
  plus_vacaciones_dias: number;
  dias_no_trabajados: number;
  licencia_enfermedad: number;
  adicional_voluntario: number;
  embargo: number;
  anticipo: number;
  muerte: number;
  observaciones?: string;
}

// ─── Empleados ────────────────────────────────────────────────────────────────

export interface EmpleadoRow {
  cuil: string;
  nombre: string;
  legajo: string | null;
  funcion: string;
  jornada: string;
  consorcio_cuit: string;
  consorcio_nombre: string;
  antiguedad_anios: number;
  [key: string]: unknown;
}

export async function getEmpleados(consorcioCuit?: string): Promise<EmpleadoRow[]> {
  return query<EmpleadoRow>(
    `SELECT e.*, c.nombre AS consorcio_nombre,
            EXTRACT(YEAR FROM AGE(NOW(), e.fecha_ingreso))::int AS antiguedad_anios
     FROM app.empleados e
     JOIN app.consorcios c ON c.cuit = e.consorcio_cuit
     WHERE e.estado = 'activo'
     ${consorcioCuit ? "AND e.consorcio_cuit = $1" : ""}
     ORDER BY c.nombre, e.nombre`,
    consorcioCuit ? [consorcioCuit] : []
  );
}

export async function createEmpleado(data: EmpleadoForm) {
  if (!data.nombre?.trim()) throw new Error("Nombre requerido");
  if (!data.cuil?.trim()) throw new Error("CUIL requerido");
  if (!data.consorcio_cuit?.trim()) throw new Error("Consorcio CUIT requerido");
  if (!data.fecha_ingreso) throw new Error("Fecha de ingreso requerida");

  const db = pool;
  await db.query(
    `INSERT INTO app.empleados
       (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_cuit,
        funcion, categoria_edificio, jornada, tiene_vivienda,
        obra_social, cod_obra_social, banco, cbu,
        retiro_residuos, clasificacion_residuos, plus_cocheras,
        plus_movimiento_coches, plus_jardin, plus_zona_desfavorable,
        plus_pileta, tiene_titulo, adicional_voluntario)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
             $15,$16,$17,$18,$19,$20,$21,$22,$23)`,
    [
      data.cuil, data.nombre, data.legajo || null,
      data.fecha_nacimiento || null, data.fecha_ingreso, data.consorcio_cuit,
      data.funcion, data.categoria_edificio, data.jornada, data.tiene_vivienda,
      data.obra_social || null, data.cod_obra_social || null,
      data.banco || null, data.cbu || null,
      data.retiro_residuos, data.clasificacion_residuos, data.plus_cocheras,
      data.plus_movimiento_coches, data.plus_jardin, data.plus_zona_desfavorable,
      data.plus_pileta, data.tiene_titulo, data.adicional_voluntario,
    ]
  );
  revalidatePath("/sueldos");
}

// ─── Novedades ────────────────────────────────────────────────────────────────

export async function getNovedadesPeriodo(periodo: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return query<any>(
    `SELECT n.*, e.nombre AS empleado_nombre, e.funcion,
            c.nombre AS consorcio_nombre
     FROM app.novedades_sueldo n
     JOIN app.empleados e ON e.cuil = n.empleado_cuil
     JOIN app.consorcios c ON c.cuit = e.consorcio_cuit
     WHERE n.periodo = $1
     ORDER BY c.nombre, e.nombre`,
    [periodo]
  );
}

export async function upsertNovedades(data: NovedadesForm) {
  const db = pool;
  await db.query(
    `INSERT INTO app.novedades_sueldo
       (empleado_cuil, periodo, dias_trabajados_suplente, horas_jornada,
        horas_extras_50, horas_extras_100, feriados_trabajados_hs,
        suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
        licencia_enfermedad, adicional_voluntario, embargo, anticipo,
        muerte, observaciones)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     ON CONFLICT (empleado_cuil, periodo)
     DO UPDATE SET
       dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
       horas_jornada            = EXCLUDED.horas_jornada,
       horas_extras_50          = EXCLUDED.horas_extras_50,
       horas_extras_100         = EXCLUDED.horas_extras_100,
       feriados_trabajados_hs   = EXCLUDED.feriados_trabajados_hs,
       suplencia_100_hs         = EXCLUDED.suplencia_100_hs,
       plus_vacaciones_dias     = EXCLUDED.plus_vacaciones_dias,
       dias_no_trabajados       = EXCLUDED.dias_no_trabajados,
       licencia_enfermedad      = EXCLUDED.licencia_enfermedad,
       adicional_voluntario     = EXCLUDED.adicional_voluntario,
       embargo                  = EXCLUDED.embargo,
       anticipo                 = EXCLUDED.anticipo,
       muerte                   = EXCLUDED.muerte,
       observaciones            = EXCLUDED.observaciones,
       updated_at               = now()`,
    [
      data.empleado_cuil, data.periodo, data.dias_trabajados_suplente,
      data.horas_jornada ?? null, data.horas_extras_50, data.horas_extras_100,
      data.feriados_trabajados_hs, data.suplencia_100_hs, data.plus_vacaciones_dias,
      data.dias_no_trabajados, data.licencia_enfermedad, data.adicional_voluntario,
      data.embargo, data.anticipo, data.muerte, data.observaciones ?? null,
    ]
  );
  revalidatePath("/sueldos/novedades");
}

// ─── Escalas ──────────────────────────────────────────────────────────────────

export async function getEscalasPeriodo(periodo: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [escalas, adicionales] = await Promise.all([
    query<any>("SELECT * FROM app.escalas_suterh WHERE periodo = $1 ORDER BY funcion", [periodo]),
    query<any>("SELECT * FROM app.adicionales_suterh WHERE periodo = $1 ORDER BY concepto", [periodo]),
  ]);
  return { escalas, adicionales };
}

export async function getUltimaEscala() {
  const row = await queryOne<{ periodo: string }>(
    "SELECT DISTINCT periodo FROM app.escalas_suterh ORDER BY periodo DESC LIMIT 1"
  );
  return row?.periodo ?? null;
}

export async function calcularLiquidacion(empleadoCuil: string, periodo: string) {
  const result = await engineCalcLiquidacion(empleadoCuil, periodo);
  revalidatePath("/sueldos/liquidaciones");
  return result;
}

export async function getLiquidacionesPeriodo(periodo: string, tipo = "mensual", activeCuit?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (activeCuit) {
    return query<any>(
      `SELECT l.*, e.nombre AS empleado_nombre, e.funcion, e.jornada,
              c.nombre AS consorcio_nombre
       FROM app.liquidaciones_sueldo l
       JOIN app.empleados e ON e.cuil = l.empleado_cuil
       JOIN app.consorcios c ON c.cuit = e.consorcio_cuit
       WHERE l.periodo = $1 AND l.tipo = $2 AND e.consorcio_cuit = $3
       ORDER BY c.nombre, e.nombre`,
      [periodo, tipo, activeCuit]
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return query<any>(
    `SELECT l.*, e.nombre AS empleado_nombre, e.funcion, e.jornada,
            c.nombre AS consorcio_nombre
     FROM app.liquidaciones_sueldo l
     JOIN app.empleados e ON e.cuil = l.empleado_cuil
     JOIN app.consorcios c ON c.cuit = e.consorcio_cuit
     WHERE l.periodo = $1 AND l.tipo = $2
     ORDER BY c.nombre, e.nombre`,
    [periodo, tipo]
  );
}


export async function getLiquidacionDetalle(liquidacionId: number) {
  const liq = await queryOne(
    `SELECT l.*, e.nombre AS empleado_nombre, e.cuil, e.legajo, e.funcion, e.jornada,
            e.obra_social, e.cod_obra_social, e.banco, e.cbu,
            e.fecha_ingreso,
            EXTRACT(YEAR FROM AGE(l.periodo::date, e.fecha_ingreso))::int AS antiguedad_anios,
            c.nombre AS consorcio_nombre, c.cuit AS consorcio_cuit,
            c.suterh_key,
            c.art_pct_variable, c.art_fijo,
            c.sv_costo_fijo, c.sv_cant_cuiles,
            c.pct_cct_suterh, c.pct_cct_seracarh,
            c.pct_contrib_jubilacion, c.pct_contrib_obra_social, c.pct_cct_fateryh
     FROM app.liquidaciones_sueldo l
     JOIN app.empleados e ON e.cuil = l.empleado_cuil
     JOIN app.consorcios c ON c.cuit = e.consorcio_cuit
     WHERE l.id = $1`,
    [liquidacionId]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conceptos = await query<any>(
    "SELECT * FROM app.conceptos_liquidacion WHERE liquidacion_id = $1 ORDER BY orden",
    [liquidacionId]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return liq ? { ...(liq as any), conceptos } : null;
}

async function regenerateCategory1Expenses(
  consorcioCuit: string,
  anio: number,
  mes: number,
  client: any
) {
  // 1. Get or create periodos_expensas for the current period
  let periodExp = await client.query(`
    SELECT id FROM app.periodos_expensas
    WHERE consorcio_cuit = $1 AND anio = $2 AND mes = $3
  `, [consorcioCuit, anio, mes]);

  let periodId: number;
  if (periodExp.rows.length === 0) {
    const newPeriod = await client.query(`
      INSERT INTO app.periodos_expensas (consorcio_cuit, anio, mes, estado)
      VALUES ($1, $2, $3, 'abierto')
      RETURNING id
    `, [consorcioCuit, anio, mes]);
    periodId = newPeriod.rows[0].id;
  } else {
    periodId = periodExp.rows[0].id;
  }

  // 2. Delete ALL existing Category 1 expenses for this period_id
  await client.query(`
    DELETE FROM app.gastos_periodo
    WHERE periodo_id = $1 AND categoria = 1
  `, [periodId]);

  // 3. Fetch all confirmed liquidaciones of this period for this consorcio
  const periodDate = `${anio}-${String(mes).padStart(2, '0')}-01`;
  const currentLiqsRes = await client.query(`
    SELECT l.id, l.empleado_cuil, l.tipo, l.neto_a_pagar::numeric AS neto_a_pagar,
           e.nombre
    FROM app.liquidaciones_sueldo l
    JOIN app.empleados e ON e.cuil = l.empleado_cuil
    WHERE e.consorcio_cuit = $1 AND l.periodo = $2 AND l.estado = 'confirmada'
  `, [consorcioCuit, periodDate]);

  // 4. Generate Sueldo Neto/SAC Net expenses for each confirmed liquidación
  for (const liq of currentLiqsRes.rows) {
    let descSalario = "";
    if (liq.tipo === 'mensual') {
      descSalario = `${liq.nombre} (${liq.empleado_cuil}): sueldo neto`;
    } else if (liq.tipo === 'sac_1') {
      descSalario = `${liq.nombre} (${liq.empleado_cuil}): 1° aguinaldo y bonificación`;
    } else if (liq.tipo === 'sac_2') {
      descSalario = `${liq.nombre} (${liq.empleado_cuil}): 2° aguinaldo y bonificación`;
    } else if (liq.tipo === 'indemnizacion') {
      descSalario = `${liq.nombre} (${liq.empleado_cuil}): liquidación final`;
    }

    if (descSalario && Number(liq.neto_a_pagar) > 0) {
      await client.query(`
        INSERT INTO app.gastos_periodo (periodo_id, categoria, descripcion, monto, tipo, liquidacion_id)
        VALUES ($1, 1, $2, $3, 'A', $4)
      `, [periodId, descSalario, liq.neto_a_pagar, liq.id]);
    }
  }

  // 5. Determine employer obligations based on the PREVIOUS month's confirmed mensual payroll
  let prevAnio = anio;
  let prevMes = mes - 1;
  if (prevMes === 0) {
    prevMes = 12;
    prevAnio -= 1;
  }
  const prevPeriodStr = `${prevAnio}-${String(prevMes).padStart(2, '0')}-01`;

  // Fetch previous confirmed mensual liquidaciones
  let obligationsLiqsRes = await client.query(`
    SELECT l.id, l.empleado_cuil, l.remuneracion_bruta::numeric AS remuneracion_bruta,
           e.nombre, e.funcion, e.jornada
    FROM app.liquidaciones_sueldo l
    JOIN app.empleados e ON e.cuil = l.empleado_cuil
    WHERE e.consorcio_cuit = $1 AND l.periodo = $2 AND l.estado = 'confirmada' AND l.tipo = 'mensual'
  `, [consorcioCuit, prevPeriodStr]);

  let usedPeriodStr = prevPeriodStr;

  // Fallback: if previous period has no confirmed mensual liquidaciones, try current period
  if (obligationsLiqsRes.rows.length === 0) {
    obligationsLiqsRes = await client.query(`
      SELECT l.id, l.empleado_cuil, l.remuneracion_bruta::numeric AS remuneracion_bruta,
             e.nombre, e.funcion, e.jornada
      FROM app.liquidaciones_sueldo l
      JOIN app.empleados e ON e.cuil = l.empleado_cuil
      WHERE e.consorcio_cuit = $1 AND l.periodo = $2 AND l.estado = 'confirmada' AND l.tipo = 'mensual'
    `, [consorcioCuit, periodDate]);
    usedPeriodStr = periodDate;
  }

  // Fetch consorcio details (needed for ART variable rate, SCVO fixed rate)
  const consRes = await client.query(`
    SELECT art_pct_variable::numeric AS art_pct_variable, sv_costo_fijo::numeric AS sv_costo_fijo
    FROM app.consorcios
    WHERE cuit = $1
  `, [consorcioCuit]);

  const currentCons = consRes.rows[0] || {};
  const artPct = Number(currentCons.art_pct_variable || 0.0639);
  const svFijo = Number(currentCons.sv_costo_fijo || 424.62);

  // Accumulate obligations
  let f931Total = 0;
  let artTotal = 0;
  let scvoTotal = 0;
  let suterhTotal = 0;
  let fateryhTotal = 0;
  let seracarhTotal = 0;

  for (const liq of obligationsLiqsRes.rows) {
    const bruto = Number(liq.remuneracion_bruta || 0);

    // Query novedades for this employee in the used period
    const novRes = await client.query(`
      SELECT dias_trabajados_suplente::numeric AS dias_trabajados_suplente
      FROM app.novedades_sueldo
      WHERE empleado_cuil = $1 AND periodo = $2
      LIMIT 1
    `, [liq.empleado_cuil, usedPeriodStr]);
    const diasSuplente = novRes.rows.length > 0 ? Number(novRes.rows[0].dias_trabajados_suplente) : 30;

    // Query concept '5150' or Difference OS Ley 26475 for this liquidación
    const diffOsRes = await client.query(`
      SELECT importe::numeric AS importe
      FROM app.conceptos_liquidacion
      WHERE liquidacion_id = $1 AND (code = '5150' OR concepto LIKE '%Diferencia Obra Social%')
      LIMIT 1
    `, [liq.id]);
    const diffOsVal = diffOsRes.rows.length > 0 ? Number(diffOsRes.rows[0].importe) : 0;

    // Calculate employer obligations
    const ob = calculateEmployerObligations(
      bruto,
      liq.funcion,
      liq.jornada,
      diasSuplente,
      artPct,
      svFijo,
      diffOsVal
    );

    f931Total += ob.f931;
    artTotal += ob.art;
    scvoTotal += ob.scvo;
    suterhTotal += ob.suterh;
    fateryhTotal += ob.fateryh;
    seracarhTotal += ob.seracarh;
  }

  // Round totals
  f931Total = Math.round(f931Total * 100) / 100;
  artTotal = Math.round(artTotal * 100) / 100;
  scvoTotal = Math.round(scvoTotal * 100) / 100;
  suterhTotal = Math.round(suterhTotal * 100) / 100;
  fateryhTotal = Math.round(fateryhTotal * 100) / 100;
  seracarhTotal = Math.round(seracarhTotal * 100) / 100;

  // Insert consolidated obligations (if any)
  const prevPeriodText = `${String(prevMes).padStart(2, '0')}/${String(prevAnio).slice(-2)}`;

  const insertObligation = async (desc: string, amount: number) => {
    if (amount <= 0) return;
    await client.query(`
      INSERT INTO app.gastos_periodo (periodo_id, categoria, descripcion, monto, tipo)
      VALUES ($1, 1, $2, $3, 'A')
    `, [periodId, desc, amount]);
  };

  await insertObligation(`ARCA AFIP F. 931: Cargas sociales: SIJP y Obra social ${prevPeriodText}`, f931Total);
  await insertObligation(`ARCA AFIP F. 931: ART ${prevPeriodText}`, artTotal);
  await insertObligation(`ARCA AFIP F. 931: SCVO ${prevPeriodText}`, scvoTotal);
  await insertObligation(`SUTERH ${prevPeriodText}`, suterhTotal);
  await insertObligation(`FATERYH ${prevPeriodText}`, fateryhTotal);
  await insertObligation(`FATERYH SERACARH ${prevPeriodText}`, seracarhTotal);

  // Set gastos_generados = true for all confirmed liquidaciones in the current period
  if (currentLiqsRes.rows.length > 0) {
    const ids = currentLiqsRes.rows.map((l: any) => l.id).join(",");
    await client.query(`
      UPDATE app.liquidaciones_sueldo
      SET gastos_generados = true
      WHERE id IN (${ids})
    `);
  }
}

export async function confirmarLiquidacion(liquidacionId: number) {
  const db = pool;
  const client = await db.connect();
  
  try {
    await client.query("BEGIN");

    // 1. Update status
    await client.query(
      "UPDATE app.liquidaciones_sueldo SET estado = 'confirmada', updated_at = now() WHERE id = $1",
      [liquidacionId]
    );

    // 2. Fetch current liquidación to get CUIT and period
    const liqRes = await client.query(`
      SELECT l.periodo::text, e.consorcio_cuit
      FROM app.liquidaciones_sueldo l
      JOIN app.empleados e ON e.cuil = l.empleado_cuil
      WHERE l.id = $1
    `, [liquidacionId]);

    if (liqRes.rows.length === 0) {
      throw new Error(`Liquidación ${liquidacionId} no encontrada`);
    }
    const currentLiq = liqRes.rows[0];

    const [yStr, mStr] = currentLiq.periodo.split("-");
    const anio = parseInt(yStr, 10);
    const mes = parseInt(mStr, 10);

    // 3. Regenerate Category 1 Expenses (consolidated)
    await regenerateCategory1Expenses(currentLiq.consorcio_cuit, anio, mes, client);

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  revalidatePath("/sueldos/liquidaciones");
  revalidatePath("/expensas");
}

// ─── Calcular todas las liquidaciones de un período ──────────────────────────

export async function calcularLiquidacionesPeriodo(periodo: string) {
  const result = await calcularPeriodo(periodo);
  revalidatePath("/sueldos/liquidaciones");
  return result;
}

export async function getFondoEducacion(periodo: string): Promise<boolean> {
  const row = await queryOne<{ valor: string }>(
    `SELECT valor FROM app.adicionales_suterh WHERE periodo = $1 AND concepto_key = 'fondo_educacion'`,
    [periodo]
  );
  return !!row;
}

export async function upsertFondoEducacion(periodo: string, activo: boolean): Promise<void> {
  if (activo) {
    await query(
      `INSERT INTO app.adicionales_suterh (periodo, concepto, concepto_key, valor, fuente_url)
       VALUES ($1, 'Fondo Educación y Comunicación Art. 19 bis', 'fondo_educacion', 1, 'manual')
       ON CONFLICT (periodo, concepto) DO UPDATE SET concepto_key = EXCLUDED.concepto_key, valor = EXCLUDED.valor`,
      [periodo]
    );
  } else {
    await query(
      `DELETE FROM app.adicionales_suterh WHERE periodo = $1 AND concepto_key = 'fondo_educacion'`,
      [periodo]
    );
  }
  revalidatePath("/sueldos/novedades");
}

export async function getConceptosAdicionalesPeriodo(
  periodo: string, consorcioCuit: string
): Promise<{ id: number; concepto: string; tipo: string; importe: number; es_porcentaje: boolean }[]> {
  const { rows } = await pool.query(
    `SELECT id, concepto, tipo, importe::numeric AS importe, es_porcentaje
     FROM app.conceptos_adicionales_periodo
     WHERE periodo = $1 AND consorcio_cuit = $2 ORDER BY id`,
    [periodo, consorcioCuit]
  );
  return rows.map(r => ({ ...r, importe: Number(r.importe), es_porcentaje: Boolean(r.es_porcentaje) }));
}

export async function upsertConceptoAdicionalPeriodo(
  periodo: string, consorcioCuit: string, concepto: string, tipo: string, importe: number, esPorcentaje = false
): Promise<void> {
  await query(
    `INSERT INTO app.conceptos_adicionales_periodo (periodo, consorcio_cuit, concepto, tipo, importe, es_porcentaje)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (periodo, consorcio_cuit, concepto) DO UPDATE SET tipo = EXCLUDED.tipo, importe = EXCLUDED.importe, es_porcentaje = EXCLUDED.es_porcentaje`,
    [periodo, consorcioCuit, concepto, tipo, importe, esPorcentaje]
  );
  revalidatePath("/sueldos/novedades");
}

export async function deleteConceptoAdicionalPeriodo(id: number): Promise<void> {
  await query(`DELETE FROM app.conceptos_adicionales_periodo WHERE id = $1`, [id]);
  revalidatePath("/sueldos/novedades");
}

export async function getAdicionalRemuneratorio(periodo: string): Promise<number | null> {
  const row = await queryOne<{ valor: string }>(
    `SELECT valor::numeric::text AS valor FROM app.adicionales_suterh
     WHERE periodo = $1 AND concepto_key = 'adicional_remuneratorio_mensual'`,
    [periodo]
  );
  return row ? Number(row.valor) : null;
}

export async function upsertAdicionalRemuneratorio(periodo: string, valor: number): Promise<void> {
  await query(
    `INSERT INTO app.adicionales_suterh (periodo, concepto, concepto_key, valor, fuente_url)
     VALUES ($1, 'Adicional Remuneratorio Mensual', 'adicional_remuneratorio_mensual', $2, 'manual')
     ON CONFLICT (periodo, concepto) DO UPDATE SET valor = EXCLUDED.valor, concepto_key = EXCLUDED.concepto_key`,
    [periodo, valor]
  );
  revalidatePath("/sueldos/novedades");
}
