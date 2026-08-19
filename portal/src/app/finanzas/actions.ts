"use server";

import { pool, withTransaction } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

  revalidatePath("/configuracion/parametros");
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

// Cuenta corriente history redesign — manual (historico) period entries.
// Lets an admin seed a running-balance history for a unit that predates the
// interest engine: an initial balance plus a chain of monthly rows.

export async function actualizarSaldoInicial(formData: FormData) {
  const unidad_id = Number(formData.get("unidad_id"));
  const saldo_inicial = Number(formData.get("saldo_inicial"));

  if (!unidad_id || unidad_id <= 0) throw new Error("Unidad inválida");
  if (isNaN(saldo_inicial)) throw new Error("Saldo inicial inválido");

  await pool.query(
    "UPDATE app.unidades SET saldo_inicial_historico = $2 WHERE id = $1",
    [unidad_id, saldo_inicial]
  );

  revalidatePath("/finanzas/cuenta-corriente");
}

export async function agregarPeriodoHistorial(formData: FormData) {
  const unidad_id = Number(formData.get("unidad_id"));
  const anio = Number(formData.get("anio"));
  const mes = Number(formData.get("mes"));
  const expensas = Number(formData.get("expensas"));
  const pago = Number(formData.get("pago"));

  if (!unidad_id || unidad_id <= 0) throw new Error("Unidad inválida");
  if (!anio || anio < 2000 || anio > 2100) throw new Error("Año inválido");
  if (!mes || mes < 1 || mes > 12) throw new Error("Mes inválido");
  if (isNaN(expensas) || expensas < 0) throw new Error("Monto de expensas inválido");
  if (isNaN(pago) || pago < 0) throw new Error("Monto de pago inválido");

  let consorcio_cuit = "";
  await withTransaction(async (client) => {
    const unidadRow = await client.query(
      "SELECT consorcio_cuit FROM app.unidades WHERE id = $1",
      [unidad_id]
    );
    if (!unidadRow.rowCount) throw new Error("Unidad no encontrada");
    consorcio_cuit = unidadRow.rows[0].consorcio_cuit;

    let periodo = await client.query(
      "SELECT id FROM app.periodos_expensas WHERE consorcio_cuit = $1 AND anio = $2 AND mes = $3",
      [consorcio_cuit, anio, mes]
    );
    let periodoId: number;
    if (periodo.rowCount && periodo.rowCount > 0) {
      periodoId = periodo.rows[0].id;
    } else {
      const inserted = await client.query(
        `INSERT INTO app.periodos_expensas (consorcio_cuit, anio, mes, estado)
         VALUES ($1, $2::smallint, $3::smallint, 'historico')
         RETURNING id`,
        [consorcio_cuit, anio, mes]
      );
      periodoId = inserted.rows[0].id;
    }

    await client.query(
      `INSERT INTO app.res_cuenta_periodo
         (periodo_id, unidad_id, coef_a, coef_b, expensas_a, total_mes, su_pago,
          saldo_anterior, intereses, deuda, expensas_b, s_asamblea, otros, gast_part)
       VALUES ($1, $2, 0, 0, $3, $3, $4, 0, 0, 0, 0, 0, 0, 0)
       ON CONFLICT (periodo_id, unidad_id) DO UPDATE SET
         expensas_a = $3, total_mes = $3, su_pago = $4`,
      [periodoId, unidad_id, expensas, pago]
    );

    const deuda = Math.max(expensas - pago, 0);
    await client.query(
      `INSERT INTO app.deuda_periodo (unidad_id, periodo_id, monto_original, monto_capital_pendiente)
       VALUES ($1, $2, $3, $3)
       ON CONFLICT (unidad_id, periodo_id) DO UPDATE SET
         monto_original = $3, monto_capital_pendiente = $3`,
      [unidad_id, periodoId, deuda]
    );

  });

  revalidatePath("/finanzas/cuenta-corriente");
}

export async function editarPeriodoHistorial(formData: FormData) {
  const res_cuenta_id = Number(formData.get("res_cuenta_id"));
  const expensas = Number(formData.get("expensas"));
  const pago = Number(formData.get("pago"));

  if (!res_cuenta_id) throw new Error("Registro inválido");
  if (isNaN(expensas) || expensas < 0) throw new Error("Monto de expensas inválido");
  if (isNaN(pago) || pago < 0) throw new Error("Monto de pago inválido");

  await withTransaction(async (client) => {
    const row = await client.query(
      `SELECT pe.estado, pe.id AS periodo_id, rcp.unidad_id, u.consorcio_cuit
       FROM app.res_cuenta_periodo rcp
       JOIN app.periodos_expensas pe ON pe.id = rcp.periodo_id
       JOIN app.unidades u ON u.id = rcp.unidad_id
       WHERE rcp.id = $1`,
      [res_cuenta_id]
    );
    if (!row.rowCount) throw new Error("Registro no encontrado");
    const { estado, periodo_id, unidad_id, consorcio_cuit } = row.rows[0];
    if (estado === "abierto" || estado === "liquidado") throw new Error("Solo se pueden modificar períodos cargados manualmente");

    await client.query(
      "UPDATE app.res_cuenta_periodo SET expensas_a = $2, total_mes = $2, su_pago = $3 WHERE id = $1",
      [res_cuenta_id, expensas, pago]
    );

    const deuda = Math.max(expensas - pago, 0);
    await client.query(
      `UPDATE app.deuda_periodo SET monto_original = $3, monto_capital_pendiente = $3
       WHERE unidad_id = $1 AND periodo_id = $2`,
      [unidad_id, periodo_id, deuda]
    );

  });

  revalidatePath("/finanzas/cuenta-corriente");
}

export async function eliminarPeriodoHistorial(formData: FormData) {
  const res_cuenta_id = Number(formData.get("res_cuenta_id"));
  if (!res_cuenta_id) throw new Error("Registro inválido");

  await withTransaction(async (client) => {
    const row = await client.query(
      `SELECT pe.estado, pe.id AS periodo_id, rcp.unidad_id, u.consorcio_cuit
       FROM app.res_cuenta_periodo rcp
       JOIN app.periodos_expensas pe ON pe.id = rcp.periodo_id
       JOIN app.unidades u ON u.id = rcp.unidad_id
       WHERE rcp.id = $1`,
      [res_cuenta_id]
    );
    if (!row.rowCount) throw new Error("Registro no encontrado");
    const { estado, periodo_id, unidad_id, consorcio_cuit } = row.rows[0];
    if (estado === "abierto" || estado === "liquidado") throw new Error("Solo se pueden modificar períodos cargados manualmente");

    await client.query("DELETE FROM app.res_cuenta_periodo WHERE id = $1", [res_cuenta_id]);
    await client.query(
      "DELETE FROM app.imputacion_pagos WHERE deuda_periodo_id IN (SELECT id FROM app.deuda_periodo WHERE unidad_id = $1 AND periodo_id = $2)",
      [unidad_id, periodo_id]
    );
    await client.query(
      "DELETE FROM app.deuda_periodo WHERE unidad_id = $1 AND periodo_id = $2",
      [unidad_id, periodo_id]
    );

    const remaining = await client.query(
      "SELECT id FROM app.res_cuenta_periodo WHERE periodo_id = $1 LIMIT 1",
      [periodo_id]
    );
    if (!remaining.rowCount) {
      await client.query("DELETE FROM app.periodos_expensas WHERE id = $1", [periodo_id]);
    }
  });

  revalidatePath("/finanzas/cuenta-corriente");
}

