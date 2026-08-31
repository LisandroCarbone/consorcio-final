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
  await confirmarLiquidacion(id);
  revalidatePath("/sueldos/liquidaciones");
}

export async function updateFechaPago(liquidacionId: number, fecha: string) {
  await pool.query(
    "UPDATE app.liquidaciones_sueldo SET fecha_pago = $1, updated_at = now() WHERE id = $2",
    [fecha, liquidacionId]
  );
  revalidatePath(`/sueldos/liquidaciones/${liquidacionId}`);
}

export async function setUltimoDepositoManual(
  consorcioCuit: string,
  anio: number,
  mes: number,
  banco: string,
  fecha: string,
  liquidacionId: number
) {
  await pool.query(
    `INSERT INTO app.ultimo_deposito_manual (consorcio_cuit, periodo_anio, periodo_mes, banco, fecha_deposito)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (consorcio_cuit, periodo_anio, periodo_mes)
     DO UPDATE SET banco = EXCLUDED.banco, fecha_deposito = EXCLUDED.fecha_deposito, updated_at = now()`,
    [consorcioCuit, anio, mes, banco || null, fecha || null]
  );
  revalidatePath(`/sueldos/liquidaciones/${liquidacionId}`);
}

export async function clearUltimoDepositoManual(
  consorcioCuit: string,
  anio: number,
  mes: number,
  liquidacionId: number
) {
  await pool.query(
    "DELETE FROM app.ultimo_deposito_manual WHERE consorcio_cuit = $1 AND periodo_anio = $2 AND periodo_mes = $3",
    [consorcioCuit, anio, mes]
  );
  revalidatePath(`/sueldos/liquidaciones/${liquidacionId}`);
}
