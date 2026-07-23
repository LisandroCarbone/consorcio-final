"use server";

import { query, queryOne, pool } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { runCalculateExpenses, calculateEmployerObligations, round2 } from "@/lib/expenses/engine";

export async function createPeriodo(formData: FormData): Promise<number | null> {
  const consorcio_cuit = formData.get("consorcio_id") as string;
  const anio = Number(formData.get("anio"));
  const mes = Number(formData.get("mes"));
  const fecha_vencimiento = (formData.get("fecha_vencimiento") as string) || null;
  const row = await queryOne<{ id: number }>(
    "INSERT INTO app.periodos_expensas (consorcio_cuit, anio, mes, estado, fecha_vencimiento) VALUES ($1,$2,$3,'abierto',$4) ON CONFLICT DO NOTHING RETURNING id",
    [consorcio_cuit, anio, mes, fecha_vencimiento]
  );

  if (row?.id) {
    await query(
      `UPDATE app.periodos_expensas SET monto_fijo = COALESCE(
         (SELECT monto_fijo FROM app.periodos_expensas
          WHERE consorcio_cuit = $1 AND id != $2
          ORDER BY anio DESC, mes DESC LIMIT 1),
         (SELECT monto_fijo_default FROM app.consorcios WHERE cuit = $1)
       ) WHERE id = $2`,
      [consorcio_cuit, row.id]
    );
  }

  revalidatePath("/expensas");
  return row?.id ?? null;
}

function resolvePctA(formData: FormData, tipo: string): number {
  const raw = formData.get("pct_a");
  if (raw !== null && raw !== "") {
    const n = Number(raw);
    if (!isNaN(n)) return n;
  }
  return tipo === "B" ? 0 : 100;
}

export async function addGasto(formData: FormData) {
  const periodo_id = Number(formData.get("periodo_id"));
  const concepto = formData.get("concepto") as string;
  const monto = Number(formData.get("monto"));
  const tipo = (formData.get("tipo") as string) || "A";
  const targetUf = formData.get("target_uf") as string;
  const categoria = Number(formData.get("categoria") || 10);
  const cuotas = Number(formData.get("cuotas") || 1);
  const pct_a = resolvePctA(formData, tipo);

  const period = await queryOne<{ consorcio_cuit: string; anio: number; mes: number }>(
    "SELECT consorcio_cuit, anio, mes FROM app.periodos_expensas WHERE id = $1",
    [periodo_id]
  );
  if (!period) throw new Error("Período no encontrado");

  let unidad_id = null;
  if (targetUf) {
    const ufNum = Number(targetUf.trim());
    if (!isNaN(ufNum)) {
      const unit = await queryOne<{ id: number }>(
        "SELECT id FROM app.unidades WHERE consorcio_cuit = $1 AND uf = $2",
        [period.consorcio_cuit, ufNum]
      );
      if (unit) {
        unidad_id = unit.id;
      }
    }
  }

  if (cuotas > 1) {
    const baseInstallment = round2(monto / cuotas);
    const lastInstallment = round2(monto - baseInstallment * (cuotas - 1));

    for (let c = 1; c <= cuotas; c++) {
      const currentMonto = c === cuotas ? lastInstallment : baseInstallment;

      // Calculate year and month
      let targetMonth = period.mes + (c - 1);
      let targetYear = period.anio;
      while (targetMonth > 12) {
        targetMonth -= 12;
        targetYear += 1;
      }

      // Check if target period exists
      let targetPeriod = await queryOne<{ id: number }>(
        "SELECT id FROM app.periodos_expensas WHERE consorcio_cuit = $1 AND anio = $2 AND mes = $3",
        [period.consorcio_cuit, targetYear, targetMonth]
      );

      // If it doesn't exist, create it
      if (!targetPeriod) {
        targetPeriod = await queryOne<{ id: number }>(
          `INSERT INTO app.periodos_expensas (consorcio_cuit, anio, mes, estado) 
           VALUES ($1, $2, $3, 'abierto') RETURNING id`,
          [period.consorcio_cuit, targetYear, targetMonth]
        );
      }

      const targetPeriodId = targetPeriod ? targetPeriod.id : periodo_id;

      await queryOne(
        `INSERT INTO app.gastos_periodo (periodo_id, categoria, descripcion, monto, tipo, unidad_id, orden, pct_a)
         VALUES ($1, $2, $3, $4, $5, $6, COALESCE((SELECT MAX(orden) FROM app.gastos_periodo WHERE periodo_id = $1 AND categoria = $2), 0) + 1, $7)`,
        [
          targetPeriodId,
          categoria,
          `${concepto} (Cuota ${c}/${cuotas})`,
          currentMonto,
          tipo,
          unidad_id,
          pct_a,
        ]
      );
    }
  } else {
    await queryOne(
      `INSERT INTO app.gastos_periodo (periodo_id, categoria, descripcion, monto, tipo, unidad_id, orden, pct_a)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE((SELECT MAX(orden) FROM app.gastos_periodo WHERE periodo_id = $1 AND categoria = $2), 0) + 1, $7)`,
      [periodo_id, categoria, concepto, monto, tipo, unidad_id, pct_a]
    );
  }

  revalidatePath("/expensas");
}

