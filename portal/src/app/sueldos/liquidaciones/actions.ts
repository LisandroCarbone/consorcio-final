"use server";

import { calcularLiquidacionesPeriodo, confirmarLiquidacion } from "../actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";

export async function recalcularPeriodoAction(formData: FormData) {
  const periodo = String(formData.get("periodo"));
  const tipo = String(formData.get("tipo") ?? "mensual");

  if (tipo === "sac_1" || tipo === "sac_2") {
    redirect(`/sueldos/liquidaciones?periodo=${periodo}&tipo=${tipo}&ok=sac_noop`);
  }

  const result = await calcularLiquidacionesPeriodo(periodo);
  revalidatePath("/sueldos/liquidaciones");
  if (result.errores.length > 0 && result.ok === 0) {
    redirect(`/sueldos/liquidaciones?periodo=${periodo}&tipo=${tipo}&ok=error`);
  }
  if (result.errores.length > 0) {
    redirect(`/sueldos/liquidaciones?periodo=${periodo}&tipo=${tipo}&ok=recalculado_parcial&errores=${result.errores.length}`);
  }
  redirect(`/sueldos/liquidaciones?periodo=${periodo}&tipo=${tipo}&ok=recalculado`);
}

export async function confirmarLiquidacionAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const periodo = String(formData.get("periodo"));
  const tipo = String(formData.get("tipo") ?? "mensual");
  await confirmarLiquidacion(id);
  revalidatePath("/sueldos/liquidaciones");
  redirect(`/sueldos/liquidaciones?periodo=${periodo}&tipo=${tipo}&ok=confirmado`);
}
