"use server";

import { pool } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function registrarPago(formData: FormData) {
  const consorcio_cuit = formData.get("consorcio_id") as string;
  const unidad_id    = Number(formData.get("unidad_id"));
  const res_cuenta_id = formData.get("expensa_id") ? Number(formData.get("expensa_id")) : null;
  const fecha        = String(formData.get("fecha"));
  const monto        = Number(formData.get("monto"));
  const medio_pago   = String(formData.get("medio_pago"));
  const referencia   = formData.get("referencia")?.toString() || null;
  const notas        = formData.get("notas")?.toString() || null;

  if (!consorcio_cuit) throw new Error("Consorcio CUIT requerido");
  if (!unidad_id || unidad_id <= 0) throw new Error("Unidad inválida");
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new Error("Fecha inválida");
  if (!monto || isNaN(monto) || monto <= 0) throw new Error("Monto inválido");
  if (!medio_pago) throw new Error("Medio de pago requerido");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO app.pagos (consorcio_cuit, unidad_id, res_cuenta_id, fecha, monto, medio_pago, referencia, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [consorcio_cuit, unidad_id, res_cuenta_id, fecha, monto, medio_pago, referencia, notas]
    );

    // If linked to a specific res_cuenta_periodo, mark it as paid
    if (res_cuenta_id) {
      const { rowCount } = await client.query(
        `UPDATE app.res_cuenta_periodo SET estado='pagada', fecha_pago=$1, updated_at=now()
         WHERE id=$2 AND unidad_id=$3`,
        [fecha, res_cuenta_id, unidad_id]
      );
      if (!rowCount) throw new Error("Estado de expensa no encontrado o no pertenece a la unidad");
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }

  revalidatePath("/finanzas/cuenta-corriente");
}