export async function deleteGasto(gastoId: number, periodoId: number) {
  await query("DELETE FROM app.gastos_periodo WHERE id = $1", [gastoId]);
  revalidatePath("/expensas");
}

export async function moverGasto(gastoId: number, direction: "up" | "down") {
  const gasto = await queryOne<{ periodo_id: number; categoria: number; orden: number }>(
    "SELECT periodo_id, categoria, orden FROM app.gastos_periodo WHERE id = $1",
    [gastoId]
  );
  if (!gasto) return;

  const neighbor = await queryOne<{ id: number; orden: number }>(
    direction === "up"
      ? "SELECT id, orden FROM app.gastos_periodo WHERE periodo_id = $1 AND categoria = $2 AND orden < $3 ORDER BY orden DESC LIMIT 1"
      : "SELECT id, orden FROM app.gastos_periodo WHERE periodo_id = $1 AND categoria = $2 AND orden > $3 ORDER BY orden ASC LIMIT 1",
    [gasto.periodo_id, gasto.categoria, gasto.orden]
  );
  if (!neighbor) return;

  await query("UPDATE app.gastos_periodo SET orden = $1 WHERE id = $2", [neighbor.orden, gastoId]);
  await query("UPDATE app.gastos_periodo SET orden = $1 WHERE id = $2", [gasto.orden, neighbor.id]);
  revalidatePath("/expensas");
}

export async function updateGasto(formData: FormData) {
  const id = Number(formData.get("id"));
  const periodoId = Number(formData.get("periodo_id"));
  const tipo = formData.get("tipo") as string;
  const pct_a = resolvePctA(formData, tipo);
  await query(
    `UPDATE app.gastos_periodo SET descripcion=$1, monto=$2, categoria=$3, tipo=$4, pct_a=$5 WHERE id=$6`,
    [
      formData.get("concepto") as string,
      Number(formData.get("monto")),
      Number(formData.get("categoria")),
      tipo,
      pct_a,
      id,
    ]
  );
  revalidatePath("/expensas");
}

export async function updatePeriodoVencimiento(periodoId: number, fechaVencimiento: string | null) {
  await query(
    "UPDATE app.periodos_expensas SET fecha_vencimiento = $1 WHERE id = $2",
    [fechaVencimiento || null, periodoId]
  );
  revalidatePath("/expensas");
}

export async function deletePeriodo(periodoId: number) {
  await query("DELETE FROM app.periodos_expensas WHERE id = $1 AND estado = 'abierto'", [periodoId]);
  revalidatePath("/expensas");
}

// ── Previsiones / Provisiones ──────────────────────────────────────────────

