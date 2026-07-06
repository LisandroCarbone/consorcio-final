"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function agregarParametroCCT(formData: FormData) {
  const fecha_desde = formData.get("fecha_desde") as string;
  const detraccion = Number(formData.get("detraccion_fija_mensual"));

  if (!fecha_desde || isNaN(detraccion) || detraccion <= 0) {
    throw new Error("Datos inválidos");
  }

  await query(
    `INSERT INTO app.parametros_cct (fecha_desde, detraccion_fija_mensual)
     VALUES ($1, $2)
     ON CONFLICT (fecha_desde) DO UPDATE SET detraccion_fija_mensual = EXCLUDED.detraccion_fija_mensual`,
    [fecha_desde, detraccion]
  );

  revalidatePath("/configuracion/parametros-cct");
  redirect("/configuracion/parametros-cct");
}

export async function eliminarParametroCCT(id: number) {
  await query("DELETE FROM app.parametros_cct WHERE id = $1", [id]);
  revalidatePath("/configuracion/parametros-cct");
}
