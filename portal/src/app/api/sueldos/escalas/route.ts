import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const expectedApiKey = process.env.AGENT_API_KEY || "changeme";
  if (apiKey !== expectedApiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let escalas, adicionales;
  try {
    const body = await req.json();
    escalas = body.escalas;
    adicionales = body.adicionales;
  } catch (err: any) {
    return NextResponse.json(
      { error: `Invalid JSON body: ${err.message}. Make sure you are not sending '[object Object]' or malformed JSON.` },
      { status: 400 }
    );
  }

  let savedEscalas = 0;
  let savedAdicionales = 0;

  for (const e of escalas ?? []) {
    await pool.query(
      `INSERT INTO app.escalas_suterh (periodo, funcion, cat_1, cat_2, cat_3, cat_4, fuente_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (periodo, funcion) DO UPDATE SET
         cat_1 = EXCLUDED.cat_1, cat_2 = EXCLUDED.cat_2,
         cat_3 = EXCLUDED.cat_3, cat_4 = EXCLUDED.cat_4,
         fuente_url = EXCLUDED.fuente_url`,
      [e.periodo, e.funcion, e.cat_1, e.cat_2, e.cat_3, e.cat_4, e.fuente_url]
    );
    savedEscalas++;
  }

  for (const a of adicionales ?? []) {
    await pool.query(
      `INSERT INTO app.adicionales_suterh (periodo, concepto, valor, fuente_url)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (periodo, concepto) DO UPDATE SET
         valor = EXCLUDED.valor, fuente_url = EXCLUDED.fuente_url`,
      [a.periodo, a.concepto, a.valor, a.fuente_url]
    );
    savedAdicionales++;
  }

  return NextResponse.json({ ok: true, savedEscalas, savedAdicionales });
}