export async function addProvision(formData: FormData) {
  const periodo_id = Number(formData.get("periodo_id"));
  const concepto = formData.get("concepto") as string;
  const monto = Number(formData.get("monto"));
  const tipo = (formData.get("tipo") as string) || "A";
  const categoria = Number(formData.get("categoria") || 10);
  const pct_a = resolvePctA(formData, tipo);

  await query(
    `INSERT INTO app.gastos_periodo (periodo_id, categoria, descripcion, monto, tipo, es_provision, orden, pct_a)
     VALUES ($1, $2, $3, $4, $5, true, COALESCE((SELECT MAX(orden) FROM app.gastos_periodo WHERE periodo_id = $1 AND categoria = $2), 0) + 1, $6)`,
    [periodo_id, categoria, concepto, monto, tipo, pct_a]
  );
  revalidatePath("/expensas");
}

export async function marcarProvisionPagada(provisionId: number, periodoIdPago: number) {
  await query(
    `UPDATE app.gastos_periodo SET provision_pagada = true, provision_pagada_periodo_id = $1 WHERE id = $2 AND es_provision = true`,
    [periodoIdPago, provisionId]
  );
  revalidatePath("/expensas");
}

export async function deleteProvision(provisionId: number) {
  await query("DELETE FROM app.gastos_periodo WHERE id = $1 AND es_provision = true", [provisionId]);
  revalidatePath("/expensas");
}

// ── Estado Financiero ─────────────────────────────────────────────────────

export async function updateEstadoFinanciero(formData: FormData) {
  const periodoId = Number(formData.get("periodo_id"));
  const saldoAnterior = Number(formData.get("ef_saldo_anterior") || 0);
  const cobranzasSinId = Number(formData.get("ef_cobranzas_sin_identificar") || 0);
  const gastosExtra = formData.get("ef_gastos_extra") as string || "[]";

  await query(
    `UPDATE app.periodos_expensas
     SET ef_saldo_anterior = $1, ef_cobranzas_sin_identificar = $2, ef_gastos_extra = $3
     WHERE id = $4`,
    [saldoAnterior, cobranzasSinId, gastosExtra, periodoId]
  );
  revalidatePath("/expensas");
}

// ── Recurring expenses helpers ─────────────────────────────────────────────

export async function getGastosAnteriores(periodoId: number): Promise<{
  gastos: { id: number; descripcion: string; monto: string; categoria: number; tipo: string; pct_a: number }[];
  sourcePeriodo: { id: number; anio: number; mes: number } | null;
}> {
  const period = await queryOne<{ consorcio_cuit: string }>(
    "SELECT consorcio_cuit FROM app.periodos_expensas WHERE id = $1",
    [periodoId]
  );
  if (!period) return { gastos: [], sourcePeriodo: null };

  const currentPeriod = await queryOne<{ anio: number; mes: number }>(
    "SELECT anio, mes FROM app.periodos_expensas WHERE id = $1",
    [periodoId]
  );
  if (!currentPeriod) return { gastos: [], sourcePeriodo: null };

  const sourcePeriodo = await queryOne<{ id: number; anio: number; mes: number }>(
    `SELECT id, anio, mes FROM app.periodos_expensas
     WHERE consorcio_cuit = $1 AND (anio < $2 OR (anio = $2 AND mes < $3))
     ORDER BY anio DESC, mes DESC LIMIT 1`,
    [period.consorcio_cuit, currentPeriod.anio, currentPeriod.mes]
  );
  if (!sourcePeriodo) return { gastos: [], sourcePeriodo: null };

  const gastos = await query<{ id: number; descripcion: string; monto: string; categoria: number; tipo: string; pct_a: number }>(
    `SELECT id, descripcion, monto::numeric, categoria, tipo, pct_a::numeric
     FROM app.gastos_periodo
     WHERE periodo_id = $1 AND categoria > 1 AND es_provision = false
     ORDER BY categoria, descripcion`,
    [sourcePeriodo.id]
  );

  return { gastos, sourcePeriodo };
}

export async function copiarGastos(periodoId: number, gastoIds: number[]) {
  for (const gastoId of gastoIds) {
    const g = await queryOne<{ descripcion: string; monto: string; categoria: number; tipo: string; pct_a: number }>(
      "SELECT descripcion, monto::numeric, categoria, tipo, pct_a::numeric FROM app.gastos_periodo WHERE id = $1",
      [gastoId]
    );
    if (!g) continue;
    await query(
      "INSERT INTO app.gastos_periodo (periodo_id, categoria, descripcion, monto, tipo, pct_a) VALUES ($1, $2, $3, $4, $5, $6)",
      [periodoId, g.categoria, g.descripcion, g.monto, g.tipo, g.pct_a]
    );
  }
  revalidatePath("/expensas");
}

