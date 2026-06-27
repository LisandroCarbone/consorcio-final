"use server";

import { query, queryOne, pool } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { runCalculateExpenses, calculateEmployerObligations, round2 } from "@/lib/expenses/engine";
import { calcularLiquidacionesPeriodo } from "@/app/sueldos/actions";

export async function createPeriodo(formData: FormData) {
  const consorcio_cuit = formData.get("consorcio_id") as string;
  const anio = Number(formData.get("anio"));
  const mes = Number(formData.get("mes"));
  const fecha_vencimiento = (formData.get("fecha_vencimiento") as string) || null;
  const row = await queryOne<{ id: number }>(
    "INSERT INTO app.periodos_expensas (consorcio_cuit, anio, mes, estado, fecha_vencimiento) VALUES ($1,$2,$3,'abierto',$4) ON CONFLICT DO NOTHING RETURNING id",
    [consorcio_cuit, anio, mes, fecha_vencimiento]
  );
  revalidatePath("/expensas");
  if (row?.id) redirect(`/expensas?periodo=${row.id}`);
}

export async function addGasto(formData: FormData) {
  const periodo_id = Number(formData.get("periodo_id"));
  const concepto = formData.get("concepto") as string;
  const monto = Number(formData.get("monto"));
  const tipo = (formData.get("tipo") as string) || "A";
  const targetUf = formData.get("target_uf") as string;
  const categoria = Number(formData.get("categoria") || 10);
  const cuotas = Number(formData.get("cuotas") || 1);

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
        `INSERT INTO app.gastos_periodo (periodo_id, categoria, descripcion, monto, tipo, unidad_id) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          targetPeriodId,
          categoria,
          `${concepto} (Cuota ${c}/${cuotas})`,
          currentMonto,
          tipo,
          unidad_id,
        ]
      );
    }
  } else {
    await queryOne(
      `INSERT INTO app.gastos_periodo (periodo_id, categoria, descripcion, monto, tipo, unidad_id) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [periodo_id, categoria, concepto, monto, tipo, unidad_id]
    );
  }

  revalidatePath("/expensas");
}

export async function calcularExpensas(periodo_id: number) {
  try {
    await runCalculateExpenses(periodo_id);
  } catch (err) {
    console.error("Error calculating expenses:", err);
  }
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
  const periodDate = `${anio}-${String(mes).padStart(2, "0")}-01`;

  // First trigger sueldos calculations for the period (Task 8)
  try {
    await calcularLiquidacionesPeriodo(periodDate);
  } catch (err) {
    console.error("Error running calcularLiquidacionesPeriodo during Category 1 regeneration:", err);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Delete existing Category 1 expenses
    await client.query(
      "DELETE FROM app.gastos_periodo WHERE periodo_id = $1 AND categoria = 1",
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

    // Consorcio ART/SCVO rates
    const consRes = await client.query(
      "SELECT art_pct_variable::numeric, sv_costo_fijo::numeric FROM app.consorcios WHERE cuit = $1",
      [consorcio_cuit]
    );
    const artPct = Number(consRes.rows[0]?.art_pct_variable || 0.0639);
    const svFijo = Number(consRes.rows[0]?.sv_costo_fijo || 424.62);

    // Accumulate obligations
    let f931 = 0, art = 0, scvo = 0, suterh = 0, fateryh = 0, seracarh = 0;

    for (const liq of obligLiqs.rows) {
      const bruto = Number(liq.remuneracion_bruta || 0);
      const novRes = await client.query(
        "SELECT dias_trabajados_suplente::numeric FROM app.novedades_sueldo WHERE empleado_cuil = $1 AND periodo = $2 LIMIT 1",
        [liq.empleado_cuil, usedPeriodStr]
      );
      const diasSuplente = novRes.rows.length > 0 ? Number(novRes.rows[0].dias_trabajados_suplente) : 30;
      const diffOsRes = await client.query(
        "SELECT importe::numeric AS importe FROM app.conceptos_liquidacion WHERE liquidacion_id = $1 AND (code = '5150' OR concepto LIKE '%Diferencia Obra Social%') LIMIT 1",
        [liq.id]
      );
      const diffOsVal = diffOsRes.rows.length > 0 ? Number(diffOsRes.rows[0].importe) : 0;

      const ob = calculateEmployerObligations(bruto, liq.funcion, liq.jornada, diasSuplente, artPct, svFijo, diffOsVal);
      f931 += ob.f931; art += ob.art; scvo += ob.scvo;
      suterh += ob.suterh; fateryh += ob.fateryh; seracarh += ob.seracarh;
    }

    f931   = Math.round(f931   * 100) / 100;
    art    = Math.round(art    * 100) / 100;
    scvo   = Math.round(scvo   * 100) / 100;
    suterh = Math.round(suterh * 100) / 100;
    fateryh   = Math.round(fateryh   * 100) / 100;
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
  redirect(`/expensas?periodo=${periodoId}`);
}
