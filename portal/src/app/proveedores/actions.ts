"use server";

import { queryOne } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createProveedor(formData: FormData) {
  await queryOne(
    `INSERT INTO proveedores (nombre, rubro, telefono, email, whatsapp, cuit, notas)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      formData.get("nombre"),
      formData.get("rubro") || null,
      formData.get("telefono") || null,
      formData.get("email") || null,
      formData.get("whatsapp") || null,
      formData.get("cuit") || null,
      formData.get("notas") || null,
    ]
  );
  revalidatePath("/proveedores");
}

export async function createOrdenTrabajo(formData: FormData) {
  const ot = await queryOne<{ id: number }>(
    `INSERT INTO ordenes_trabajo (consorcio_id, descripcion, ticket_id, proveedor_id, fecha_programada, monto_presupuesto)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [
      Number(formData.get("consorcio_id")),
      formData.get("descripcion"),
      formData.get("ticket_id") ? Number(formData.get("ticket_id")) : null,
      formData.get("proveedor_id") ? Number(formData.get("proveedor_id")) : null,
      formData.get("fecha_programada") || null,
      formData.get("monto_presupuesto") ? Number(formData.get("monto_presupuesto")) : null,
    ]
  );
  if (ot && formData.get("ticket_id")) {
    await queryOne(
      "UPDATE tickets SET estado='esperando_proveedor' WHERE id=$1 AND estado NOT IN ('resuelto','cerrado')",
      [Number(formData.get("ticket_id"))]
    );
  }
  revalidatePath("/proveedores");
}