export async function buscarGastosSimilares(
  periodoId: number,
  texto: string
): Promise<{ descripcion: string; monto: string; categoria: number; tipo: string; pct_a: number }[]> {
  if (texto.length < 3) return [];
  const period = await queryOne<{ consorcio_cuit: string }>(
    "SELECT consorcio_cuit FROM app.periodos_expensas WHERE id = $1",
    [periodoId]
  );
  if (!period) return [];

  return query<{ descripcion: string; monto: string; categoria: number; tipo: string; pct_a: number }>(
    `SELECT DISTINCT ON (g.descripcion) g.descripcion, g.monto::numeric, g.categoria, g.tipo, g.pct_a::numeric
     FROM app.gastos_periodo g
     JOIN app.periodos_expensas p ON p.id = g.periodo_id
     WHERE p.consorcio_cuit = $1 AND p.id != $2 AND g.categoria > 1
       AND g.descripcion ILIKE $3
     ORDER BY g.descripcion, p.anio DESC, p.mes DESC
     LIMIT 8`,
    [period.consorcio_cuit, periodoId, `%${texto}%`]
  );
}

// ────────────────────────────────────────────────────────────────────────────

export async function calcularExpensas(periodo_id: number) {
  try {
    await runCalculateExpenses(periodo_id);
  } catch (err) {
    console.error("Error calculating expenses:", err);
  }
  revalidatePath("/expensas");
}

export async function actualizarMontoFijo(formData: FormData) {
  const periodo_id = Number(formData.get("periodo_id"));
  const raw = (formData.get("monto_fijo") as string) || "0";
  const monto_fijo = Number(raw);
  if (!periodo_id || isNaN(monto_fijo) || monto_fijo < 0) throw new Error("Datos inválidos");
  await query("UPDATE app.periodos_expensas SET monto_fijo = $1 WHERE id = $2", [monto_fijo, periodo_id]);
  revalidatePath("/expensas");
}

export async function marcarPagada(expensa_id: number) {
  await query(
    "UPDATE app.res_cuenta_periodo SET estado='pagada' WHERE id=$1",
    [expensa_id]
  );
  revalidatePath("/expensas");
}

