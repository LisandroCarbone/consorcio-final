import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== env.AGENT_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { cuit: string; desde: string; hasta: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { cuit, desde, hasta } = body;
  if (!cuit || !desde || !hasta) {
    return NextResponse.json({ error: "cuit, desde, hasta required" }, { status: 400 });
  }

  const client = await pool.connect();
  const log: string[] = [];
  try {
    const empRows = await client.query(
      "SELECT id, nombre FROM app.empleados WHERE consorcio_cuit = $1",
      [cuit]
    );
    const empIds = empRows.rows.map((r: any) => r.id);
    log.push(`Empleados: ${empIds.length}`);
    if (!empIds.length) return NextResponse.json({ log, message: "No employees found" });

    const liqRows = await client.query(
      `SELECT id FROM app.liquidaciones_sueldo WHERE empleado_id = ANY($1) AND periodo >= $2 AND periodo <= $3`,
      [empIds, desde, hasta]
    );
    const liqIds = liqRows.rows.map((r: any) => r.id);
    log.push(`Liquidaciones: ${liqIds.length}`);

    const periodoRows = await client.query(
      `SELECT id FROM app.periodos_expensas WHERE consorcio_cuit = $1 AND periodo >= $2 AND periodo <= $3`,
      [cuit, desde, hasta]
    );
    const periodoIds = periodoRows.rows.map((r: any) => r.id);
    log.push(`Periodos expensas: ${periodoIds.length}`);

    await client.query("BEGIN");

    if (periodoIds.length > 0) {
      let r = await client.query(
        `DELETE FROM app.imputacion_pagos WHERE deuda_periodo_id IN (SELECT id FROM app.deuda_periodo WHERE periodo_id = ANY($1))`,
        [periodoIds]
      );
      log.push(`imputacion_pagos: ${r.rowCount}`);
      r = await client.query(`DELETE FROM app.deuda_periodo WHERE periodo_id = ANY($1)`, [periodoIds]);
      log.push(`deuda_periodo: ${r.rowCount}`);
      await client.query(`UPDATE app.credito_unidad SET aplicado_en_periodo_id = NULL WHERE aplicado_en_periodo_id = ANY($1)`, [periodoIds]);
    }

    if (liqIds.length > 0) {
      await client.query(`UPDATE app.gastos_periodo SET liquidacion_id = NULL WHERE liquidacion_id = ANY($1)`, [liqIds]);
    }

    if (periodoIds.length > 0) {
      await client.query(`UPDATE app.gastos_periodo SET provision_pagada_periodo_id = NULL WHERE provision_pagada_periodo_id = ANY($1)`, [periodoIds]);
    }

    if (liqIds.length > 0) {
      let r = await client.query(`DELETE FROM app.conceptos_liquidacion WHERE liquidacion_id = ANY($1)`, [liqIds]);
      log.push(`conceptos_liquidacion: ${r.rowCount}`);
      r = await client.query(`DELETE FROM app.liquidaciones_sueldo WHERE id = ANY($1)`, [liqIds]);
      log.push(`liquidaciones_sueldo: ${r.rowCount}`);
    }

    let r = await client.query(
      `DELETE FROM app.novedades_sueldo WHERE empleado_id = ANY($1) AND periodo >= $2 AND periodo <= $3`,
      [empIds, desde, hasta]
    );
    log.push(`novedades_sueldo: ${r.rowCount}`);

    if (periodoIds.length > 0) {
      await client.query(
        `UPDATE app.pagos SET res_cuenta_id = NULL WHERE res_cuenta_id IN (SELECT id FROM app.res_cuenta_periodo WHERE periodo_id = ANY($1))`,
        [periodoIds]
      );
      r = await client.query(`DELETE FROM app.res_cuenta_periodo WHERE periodo_id = ANY($1)`, [periodoIds]);
      log.push(`res_cuenta_periodo: ${r.rowCount}`);
      r = await client.query(`DELETE FROM app.gastos_periodo WHERE periodo_id = ANY($1)`, [periodoIds]);
      log.push(`gastos_periodo: ${r.rowCount}`);
      r = await client.query(`DELETE FROM app.periodos_expensas WHERE id = ANY($1)`, [periodoIds]);
      log.push(`periodos_expensas: ${r.rowCount}`);
    }

    await client.query("COMMIT");
    log.push("✓ Done");
    return NextResponse.json({ ok: true, log });
  } catch (err: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: err.message, log }, { status: 500 });
  } finally {
    client.release();
  }
}
