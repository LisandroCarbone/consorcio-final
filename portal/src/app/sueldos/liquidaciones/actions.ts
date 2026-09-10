"use server";

import { calcularLiquidacionesPeriodo, confirmarLiquidacion } from "../actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function recalcularPeriodoAction(formData: FormData) {
  const periodo = String(formData.get("periodo"));
  const tipo = String(formData.get("tipo") ?? "mensual");

  if (tipo === "sac_1" || tipo === "sac_2") {
    redirect(`/sueldos/liquidaciones?periodo=${periodo}&tipo=${tipo}&ok=sac_noop`);
  }

  const result = await calcularLiquidacionesPeriodo(periodo);
  revalidatePath("/sueldos/liquidaciones");
  if (result.errores.length > 0 && result.ok === 0) {
    redirect(`/sueldos/liquidaciones?periodo=${periodo}&tipo=${tipo}&ok=error`);
  }
  if (result.errores.length > 0) {
    redirect(`/sueldos/liquidaciones?periodo=${periodo}&tipo=${tipo}&ok=recalculado_parcial&errores=${result.errores.length}`);
  }
  redirect(`/sueldos/liquidaciones?periodo=${periodo}&tipo=${tipo}&ok=recalculado`);
}

export async function confirmarLiquidacionAction(formData: FormData) {
  const id = Number(formData.get("id"));
  await confirmarLiquidacion(id);
  revalidatePath("/sueldos/liquidaciones");
}

export async function updateFechaPago(liquidacionId: number, fecha: string) {
  await pool.query(
    "UPDATE app.liquidaciones_sueldo SET fecha_pago = $1, updated_at = now() WHERE id = $2",
    [fecha, liquidacionId]
  );
  revalidatePath(`/sueldos/liquidaciones/${liquidacionId}`);
}

export async function setUltimoDepositoManual(
  consorcioCuit: string,
  anio: number,
  mes: number,
  banco: string,
  fecha: string,
  liquidacionId: number
) {
  await pool.query(
    `INSERT INTO app.ultimo_deposito_manual (consorcio_cuit, periodo_anio, periodo_mes, banco, fecha_deposito)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (consorcio_cuit, periodo_anio, periodo_mes)
     DO UPDATE SET banco = EXCLUDED.banco, fecha_deposito = EXCLUDED.fecha_deposito, updated_at = now()`,
    [consorcioCuit, anio, mes, banco || null, fecha || null]
  );
  revalidatePath(`/sueldos/liquidaciones/${liquidacionId}`);
}

// Deletes draft/pending-review liquidaciones for a periodo, so the period
// can be recalculated from scratch. Never touches confirmed liquidaciones.
//
// Note: app.pagos (unidad payments) has no FK to liquidaciones_sueldo — it is
// unrelated to payroll. The real "money already committed" signal for a
// payroll liquidación is app.gastos_periodo.liquidacion_id, which only gets
// set when a liquidación is confirmed (see confirmarLiquidacion in
// ../actions.ts). Since this action only ever targets 'borrador' /
// 'requiere_revision' rows, that link should never exist here — but we check
// it defensively anyway before deleting.
export async function limpiarPeriodoSueldos(
  formData: FormData
): Promise<{ ok: number; blocked: string | null }> {
  const periodo = String(formData.get("periodo"));
  const tipo = String(formData.get("tipo") ?? "mensual");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const targetRes = await client.query(
      `SELECT l.id
         FROM app.liquidaciones_sueldo l
         JOIN app.empleados e ON e.id = l.empleado_id
        WHERE l.periodo = $1
          AND l.tipo = $2
          AND l.estado IN ('borrador', 'requiere_revision')`,
      [periodo, tipo]
    );
    const ids: number[] = targetRes.rows.map((r) => r.id);

    if (ids.length === 0) {
      await client.query("ROLLBACK");
      return { ok: 0, blocked: null };
    }

    // Defensive check: block if any of these liquidaciones already generated
    // expensas (gastos_periodo). This should never happen for borrador /
    // requiere_revision rows, but we refuse to delete if it does.
    const gastosRes = await client.query(
      `SELECT COUNT(*)::int AS count
         FROM app.gastos_periodo
        WHERE liquidacion_id = ANY($1::int[])`,
      [ids]
    );
    if (gastosRes.rows[0].count > 0) {
      await client.query("ROLLBACK");
      return {
        ok: 0,
        blocked:
          "No se puede limpiar el período: hay liquidaciones con expensas ya generadas.",
      };
    }

    // conceptos_liquidacion has ON DELETE CASCADE on liquidacion_id, so
    // deleting liquidaciones_sueldo removes its conceptos automatically.
    const deleteRes = await client.query(
      `DELETE FROM app.liquidaciones_sueldo
        WHERE periodo = $1
          AND tipo = $2
          AND estado IN ('borrador', 'requiere_revision')`,
      [periodo, tipo]
    );

    await client.query("COMMIT");

    const count = deleteRes.rowCount ?? 0;
    logAudit("delete", "liquidacion_periodo", 0, {
      after: { periodo, tipo, count },
    });
    revalidatePath("/sueldos/liquidaciones");

    return { ok: count, blocked: null };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function clearUltimoDepositoManual(
  consorcioCuit: string,
  anio: number,
  mes: number,
  liquidacionId: number
) {
  await pool.query(
    "DELETE FROM app.ultimo_deposito_manual WHERE consorcio_cuit = $1 AND periodo_anio = $2 AND periodo_mes = $3",
    [consorcioCuit, anio, mes]
  );
  revalidatePath(`/sueldos/liquidaciones/${liquidacionId}`);
}
