"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Converts a human-entered percentage (e.g. "4.5") into a decimal fraction (0.045)
function pctToDecimal(formData: FormData, field: string): number {
  const raw = Number(formData.get(field));
  if (isNaN(raw)) {
    throw new Error(`Datos inválidos: ${field}`);
  }
  return raw / 100;
}

export async function agregarParametroCCT(formData: FormData) {
  const fecha_desde = formData.get("fecha_desde") as string;
  const detraccion = Number(formData.get("detraccion_fija_mensual"));
  const detraccion_empleador = Number(formData.get("detraccion_fija_empleador"));
  const sv_costo_fijo = Number(formData.get("sv_costo_fijo"));

  if (!fecha_desde || isNaN(detraccion) || detraccion <= 0 || isNaN(detraccion_empleador) || isNaN(sv_costo_fijo) || sv_costo_fijo <= 0) {
    throw new Error("Datos inválidos");
  }

  const pct_suterh = pctToDecimal(formData, "pct_suterh");
  const pct_fateryh = pctToDecimal(formData, "pct_fateryh");
  const pct_seracarh = pctToDecimal(formData, "pct_seracarh");
  const pct_aportes_ss = pctToDecimal(formData, "pct_aportes_ss");
  const pct_aportes_os = pctToDecimal(formData, "pct_aportes_os");
  const pct_contrib_os = pctToDecimal(formData, "pct_contrib_os");
  const pct_contrib_ss = pctToDecimal(formData, "pct_contrib_ss");
  const pct_contrib_anssal = pctToDecimal(formData, "pct_contrib_anssal");
  const fateryh_art19bis = Number(formData.get("fateryh_art19bis") || 0);

  await query(
    `INSERT INTO app.parametros_cct (
       fecha_desde, detraccion_fija_mensual, detraccion_fija_empleador,
       pct_suterh, pct_fateryh, pct_seracarh,
       sv_costo_fijo,
       pct_aportes_ss, pct_aportes_os, pct_contrib_os, pct_contrib_ss, pct_contrib_anssal,
       fateryh_art19bis
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     ON CONFLICT (fecha_desde) DO UPDATE SET
       detraccion_fija_mensual = EXCLUDED.detraccion_fija_mensual,
       detraccion_fija_empleador = EXCLUDED.detraccion_fija_empleador,
       pct_suterh = EXCLUDED.pct_suterh,
       pct_fateryh = EXCLUDED.pct_fateryh,
       pct_seracarh = EXCLUDED.pct_seracarh,
       sv_costo_fijo = EXCLUDED.sv_costo_fijo,
       pct_aportes_ss = EXCLUDED.pct_aportes_ss,
       pct_aportes_os = EXCLUDED.pct_aportes_os,
       pct_contrib_os = EXCLUDED.pct_contrib_os,
       pct_contrib_ss = EXCLUDED.pct_contrib_ss,
       pct_contrib_anssal = EXCLUDED.pct_contrib_anssal,
       fateryh_art19bis = EXCLUDED.fateryh_art19bis`,
    [
      fecha_desde, detraccion, detraccion_empleador,
      pct_suterh, pct_fateryh, pct_seracarh,
      sv_costo_fijo,
      pct_aportes_ss, pct_aportes_os, pct_contrib_os, pct_contrib_ss, pct_contrib_anssal,
      fateryh_art19bis
    ]
  );

  revalidatePath("/configuracion/parametros");
  redirect("/configuracion/parametros");
}

export async function eliminarParametroCCT(id: number) {
  await query("DELETE FROM app.parametros_cct WHERE id = $1", [id]);
  revalidatePath("/configuracion/parametros");
}

export async function agregarParametroART(formData: FormData) {
  const consorcio_cuit = formData.get("consorcio_cuit") as string;
  const fecha_desde = formData.get("fecha_desde") as string;
  const art_pct_variable = Number(formData.get("art_pct_variable")) / 100;
  const art_costo_fijo = Number(formData.get("art_costo_fijo") || 0);

  if (!consorcio_cuit || !fecha_desde || isNaN(art_pct_variable)) {
    throw new Error("Datos inválidos");
  }

  await query(
    `INSERT INTO app.parametros_art_consorcio (consorcio_cuit, fecha_desde, art_pct_variable, art_costo_fijo)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (consorcio_cuit, fecha_desde) DO UPDATE SET
       art_pct_variable = EXCLUDED.art_pct_variable,
       art_costo_fijo = EXCLUDED.art_costo_fijo`,
    [consorcio_cuit, fecha_desde, art_pct_variable, art_costo_fijo]
  );

  revalidatePath("/configuracion/parametros");
  redirect("/configuracion/parametros");
}

export async function eliminarParametroART(id: number) {
  await query("DELETE FROM app.parametros_art_consorcio WHERE id = $1", [id]);
  revalidatePath("/configuracion/parametros");
}
