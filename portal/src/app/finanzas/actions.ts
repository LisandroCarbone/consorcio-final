"use server";

import { pool, withTransaction } from "@/lib/db";
import { revalidatePath } from "next/cache";

import { runCalculateExpenses } from "@/lib/expenses/engine";

// Motor de Intereses Real: registrarPago/editarPago/eliminarPago no longer
// write app.res_cuenta_periodo.estado directly. `estado` (and the whole
// FIFO imputation of app.imputacion_pagos / app.credito_unidad) is fully
// recomputed by runCalculateExpenses -> engine.ts, which re-runs
// reimputarTodosPagos over every historical payment for the unit on each
// call. This keeps a single source of truth for imputation logic instead
// of duplicating it here.
function logWarnings(context: string, warnings: string[]) {
  for (const w of warnings) {
    console.warn(`[${context}] ${w}`);
  }
}

export async function registrarPago(formData: FormData) {
  const consorcio_cuit = formData.get("consorcio_id") as string;
  const unidad_id    = Number(formData.get("unidad_id"));
  const res_cuenta_id = formData.get("expensa_id") ? Number(formData.get("expensa_id")) : null;
  const fecha        = String(formData.get("fecha"));
  const monto        = Number(formData.get("monto"));
  const medio_pago   = String(formData.get("medio_pago"));
  const referencia   = formData.get("referencia")?.toString() || null;
  const notas        = formData.get("notas")?.toString() || null;

  if (!consorcio_cuit) throw new Error("Consorcio CUIT requerido");
  if (!unidad_id || unidad_id <= 0) throw new Error("Unidad inválida");
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new Error("Fecha inválida");
  if (!monto || isNaN(monto) || monto <= 0) throw new Error("Monto inválido");
  if (!medio_pago) throw new Error("Medio de pago requerido");

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO app.pagos (consorcio_cuit, unidad_id, res_cuenta_id, fecha, monto, medio_pago, referencia, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [consorcio_cuit, unidad_id, res_cuenta_id, fecha, monto, medio_pago, referencia, notas]
    );

    let periodoId: number | null = null;

    if (res_cuenta_id) {
      const resCuenta = await client.query(
        "SELECT id, periodo_id FROM app.res_cuenta_periodo WHERE id=$1 AND unidad_id=$2",
        [res_cuenta_id, unidad_id]
      );
      if (!resCuenta.rowCount) throw new Error("Estado de expensa no encontrado o no pertenece a la unidad");
      periodoId = resCuenta.rows[0].periodo_id;
    } else {
      // No specific periodo linked to this payment — apply it against the
      // consorcio's latest periodo so balances still reflect the payment.
      const latestPeriodo = await client.query(
        "SELECT id FROM app.periodos_expensas WHERE consorcio_cuit = $1 ORDER BY anio DESC, mes DESC LIMIT 1",
        [consorcio_cuit]
      );
      if (latestPeriodo.rowCount && latestPeriodo.rowCount > 0) {
        periodoId = latestPeriodo.rows[0].id;
      }
    }

    // Run recalculation to apply the payment to balances, inside the SAME
    // transaction as the pago insert so both commit or roll back together.
    // `estado`, imputacion_pagos and credito_unidad are recomputed inside
    // engine.ts.
    if (periodoId) {
      const { warnings } = await runCalculateExpenses(periodoId, client);
      logWarnings("registrarPago", warnings);
    }
  });

  revalidatePath("/finanzas/cuenta-corriente");
}

