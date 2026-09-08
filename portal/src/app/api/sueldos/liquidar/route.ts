import { NextRequest, NextResponse } from "next/server";
import { calcularLiquidacion, calcularPeriodo } from "@/lib/liquidacion/engine";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  // Auth
  const apiKey = req.headers.get("x-api-key");
  const expectedApiKey = process.env.AGENT_API_KEY;
  if (!apiKey || apiKey !== expectedApiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { periodo?: string; empleadoId?: number; cuil?: string; consorcioCuit?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { periodo, cuil, consorcioCuit } = body;
  let { empleadoId } = body;

  if (!periodo || typeof periodo !== "string") {
    return NextResponse.json(
      { error: "Campo 'periodo' requerido (formato YYYY-MM)" },
      { status: 400 }
    );
  }

  // Accept YYYY-MM or YYYY-MM-DD, normalize to YYYY-MM-DD
  const periodoNorm = /^\d{4}-\d{2}$/.test(periodo)
    ? `${periodo}-01`
    : periodo;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(periodoNorm)) {
    return NextResponse.json(
      { error: "Formato de período inválido. Usar YYYY-MM o YYYY-MM-DD" },
      { status: 400 }
    );
  }

  // Resolve empleadoId from cuil if provided
  if (!empleadoId && cuil) {
    const { rows } = await pool.query(
      "SELECT id FROM app.empleados WHERE cuil = $1 AND estado = 'activo' LIMIT 1",
      [cuil.replace(/[-\s]/g, "")]
    );
    if (!rows.length) return NextResponse.json({ error: `No active employee with CUIL ${cuil}` }, { status: 404 });
    empleadoId = rows[0].id;
  }

  // Batch by consorcio
  if (!empleadoId && consorcioCuit) {
    const { rows } = await pool.query(
      "SELECT id FROM app.empleados WHERE consorcio_cuit = $1 AND estado = 'activo'",
      [consorcioCuit]
    );
    if (!rows.length) return NextResponse.json({ error: `No active employees for CUIT ${consorcioCuit}` }, { status: 404 });
    let ok = 0;
    const errores: string[] = [];
    for (const emp of rows) {
      try {
        await calcularLiquidacion(emp.id, periodoNorm);
        ok++;
      } catch (err) {
        errores.push(`emp ${emp.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    return NextResponse.json({ ok, errores });
  }

  if (empleadoId !== undefined) {
    // Single employee
    if (typeof empleadoId !== "number" || !Number.isFinite(empleadoId) || empleadoId <= 0) {
      return NextResponse.json(
        { error: "empleadoId debe ser un número entero positivo" },
        { status: 400 }
      );
    }

    try {
      await calcularLiquidacion(empleadoId, periodoNorm);
      return NextResponse.json({ ok: 1, errores: [] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[POST /api/sueldos/liquidar] Error:", err);
      return NextResponse.json(
        { ok: 0, errores: [msg] },
        { status: 500 }
      );
    }
  }

  // Batch: all active employees
  try {
    const result = await calcularPeriodo(periodoNorm);
    const status = result.errores.length > 0 && result.ok === 0 ? 500 : 200;
    return NextResponse.json(result, { status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/sueldos/liquidar] Batch error:", err);
    return NextResponse.json(
      { ok: 0, errores: [msg] },
      { status: 500 }
    );
  }
}