// ─── Regenerar Gastos Fijos (Categoría 1) ────────────────────────────────────
// Rebuilds all Category 1 expenses for a period: net salaries per employee +
// consolidated employer obligations from previous month's confirmed payroll.
export async function regenerarGastosFijos(periodoId: number) {
  const period = await queryOne<{ consorcio_cuit: string; anio: number; mes: number }>(
    "SELECT consorcio_cuit, anio, mes FROM app.periodos_expensas WHERE id = $1",
    [periodoId]
  );
  if (!period) throw new Error(`Período ${periodoId} no encontrado`);

  const { consorcio_cuit, anio, mes } = period;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Delete auto-generated Category 1 expenses (keep manually added ones)
    await client.query(
      `DELETE FROM app.gastos_periodo WHERE periodo_id = $1 AND categoria = 1
       AND (liquidacion_id IS NOT NULL
            OR descripcion LIKE 'ARCA AFIP F. 931:%'
            OR descripcion LIKE 'SUTERH %'
            OR descripcion LIKE 'FATERYH %')`,
      [periodoId]
    );

    // 2. Fetch confirmed liquidaciones of this period
    const periodDate = `${anio}-${String(mes).padStart(2, "0")}-01`;
    const currentLiqs = await client.query(
      `SELECT l.id, l.empleado_cuil, l.tipo, l.neto_a_pagar::numeric AS neto_a_pagar, e.nombre
       FROM app.liquidaciones_sueldo l
       JOIN app.empleados e ON e.cuil = l.empleado_cuil
       WHERE e.consorcio_cuit = $1 AND l.periodo = $2 AND l.estado = 'confirmada'`,
      [consorcio_cuit, periodDate]
    );

    // 3. Insert net salary row per employee
    for (const liq of currentLiqs.rows) {
      let desc = "";
      if (liq.tipo === "mensual") desc = `${liq.nombre} (${liq.empleado_cuil}): sueldo neto`;
      else if (liq.tipo === "sac_1") desc = `${liq.nombre} (${liq.empleado_cuil}): 1° aguinaldo y bonificación`;
      else if (liq.tipo === "sac_2") desc = `${liq.nombre} (${liq.empleado_cuil}): 2° aguinaldo y bonificación`;
      else if (liq.tipo === "indemnizacion") desc = `${liq.nombre} (${liq.empleado_cuil}): liquidación final`;

      if (desc && Number(liq.neto_a_pagar) > 0) {
        await client.query(
          `INSERT INTO app.gastos_periodo (periodo_id, categoria, descripcion, monto, tipo, liquidacion_id)
           VALUES ($1, 1, $2, $3, 'A', $4)`,
          [periodoId, desc, liq.neto_a_pagar, liq.id]
        );
      }
    }

    // 4. Employer obligations from PREVIOUS month's confirmed mensual payroll
    let prevAnio = anio;
    let prevMes = mes - 1;
    if (prevMes === 0) { prevMes = 12; prevAnio -= 1; }
    const prevPeriodStr = `${prevAnio}-${String(prevMes).padStart(2, "0")}-01`;

    let obligLiqs = await client.query(
      `SELECT l.id, l.empleado_cuil, l.remuneracion_bruta::numeric AS remuneracion_bruta, e.funcion, e.jornada
       FROM app.liquidaciones_sueldo l
       JOIN app.empleados e ON e.cuil = l.empleado_cuil
       WHERE e.consorcio_cuit = $1 AND l.periodo = $2 AND l.estado = 'confirmada' AND l.tipo = 'mensual'`,
      [consorcio_cuit, prevPeriodStr]
    );
    const usedPeriodStr = obligLiqs.rows.length > 0 ? prevPeriodStr : periodDate;
    if (obligLiqs.rows.length === 0) {
      obligLiqs = await client.query(
        `SELECT l.id, l.empleado_cuil, l.remuneracion_bruta::numeric AS remuneracion_bruta, e.funcion, e.jornada
         FROM app.liquidaciones_sueldo l
         JOIN app.empleados e ON e.cuil = l.empleado_cuil
         WHERE e.consorcio_cuit = $1 AND l.periodo = $2 AND l.estado = 'confirmada' AND l.tipo = 'mensual'`,
        [consorcio_cuit, periodDate]
      );
    }

    // CCT parameters (SUTERH/FATERYH/SERACARH, SCVO and AFIP F.931 rates vigentes al período usado)
    const cctRes = await client.query(
      `SELECT detraccion_fija_mensual::numeric, detraccion_fija_empleador::numeric,
              pct_suterh::numeric, pct_fateryh::numeric, pct_seracarh::numeric,
              sv_costo_fijo::numeric,
              pct_aportes_ss::numeric, pct_aportes_os::numeric,
              pct_contrib_os::numeric, pct_contrib_ss::numeric, pct_contrib_anssal::numeric,
              fateryh_art19bis::numeric
       FROM app.parametros_cct
       WHERE fecha_desde <= $1 ORDER BY fecha_desde DESC LIMIT 1`,
      [usedPeriodStr]
    );
    const cct = cctRes.rows[0];
    const detraccionBase = Number(cct?.detraccion_fija_mensual || 12003.68);
    const detraccionEmpleador = Number(cct?.detraccion_fija_empleador || 0);
    const suterhPct = Number(cct?.pct_suterh || 0.045);
    const faterhPct = Number(cct?.pct_fateryh || 0.065);
    const seracarhPct = Number(cct?.pct_seracarh || 0.005);
    const svFijo = Number(cct?.sv_costo_fijo || 430.62);
    const pctAportesSS = Number(cct?.pct_aportes_ss || 0.1445);
    const pctAportesOS = Number(cct?.pct_aportes_os || 0.0255);
    const pctContribOS = Number(cct?.pct_contrib_os || 0.051);
    const pctContribSS = Number(cct?.pct_contrib_ss || 0.18);
    const pctContribANSSAL = Number(cct?.pct_contrib_anssal || 0.009);

    const art19bis = Number(cct?.fateryh_art19bis || 0);

    // SCVO annual renewal
    const consRes = await client.query(
      "SELECT sv_renueva_mes, COALESCE(sv_costo_emision, 0)::numeric AS sv_costo_emision FROM app.consorcios WHERE cuit = $1",
      [consorcio_cuit]
    );
    const svRenuevaMes = consRes.rows[0]?.sv_renueva_mes ? Number(consRes.rows[0].sv_renueva_mes) : null;
    const svCostoEmision = Number(consRes.rows[0]?.sv_costo_emision || 0);

    // ART rates per consorcio with vigency
    const artRes = await client.query(
      `SELECT art_pct_variable::numeric, art_costo_fijo::numeric
       FROM app.parametros_art_consorcio
       WHERE consorcio_cuit = $1 AND fecha_desde <= $2
       ORDER BY fecha_desde DESC LIMIT 1`,
      [consorcio_cuit, usedPeriodStr]
    );
    const artPct = Number(artRes.rows[0]?.art_pct_variable || 0.0639);
    const artCostoFijo = Number(artRes.rows[0]?.art_costo_fijo || 0);

    // SAC months (June=6, December=12): F931 detracción × 1.5
    const usedMes = usedPeriodStr === prevPeriodStr ? prevMes : mes;
    const isSacPeriod = usedMes === 6 || usedMes === 12;

    // In SAC months, fetch SAC liquidaciones and build a map of SAC bruto per employee
    const sacBrutoMap = new Map<string, number>();
    if (isSacPeriod) {
      const sacTipo = usedMes === 6 ? "sac_1" : "sac_2";
      const sacLiqs = await client.query(
        `SELECT l.empleado_cuil, l.remuneracion_bruta::numeric AS remuneracion_bruta
         FROM app.liquidaciones_sueldo l
         JOIN app.empleados e ON e.cuil = l.empleado_cuil
         WHERE e.consorcio_cuit = $1 AND l.periodo = $2 AND l.estado = 'confirmada' AND l.tipo = $3`,
        [consorcio_cuit, usedPeriodStr, sacTipo]
      );
      for (const s of sacLiqs.rows) {
        sacBrutoMap.set(s.empleado_cuil, Number(s.remuneracion_bruta || 0));
      }
    }

    // Accumulate obligations
    let f931 = 0, art = 0, scvo = 0, suterh = 0, fateryh = 0, seracarh = 0;
    let art19bisTotal = 0;

    for (const liq of obligLiqs.rows) {
      const brutoMensual = Number(liq.remuneracion_bruta || 0);
      const brutoSac = sacBrutoMap.get(liq.empleado_cuil) || 0;
      const bruto = brutoMensual + brutoSac;
      const novRes = await client.query(
        "SELECT dias_trabajados_suplente::numeric, horas_jornada::numeric FROM app.novedades_sueldo WHERE empleado_cuil = $1 AND periodo = $2 LIMIT 1",
        [liq.empleado_cuil, usedPeriodStr]
      );
      const diasSuplente = novRes.rows.length > 0 ? Number(novRes.rows[0].dias_trabajados_suplente) : 30;
      const horasJornada = novRes.rows.length > 0 && novRes.rows[0].horas_jornada != null ? Number(novRes.rows[0].horas_jornada) : 8;
      const diffOsRes = await client.query(
        "SELECT importe::numeric AS importe FROM app.conceptos_liquidacion WHERE liquidacion_id = $1 AND (code = '5150' OR concepto LIKE '%Diferencia Obra Social%') LIMIT 1",
        [liq.id]
      );
      const diffOsVal = diffOsRes.rows.length > 0 ? Number(diffOsRes.rows[0].importe) : 0;

      const ob = calculateEmployerObligations(
        bruto, liq.funcion, liq.jornada, diasSuplente, artPct, svFijo, diffOsVal,
        suterhPct, faterhPct, seracarhPct, isSacPeriod, artCostoFijo, detraccionBase,
        pctAportesSS, pctAportesOS, pctContribOS, pctContribSS, pctContribANSSAL
      );
      f931 += ob.f931; art += ob.art; scvo += ob.scvo;
      suterh += ob.suterh; fateryh += ob.fateryh; seracarh += ob.seracarh;

      // Art.19bis: media jornada ×0.5, suplente ×(horas_trabajadas/200), completa ×1
      let art19bisFactor = 1;
      const jornada = String(liq.jornada || "");
      if (jornada === "Media") {
        art19bisFactor = 0.5;
      } else if (jornada === "Suplente") {
        art19bisFactor = (diasSuplente * horasJornada) / 200;
      }
      art19bisTotal += art19bis * art19bisFactor;
    }

    const sacMultiplier = isSacPeriod ? 1.5 : 1;
    art19bisTotal = Math.round(art19bisTotal * sacMultiplier * 100) / 100;

    f931   = Math.round((f931 - detraccionEmpleador) * 100) / 100;
    art    = Math.round(art    * 100) / 100;
    if (svRenuevaMes && mes === svRenuevaMes && svCostoEmision > 0) {
      scvo += svCostoEmision;
    }
    scvo   = Math.round(scvo   * 100) / 100;
    suterh = Math.round(suterh * 100) / 100;
    fateryh   = Math.round((fateryh + art19bisTotal) * 100) / 100;
    seracarh  = Math.round(seracarh  * 100) / 100;

    const pText = `${String(prevMes).padStart(2, "0")}/${String(prevAnio).slice(-2)}`;
    const ins = async (desc: string, monto: number) => {
      if (monto <= 0) return;
      await client.query(
        "INSERT INTO app.gastos_periodo (periodo_id, categoria, descripcion, monto, tipo) VALUES ($1, 1, $2, $3, 'A')",
        [periodoId, desc, monto]
      );
    };
    await ins(`ARCA AFIP F. 931: Cargas sociales: SIJP y Obra social ${pText}`, f931);
    await ins(`ARCA AFIP F. 931: ART ${pText}`, art);
    await ins(`ARCA AFIP F. 931: SCVO ${pText}`, scvo);
    await ins(`SUTERH ${pText}`, suterh);
    await ins(`FATERYH ${pText}`, fateryh);
    await ins(`FATERYH SERACARH ${pText}`, seracarh);

    // Mark liquidaciones as gastos_generados
    if (currentLiqs.rows.length > 0) {
      const ids = currentLiqs.rows.map((l: { id: number }) => l.id).join(",");
      await client.query(
        `UPDATE app.liquidaciones_sueldo SET gastos_generados = true WHERE id IN (${ids})`
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  revalidatePath("/expensas");
}

export async function distribuirExpensasMasivo(periodoId: number) {
  const period = await queryOne<{ consorcio_cuit: string; anio: number; mes: number }>(
    "SELECT consorcio_cuit, anio, mes FROM app.periodos_expensas WHERE id = $1",
    [periodoId]
  );
  if (!period) throw new Error("Período no encontrado");

  const agentUrl = process.env.EXPENSAS_AGENT_URL ?? "http://localhost:3001";
  const apiKey = process.env.AGENT_API_KEY ?? "changeme";

  const res = await fetch(`${agentUrl}/run-expensas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify({
      consorcio_id: period.consorcio_cuit,
      anio: period.anio,
      mes: period.mes
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error en el agente de expensas: ${text}`);
  }

  revalidatePath("/expensas");
  return await res.json();
}

export async function distribuirExpensaIndividual(resCuentaId: number) {
  const agentUrl = process.env.EXPENSAS_AGENT_URL ?? "http://localhost:3001";
  const apiKey = process.env.AGENT_API_KEY ?? "changeme";

  const res = await fetch(`${agentUrl}/send-expensa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify({ res_cuenta_id: resCuentaId })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error en el agente de expensas: ${text}`);
  }

  revalidatePath("/expensas");
  return await res.json();
}
