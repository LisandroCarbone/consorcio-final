import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateLsdTxt } from "@/lib/liquidacion/lsd";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo");
    const tipo = searchParams.get("tipo");

    if (!periodo || !tipo) {
      return NextResponse.json(
        { error: "Faltan parámetros periodo o tipo." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

    if (!activeCuit) {
      return NextResponse.json(
        { error: "No hay consorcio seleccionado." },
        { status: 400 }
      );
    }

    const txtContent = await generateLsdTxt(periodo, tipo, activeCuit);

    const filename = `LSD_${activeCuit}_${periodo}_${tipo}.txt`;

    return new Response(txtContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("Error generating LSD TXT:", err);
    return NextResponse.json(
      { error: err.message || "Error interno al generar el archivo LSD." },
      { status: 400 }
    );
  }
}
