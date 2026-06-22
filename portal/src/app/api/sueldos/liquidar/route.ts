import { NextRequest, NextResponse } from "next/server";
import { calcularLiquidacion, calcularPeriodo } from "@/lib/liquidacion/engine";

export async function POST(req: NextRequest) {
  // Auth
  const apiKey = req.headers.get("x-api-key");
  const expectedApiKey = process.env.AGENT_API_KEY || "changeme";
  if (!apiKey || apiKey !== expectedApiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { periodo?: string; empleadoCuil?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { periodo, empleadoCuil } = body;

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

  if (empleadoCuil !== undefined) {
    // Single employee
    if (typeof empleadoCuil !== "string" || !empleadoCuil.trim()) {
      return NextResponse.json(
        { error: "empleadoCuil debe ser un string no vacío" },
        { status: 400 }
      );
    }

    try {
      await calcularLiquidacion(empleadoCuil, periodoNorm);
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
