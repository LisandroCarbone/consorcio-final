import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { consultarPadron } from "@/lib/arca";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cuit = searchParams.get("cuit") || "";
    const cuitConsorcio = searchParams.get("cuitConsorcio") || "";

    if (!cuit || !cuitConsorcio) {
      return NextResponse.json({ error: "Parámetros 'cuit' y 'cuitConsorcio' requeridos." }, { status: 400 });
    }

    // Verificar si el consorcio tiene credenciales ARCA configuradas
    const credentials = await queryOne(
      "SELECT cuit FROM app.arca_credentials WHERE cuit = $1",
      [cuitConsorcio]
    );

    if (!credentials) {
      return NextResponse.json(
        { error: "Debe configurar primero las credenciales de ARCA en 'Credenciales ARCA' para este consorcio." },
        { status: 400 }
      );
    }

    const details = await consultarPadron(cuit, cuitConsorcio);
    return NextResponse.json({ success: true, details });
  } catch (err: any) {
    console.error("Error al validar CUIT en ARCA:", err);
    return NextResponse.json({ error: err.message || "Error al validar CUIT en ARCA" }, { status: 500 });
  }
}
