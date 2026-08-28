import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const { rows: liq } = await pool.query(
    "SELECT id, estado, empleado_cuil, periodo::text FROM app.liquidaciones_sueldo WHERE id = 1526"
  );
  const cuil = liq[0]?.empleado_cuil;
  const periodo = liq[0]?.periodo;

  const { rows: nov } = await pool.query(
    "SELECT * FROM app.novedades_sueldo WHERE empleado_cuil = $1 AND periodo = $2",
    [cuil, periodo]
  );

  const { rows: emp } = await pool.query(
    "SELECT cuil, jornada, funcion FROM app.empleados WHERE cuil = $1",
    [cuil]
  );

  const { rows: conceptos } = await pool.query(
    "SELECT code, concepto, importe, tipo FROM app.conceptos_liquidacion WHERE liquidacion_id = 1526 ORDER BY orden"
  );

  return NextResponse.json({ liq: liq[0], emp: emp[0], nov: nov[0] ?? null, conceptos });
}
