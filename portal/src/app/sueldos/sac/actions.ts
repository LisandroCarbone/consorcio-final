"use server";

import { liquidarSAC } from "@/lib/liquidacion/engine";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function accionLiquidarSAC(formData: FormData) {
  const empleadoId = Number(formData.get("empleado_id"));
  const anio = Number(formData.get("anio"));
  const semestreRaw = Number(formData.get("semestre"));

  if (!empleadoId || empleadoId <= 0) throw new Error("Empleado inválido");
  if (!anio || anio < 2020 || anio > 2100) throw new Error("Año inválido");
  if (semestreRaw !== 1 && semestreRaw !== 2) throw new Error("Semestre inválido");

  const semestre = semestreRaw as 1 | 2;

  await liquidarSAC(empleadoId, anio, semestre);
  revalidatePath("/sueldos/sac");
  redirect(`/sueldos/sac?empleado_id=${empleadoId}&anio=${anio}&semestre=${semestre}&liquidado=1`);
}
