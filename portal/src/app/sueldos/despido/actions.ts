"use server";

import { liquidarIndemnizacion } from "@/lib/liquidacion/engine";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

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
