import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const apiKey = req.nextUrl.searchParams.get("key");
  if (apiKey !== env.AGENT_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const liqId = req.nextUrl.searchParams.get("liq");
  if (!liqId) return NextResponse.json({ error: "liq param required" }, { status: 400 });

  const { rows: liqRows } = await pool.query(
    `SELECT l.id, l.empleado_id, l.periodo::text, l.tipo, l.estado, l.total_aportes_patronales,
            e.cuil, e.nombre, e.funcion, e.jornada, e.fecha_ingreso::text
     FROM app.liquidaciones_sueldo l
     JOIN app.empleados e ON e.id = l.empleado_id
     WHERE l.id = $1`,
    [liqId]
  );

  const { rows: conceptos } = await pool.query(
    `SELECT code, concepto, importe FROM app.conceptos_liquidacion WHERE liquidacion_id = $1 ORDER BY orden`,
    [liqId]
  );

  return NextResponse.json({ liq: liqRows[0] ?? null, conceptos });
}
