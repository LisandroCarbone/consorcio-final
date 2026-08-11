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

// Motor de Intereses Real — Phase 6: Rate Management.
// Inserts a new historical interest rate row for a consorcio. Rates are
// looked up by fecha_desde (the rate vigente for a period's due date is the
// most recent fecha_desde <= that due date — see interest-engine.ts
// buscarTasaVigente), so a duplicate fecha_desde for the same consorcio
// would make rate lookup ambiguous and is rejected here.
export async function crearTasaInteres(formData: FormData) {
  const consorcio_cuit = String(formData.get("consorcio_cuit") || "");
  const tasaPct = Number(formData.get("tasa_pct"));
  const fecha_desde = String(formData.get("fecha_desde") || "");

  if (!consorcio_cuit) throw new Error("Consorcio requerido");
  if (!fecha_desde || !/^\d{4}-\d{2}-\d{2}$/.test(fecha_desde)) throw new Error("Fecha desde inválida");
  if (isNaN(tasaPct) || tasaPct < 0) throw new Error("Tasa inválida");

  const tasa = tasaPct / 100;

  try {
    await pool.query(
      `INSERT INTO app.tasas_interes (consorcio_cuit, tasa, fecha_desde)
       VALUES ($1, $2, $3)`,
      [consorcio_cuit, tasa, fecha_desde]
    );
  } catch (e: any) {
    if (e.code === "23505") {
      throw new Error("Ya existe una tasa registrada con esa fecha de vigencia para este consorcio");
    }
    throw e;
  }

  revalidatePath("/finanzas/tasas-interes");
}

// Motor de Intereses Real — Phase 8: Debt Onboarding.
// Inserts a per-period historical debt row directly into deuda_periodo for a
// unit, creating the referenced periodos_expensas row (estado='liquidado')
// if it does not already exist. Used to seed pre-existing debt that predates
// the interest engine, so it is picked up by calcularInteresesPeriodo on the
// next liquidación.
export async function agregarDeudaHistorica(formData: FormData) {
  const consorcio_cuit = String(formData.get("consorcio_cuit") || "");
  const unidad_id = Number(formData.get("unidad_id"));
  const anio = Number(formData.get("anio"));
  const mes = Number(formData.get("mes"));
  const monto_original = Number(formData.get("monto_original"));

  if (!consorcio_cuit) throw new Error("Consorcio requerido");
  if (!unidad_id || unidad_id <= 0) throw new Error("Unidad inválida");
  if (!anio || anio < 2000 || anio > 2100) throw new Error("Año inválido");
  if (!mes || mes < 1 || mes > 12) throw new Error("Mes inválido");
  if (!monto_original || isNaN(monto_original) || monto_original <= 0) throw new Error("Monto inválido");

  await withTransaction(async (client) => {
    const unitCheck = await client.query(
      "SELECT id FROM app.unidades WHERE id = $1 AND consorcio_cuit = $2",
      [unidad_id, consorcio_cuit]
    );
    if (!unitCheck.rowCount) throw new Error("La unidad no pertenece al consorcio seleccionado");

    let periodo = await client.query(
      "SELECT id FROM app.periodos_expensas WHERE consorcio_cuit = $1 AND anio = $2 AND mes = $3",
      [consorcio_cuit, anio, mes]
    );
    let periodoId: number;
    if (periodo.rowCount && periodo.rowCount > 0) {
      periodoId = periodo.rows[0].id;
    } else {
      const inserted = await client.query(
        `INSERT INTO app.periodos_expensas (consorcio_cuit, anio, mes, estado, fecha_vencimiento)
         VALUES ($1, $2, $3, 'liquidado', ($2 || '-' || LPAD($3::text, 2, '0') || '-01')::date)
         RETURNING id`,
        [consorcio_cuit, anio, mes]
      );
      periodoId = inserted.rows[0].id;
    }

    await client.query(
      `INSERT INTO app.deuda_periodo
         (unidad_id, periodo_id, monto_original, monto_capital_pendiente,
          monto_intereses_acumulado, monto_intereses_pendiente, meses_atraso, estado)
       VALUES ($1, $2, $3, $3, 0, 0, 0, 'pendiente')
       ON CONFLICT (unidad_id, periodo_id) DO UPDATE SET
         monto_capital_pendiente = app.deuda_periodo.monto_capital_pendiente
           + (EXCLUDED.monto_original - app.deuda_periodo.monto_original),
         monto_original = EXCLUDED.monto_original,
         updated_at = now()`,
      [unidad_id, periodoId, monto_original]
    );
  });

  revalidatePath("/finanzas/deuda-historica");
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
