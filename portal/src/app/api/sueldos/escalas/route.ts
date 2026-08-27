import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

const CONCEPTO_KEY_MAP: [RegExp, string][] = [
  [/antigüedad.*ART\.\s*11.*2\s*%/i, "plus_antig_2pct"],
  [/antigüedad.*Resoluc.*1\s*%/i, "plus_antig_1pct"],
  [/^Valor vivienda/i, "valor_vivienda"],
  [/^Adicional Viaticos/i, "adicional_viaticos"],
  [/^Retiro de residuos/i, "retiro_residuos"],
  [/^Clasificación de residuos/i, "clasif_residuos"],
  [/^Plus limpieza de cocheras/i, "plus_cocheras"],
  [/^Plus mov[ie]+miento de coches/i, "plus_movimiento_coches"],
  [/^Plus Jardin/i, "plus_jardin"],
  [/^Plus limpieza de piletas/i, "plus_pileta"],
  [/^Adicional Remuneratorio Mensual/i, "adicional_remuneratorio_mensual"],
];

function deriveConceptoKey(concepto: string): string | null {
  const clean = concepto.replace(/&#\d+;/g, " ").replace(/\s+/g, " ").trim();
  for (const [re, key] of CONCEPTO_KEY_MAP) {
    if (re.test(clean) || re.test(concepto)) return key;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const expectedApiKey = process.env.AGENT_API_KEY;
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
    const key = a.concepto_key ?? deriveConceptoKey(a.concepto);
    await pool.query(
      `INSERT INTO app.adicionales_suterh (periodo, concepto, concepto_key, valor, fuente_url)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (periodo, concepto) DO UPDATE SET
         concepto_key = COALESCE(EXCLUDED.concepto_key, app.adicionales_suterh.concepto_key),
         valor = EXCLUDED.valor, fuente_url = EXCLUDED.fuente_url`,
      [a.periodo, a.concepto, key, a.valor, a.fuente_url]
    );
    savedAdicionales++;
  }

  return NextResponse.json({ ok: true, savedEscalas, savedAdicionales });
}
