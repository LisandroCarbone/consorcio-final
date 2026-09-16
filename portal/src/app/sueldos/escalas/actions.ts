"use server";

import { pool } from "@/lib/db";

const MESES: Record<string, string> = {
  enero: "01", febrero: "02", marzo: "03", abril: "04",
  mayo: "05", junio: "06", julio: "07", agosto: "08",
  septiembre: "09", setiembre: "09", octubre: "10",
  noviembre: "11", diciembre: "12",
};

function extractNumber(text: string): number {
  const clean = String(text).replace(/\./g, "").replace(",", ".");
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").trim();
}

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

export async function scrapeEscalasSuterh(): Promise<{
  ok: boolean;
  error?: string;
  savedEscalas?: number;
  savedAdicionales?: number;
  periodo?: string;
}> {
  try {
    // Step 1: Fetch index page
    const indexRes = await fetch("https://suterh.org.ar/planillas-salariales/", { next: { revalidate: 0 } });
    if (!indexRes.ok) throw new Error(`Index fetch failed: ${indexRes.status}`);
    const indexHtml = await indexRes.text();

    // Step 2: Extract most recent planilla URL
    const matches = [
      ...indexHtml.matchAll(/href=["'](https?:\/\/suterh\.org\.ar\/planilla-salarial-([a-z]+)-(\d{4})\/?)['"]/gi),
    ];
    if (matches.length === 0) throw new Error("No se encontraron links de planillas en el índice SUTERH");

    const parsed = matches
      .map((m) => ({
        url: m[1].endsWith("/") ? m[1] : m[1] + "/",
        mesKey: m[2].toLowerCase(),
        anio: parseInt(m[3], 10),
      }))
      .filter((p) => MESES[p.mesKey])
      .map((p) => ({ ...p, monthNum: parseInt(MESES[p.mesKey], 10) }))
      .sort((a, b) => b.anio - a.anio || b.monthNum - a.monthNum);

    if (parsed.length === 0) throw new Error("No se pudo parsear ningún link de planilla");

    const best = parsed[0];
    const mes = String(best.monthNum).padStart(2, "0");
    const periodo = `${best.anio}-${mes}-01`;
    const fuente = best.url;

    // Step 3: Fetch the specific planilla page
    const planillaRes = await fetch(fuente, { next: { revalidate: 0 } });
    if (!planillaRes.ok) throw new Error(`Planilla fetch failed: ${planillaRes.status}`);
    const html = await planillaRes.text();

    // Step 4: Parse HTML tables
    const escalas: { periodo: string; funcion: string; cat_1: number; cat_2: number; cat_3: number; cat_4: number; fuente_url: string }[] = [];
    const adicionales: { periodo: string; concepto: string; valor: number; fuente_url: string }[] = [];

    const rows = [...html.matchAll(/<tr[\s\S]*?<\/tr>/gi)];
    for (const rowMatch of rows) {
      const cells = [...rowMatch[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) => stripTags(m[1]));
      if (cells.length < 2) continue;

      const label = cells[0];
      if (!label || /funci.n|concepto|categor.a|header/i.test(label)) continue;

      const nums = cells.slice(1).map(extractNumber);
      const positiveNums = nums.filter((n) => n > 100);

      if (positiveNums.length >= 4) {
        escalas.push({ periodo, funcion: label, cat_1: positiveNums[0], cat_2: positiveNums[1], cat_3: positiveNums[2], cat_4: positiveNums[3], fuente_url: fuente });
      } else if (nums.length >= 4 && positiveNums.length >= 1) {
        const val = positiveNums[0];
        escalas.push({ periodo, funcion: label, cat_1: val, cat_2: val, cat_3: val, cat_4: val, fuente_url: fuente });
      } else if (positiveNums.length === 1) {
        adicionales.push({ periodo, concepto: label, valor: positiveNums[0], fuente_url: fuente });
      }
    }

    if (escalas.length === 0) throw new Error(`No se encontraron escalas en ${fuente}. Verificar estructura HTML.`);

    // Step 5: Save to DB (same logic as /api/sueldos/escalas POST endpoint)
    let savedEscalas = 0;
    let savedAdicionales = 0;

    for (const e of escalas) {
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

    for (const a of adicionales) {
      const key = deriveConceptoKey(a.concepto);
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

    return { ok: true, savedEscalas, savedAdicionales, periodo };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[scrapeEscalasSuterh]", err);
    return { ok: false, error: message };
  }
}
