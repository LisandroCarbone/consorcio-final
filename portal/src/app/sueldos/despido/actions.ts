"use server";

import { liquidarIndemnizacion } from "@/lib/liquidacion/engine";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { pool } from "@/lib/db";

export async function accionLiquidarDespido(formData: FormData) {
  const empleadoId = Number(formData.get("empleado_id"));
  const fechaEgreso = String(formData.get("fecha_egreso"));
  const tipoEgreso = String(formData.get("tipo_egreso"));

  if (!empleadoId) throw new Error("Empleado requerido");
  if (!fechaEgreso || !/^\d{4}-\d{2}-\d{2}$/.test(fechaEgreso)) throw new Error("Fecha de egreso inválida");
  if (!tipoEgreso) throw new Error("Tipo de egreso requerido");

  await liquidarIndemnizacion(empleadoId, fechaEgreso, tipoEgreso);
  revalidatePath("/sueldos/despido");
  revalidatePath("/sueldos");
  revalidatePath("/sueldos/empleados");
  revalidatePath("/sueldos/novedades");
  revalidatePath("/sueldos/liquidaciones");
  logAudit("create", "liquidacion_indemnizacion", empleadoId, { after: { fechaEgreso, tipoEgreso } });
}

export async function revertirEgresoAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const empleadoId = Number(formData.get("empleado_id"));
  if (!empleadoId) return { ok: false, error: "Empleado requerido" };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT estado, fecha_egreso FROM app.empleados WHERE id = $1`,
      [empleadoId]
    );
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return { ok: false, error: "Empleado no encontrado" };
    }
    if (rows[0].estado !== "inactivo" || !rows[0].fecha_egreso) {
      await client.query("ROLLBACK");
      return { ok: false, error: "Este empleado no tiene un egreso registrado para revertir" };
    }

    // Delete indemnización borrador if exists
    await client.query(
      `DELETE FROM app.liquidaciones_sueldo
       WHERE empleado_id = $1 AND tipo = 'indemnizacion' AND estado = 'borrador'`,
      [empleadoId]
    );

    // Check no active employee with same CUIL exists (rehired case)
    const { rows: dupeCheck } = await client.query(
      `SELECT id FROM app.empleados
       WHERE cuil = (SELECT cuil FROM app.empleados WHERE id = $1)
         AND consorcio_cuit = (SELECT consorcio_cuit FROM app.empleados WHERE id = $1)
         AND estado = 'activo' AND id != $1`,
      [empleadoId]
    );
    if (dupeCheck.length > 0) {
      await client.query("ROLLBACK");
      return { ok: false, error: "Ya existe un empleado activo con el mismo CUIL en este consorcio. Debe dar de baja al nuevo registro primero." };
    }

    // Restore employee to active
    await client.query(
      `UPDATE app.empleados
       SET estado = 'activo', fecha_egreso = NULL, tipo_egreso = NULL, updated_at = now()
       WHERE id = $1`,
      [empleadoId]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    return { ok: false, error: err instanceof Error ? err.message : "Error desconocido al revertir" };
  } finally {
    client.release();
  }

  logAudit("update", "revertir_egreso", empleadoId, { after: { action: "revertir" } });
  revalidatePath("/sueldos/despido");
  revalidatePath("/sueldos");
  revalidatePath("/sueldos/empleados");
  revalidatePath("/sueldos/novedades");
  revalidatePath("/sueldos/liquidaciones");
  return { ok: true };
}
