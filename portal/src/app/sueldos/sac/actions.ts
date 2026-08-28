"use server";

import { liquidarSAC } from "@/lib/liquidacion/engine";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

export async function accionLiquidarSAC(formData: FormData): Promise<{ error?: string }> {
  const empleadoId = Number(formData.get("empleado_id"));
  const anio = Number(formData.get("anio"));
  const semestreRaw = Number(formData.get("semestre"));

  if (!empleadoId) throw new Error("Empleado requerido");
  if (!anio || anio < 2020 || anio > 2100) throw new Error("Año inválido");
  if (semestreRaw !== 1 && semestreRaw !== 2) throw new Error("Semestre inválido");

  const semestre = semestreRaw as 1 | 2;

  try {
    await liquidarSAC(empleadoId, anio, semestre);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: msg };
  }
  revalidatePath("/sueldos/sac");
  logAudit("create", "liquidacion_sac", empleadoId, { after: { anio, semestre } });
  return {};
}
