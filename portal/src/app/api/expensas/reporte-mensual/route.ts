import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodoId = searchParams.get("periodoId");

    if (!periodoId) {
      return NextResponse.json(
        { error: "El parámetro periodoId es requerido." },
        { status: 400 }
      );
    }

    const agentUrl = process.env.EXPENSAS_AGENT_URL ?? "http://localhost:3001";
    const apiKey = process.env.AGENT_API_KEY ?? "changeme";

    const agentRes = await fetch(`${agentUrl}/reporte-mensual?periodo_id=${periodoId}`, {
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!agentRes.ok) {
      const errText = await agentRes.text();
      return NextResponse.json(
        { error: `Error en el agente de expensas: ${errText}` },
        { status: agentRes.status }
      );
    }

    const blob = await agentRes.blob();
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `inline; filename="rendicion_mensual_${periodoId}.pdf"`);

    return new Response(blob, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error("Error in reporte-mensual proxy route:", err);
    return NextResponse.json(
      { error: err.message || "Error interno al generar el reporte mensual." },
      { status: 500 }
    );
  }
}
