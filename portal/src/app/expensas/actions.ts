"use server";

import { query, queryOne } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPeriodo(formData: FormData) {
  const consorcio_id = Number(formData.get("consorcio_id"));
  const anio = Number(formData.get("anio"));
  const mes = Number(formData.get("mes"));
  const fecha_vencimiento = (formData.get("fecha_vencimiento") as string) || null;
  await queryOne(
    "INSERT INTO periodos (consorcio_id, anio, mes, fecha_vencimiento) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING",
    [consorcio_id, anio, mes, fecha_vencimiento]
  );
  revalidatePath("/expensas");
}

export async function addGasto(formData: FormData) {
  const periodo_id = Number(formData.get("periodo_id"));
  await queryOne(
    "INSERT INTO gastos (periodo_id, concepto, monto, tipo) VALUES ($1,$2,$3,$4)",
    [
      periodo_id,
      formData.get("concepto"),
      Number(formData.get("monto")),
      formData.get("tipo") || "ordinario",
    ]
  );
  revalidatePath("/expensas");
}

export async function calcularExpensas(periodo_id: number) {
  const periodo = await queryOne<{ consorcio_id: number; estado: string }>(
    "SELECT consorcio_id, estado FROM periodos WHERE id=$1",
    [periodo_id]
  );
  if (!periodo || periodo.estado === "liquidado") return;

  await query(
    `WITH coef_total AS (SELECT SUM(coeficiente) AS total FROM unidades WHERE consorcio_id=$1),
     totales AS (
       SELECT
         COALESCE(SUM(monto) FILTER (WHERE tipo='ordinario'),0) AS ord,
         COALESCE(SUM(monto) FILTER (WHERE tipo='extraordinario'),0) AS ext,
         COALESCE(SUM(monto) FILTER (WHERE tipo='fondo_reserva'),0) AS fondo
       FROM gastos WHERE periodo_id=$2
     )
     INSERT INTO expensas (periodo_id, unidad_id, monto_ordinario, monto_extraordinario, monto_fondo_reserva)
     SELECT $2, u.id,
       ROUND((totales.ord * u.coeficiente / coef_total.total)::numeric, 2),
       ROUND((totales.ext * u.coeficiente / coef_total.total)::numeric, 2),
       ROUND((totales.fondo * u.coeficiente / coef_total.total)::numeric, 2)
     FROM unidades u, totales, coef_total WHERE u.consorcio_id=$1
     ON CONFLICT (periodo_id, unidad_id) DO UPDATE SET
       monto_ordinario=EXCLUDED.monto_ordinario,
       monto_extraordinario=EXCLUDED.monto_extraordinario,
       monto_fondo_reserva=EXCLUDED.monto_fondo_reserva`,
    [periodo.consorcio_id, periodo_id]
  );
  await query("UPDATE periodos SET estado='liquidado', fecha_cierre=CURRENT_DATE WHERE id=$1", [periodo_id]);
  revalidatePath("/expensas");
}

export async function marcarPagada(expensa_id: number) {
  await query(
    "UPDATE expensas SET estado='pagada', fecha_pago=CURRENT_DATE WHERE id=$1",
    [expensa_id]
  );
  revalidatePath("/expensas");
}
