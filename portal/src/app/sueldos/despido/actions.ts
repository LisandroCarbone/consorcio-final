"use server";

import { liquidarIndemnizacion } from "@/lib/liquidacion/engine";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function accionLiquidarDespido(formData: FormData) {
  const empleadoCuil = String(formData.get("empleado_cuil") || formData.get("empleado_id") || "");
  const fechaEgreso = String(formData.get("fecha_egreso"));
  const tipoEgreso = String(formData.get("tipo_egreso"));

  if (!empleadoCuil) throw new Error("CUIL del Empleado requerido");
  if (!fechaEgreso || !/^\d{4}-\d{2}-\d{2}$/.test(fechaEgreso)) throw new Error("Fecha de egreso inválida");
  if (!tipoEgreso) throw new Error("Tipo de egreso requerido");

  await liquidarIndemnizacion(empleadoCuil, fechaEgreso, tipoEgreso);
  revalidatePath("/sueldos/despido");
  redirect(`/sueldos/despido?empleado_cuil=${empleadoCuil}&fecha_egreso=${fechaEgreso}&tipo_egreso=${tipoEgreso}&liquidado=1`);
}
