"use server";

import { liquidarIndemnizacion } from "@/lib/liquidacion/engine";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function accionLiquidarDespido(formData: FormData) {
  const empleadoId = Number(formData.get("empleado_id"));
  const fechaEgreso = String(formData.get("fecha_egreso"));
  const tipoEgreso = String(formData.get("tipo_egreso"));

  if (!empleadoId || empleadoId <= 0) throw new Error("Empleado inválido");
  if (!fechaEgreso || !/^\d{4}-\d{2}-\d{2}$/.test(fechaEgreso)) throw new Error("Fecha de egreso inválida");
  if (!tipoEgreso) throw new Error("Tipo de egreso requerido");

  await liquidarIndemnizacion(empleadoId, fechaEgreso, tipoEgreso);
  revalidatePath("/sueldos/despido");
  redirect(`/sueldos/despido?empleado_id=${empleadoId}&fecha_egreso=${fechaEgreso}&tipo_egreso=${tipoEgreso}&liquidado=1`);
}