export async function editarPago(formData: FormData) {
  const pagoId = Number(formData.get("pago_id"));
  const fecha = String(formData.get("fecha"));
  const monto = Number(formData.get("monto"));
  const medio_pago = String(formData.get("medio_pago"));
  const referencia = formData.get("referencia")?.toString() || null;
  const notas = formData.get("notas")?.toString() || null;

  if (!pagoId) throw new Error("Pago ID requerido");
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new Error("Fecha inválida");
  if (!monto || isNaN(monto) || monto <= 0) throw new Error("Monto inválido");

  await withTransaction(async (client) => {
    const origPago = await client.query(
      "SELECT res_cuenta_id, consorcio_cuit FROM app.pagos WHERE id = $1",
      [pagoId]
    );
    if (origPago.rowCount === 0) throw new Error("Pago no encontrado");
    const { res_cuenta_id, consorcio_cuit: pagoConsorcioCuit } = origPago.rows[0];

    await client.query(
      `UPDATE app.pagos
       SET fecha=$1, monto=$2, medio_pago=$3, referencia=$4, notas=$5, updated_at=now()
       WHERE id=$6`,
      [fecha, monto, medio_pago, referencia, notas, pagoId]
    );

    let periodoId: number | null = null;
    if (res_cuenta_id) {
      const resCuenta = await client.query(
        "SELECT periodo_id FROM app.res_cuenta_periodo WHERE id = $1",
        [res_cuenta_id]
      );
      if (resCuenta.rowCount && resCuenta.rowCount > 0) {
        periodoId = resCuenta.rows[0].periodo_id;
      }
    } else {
      // No specific periodo linked — apply against the consorcio's latest periodo.
      const latestPeriodo = await client.query(
        "SELECT id FROM app.periodos_expensas WHERE consorcio_cuit = $1 ORDER BY anio DESC, mes DESC LIMIT 1",
        [pagoConsorcioCuit]
      );
      if (latestPeriodo.rowCount && latestPeriodo.rowCount > 0) {
        periodoId = latestPeriodo.rows[0].id;
      }
    }

    // The old imputacion_pagos rows for this pago's unit are stale after the
    // amount/date change; runCalculateExpenses re-runs reimputarTodosPagos for
    // the whole unit (delete + reinsert) so no manual revert is needed here.
    // Runs in the SAME transaction as the pago update.
    if (periodoId) {
      const { warnings } = await runCalculateExpenses(periodoId, client);
      logWarnings("editarPago", warnings);
    }
  });

  revalidatePath("/finanzas/cuenta-corriente");
}

export async function guardarSaldosIniciales(
  periodoId: number,
  saldos: { unidad_id: number; saldo_anterior: number }[]
) {
  await withTransaction(async (client) => {
    for (const s of saldos) {
      await client.query(
        `INSERT INTO app.res_cuenta_periodo (periodo_id, unidad_id, saldo_anterior, coef_a, coef_b)
         VALUES ($1, $2, $3, 0, 0)
         ON CONFLICT (periodo_id, unidad_id) DO UPDATE SET
           saldo_anterior = $3, updated_at = now()`,
        [periodoId, s.unidad_id, s.saldo_anterior]
      );
    }
    await runCalculateExpenses(periodoId, client);
  });
  revalidatePath("/finanzas/cuenta-corriente");
}

export async function eliminarPago(formData: FormData) {
  const pagoId = Number(formData.get("pago_id"));
  if (!pagoId) throw new Error("Pago ID requerido");

  await withTransaction(async (client) => {
    const origPago = await client.query(
      "SELECT res_cuenta_id, consorcio_cuit FROM app.pagos WHERE id = $1",
      [pagoId]
    );
    if (origPago.rowCount === 0) throw new Error("Pago no encontrado");
    const { res_cuenta_id, consorcio_cuit: pagoConsorcioCuit } = origPago.rows[0];

    // app.imputacion_pagos.pago_id is ON DELETE RESTRICT, so its rows for
    // this pago must be deleted before the pago itself. credito_unidad.pago_id
    // is ON DELETE SET NULL, no manual cleanup needed there.
    await client.query("DELETE FROM app.imputacion_pagos WHERE pago_id = $1", [pagoId]);
    await client.query("DELETE FROM app.pagos WHERE id = $1", [pagoId]);

    let periodoId: number | null = null;
    if (res_cuenta_id) {
      const resCuenta = await client.query(
        "SELECT periodo_id FROM app.res_cuenta_periodo WHERE id = $1",
        [res_cuenta_id]
      );
      if (resCuenta.rowCount && resCuenta.rowCount > 0) {
        periodoId = resCuenta.rows[0].periodo_id;
      }
    } else {
      // No specific periodo linked — apply against the consorcio's latest periodo.
      const latestPeriodo = await client.query(
        "SELECT id FROM app.periodos_expensas WHERE consorcio_cuit = $1 ORDER BY anio DESC, mes DESC LIMIT 1",
        [pagoConsorcioCuit]
      );
      if (latestPeriodo.rowCount && latestPeriodo.rowCount > 0) {
        periodoId = latestPeriodo.rows[0].id;
      }
    }

    // estado is recomputed by runCalculateExpenses (engine.ts re-runs FIFO
    // reimputation over the unit's remaining payments) — no manual reset
    // needed. Runs in the SAME transaction as the delete.
    if (periodoId) {
      const { warnings } = await runCalculateExpenses(periodoId, client);
      logWarnings("eliminarPago", warnings);
    }
  });

  revalidatePath("/finanzas/cuenta-corriente");
}
