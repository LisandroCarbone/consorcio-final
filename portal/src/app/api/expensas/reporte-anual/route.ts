import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const consorcioCuit = searchParams.get("consorcioCuit");
    const anio = searchParams.get("anio");

    if (!consorcioCuit || !anio) {
      return NextResponse.json(
        { error: "Los parámetros consorcioCuit y anio son requeridos." },
        { status: 400 }
      );
    }

    const agentUrl = process.env.EXPENSAS_AGENT_URL ?? "http://localhost:3001";
    const apiKey = process.env.AGENT_API_KEY ?? "changeme";

    const agentRes = await fetch(
      `${agentUrl}/reporte-anual?consorcio_cuit=${consorcioCuit}&anio=${anio}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

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
    headers.set("Content-Disposition", `inline; filename="informe_anual_${consorcioCuit}_${anio}.pdf"`);

    return new Response(blob, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error("Error in reporte-anual proxy route:", err);
    return NextResponse.json(
      { error: err.message || "Error interno al generar el reporte anual." },
      { status: 500 }
    );
  }
}
