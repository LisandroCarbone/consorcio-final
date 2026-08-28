import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const movs = await query(`
    SELECT em.id, em.match_id, em.estado_match, em.descripcion, em.fecha::text, eb.consorcio_cuit, eb.anio, eb.mes
    FROM app.extracto_movimientos em
    JOIN app.extractos_bancarios eb ON eb.id = em.extracto_id
    WHERE em.estado_match = 'confirmado'
      AND em.match_tipo = 'gasto'
      AND em.es_credito = false
    ORDER BY em.fecha DESC LIMIT 10
  `);

  const gastoIds = movs.map((r: any) => r.match_id);
  const gastos = gastoIds.length > 0
    ? await query("SELECT id, descripcion, debitado FROM app.gastos_periodo WHERE id = ANY($1)", [gastoIds])
    : [];

  const consorcios = await query("SELECT cuit, nombre FROM app.consorcios");
  const depositos: any[] = [];
  for (const c of consorcios) {
    const rows = await query(`
      SELECT eb.archivo_nombre, em.fecha::text AS fecha, em.descripcion,
             pe.anio AS periodo_anio, pe.mes AS periodo_mes
      FROM app.extracto_movimientos em
      JOIN app.extractos_bancarios eb ON eb.id = em.extracto_id
      JOIN app.gastos_periodo gp ON gp.id = em.match_id
      JOIN app.periodos_expensas pe ON pe.id = gp.periodo_id
      WHERE eb.consorcio_cuit = $1
        AND em.estado_match = 'confirmado'
        AND em.match_tipo = 'gasto'
        AND em.es_credito = false
        AND (gp.descripcion ILIKE '%F. 931%' OR gp.descripcion ILIKE '%F.931%'
             OR gp.descripcion ILIKE '%AFIP%VEP%' OR gp.descripcion ILIKE '%ARCA%931%')
      ORDER BY pe.anio DESC, pe.mes DESC, em.fecha DESC LIMIT 1
    `, [(c as any).cuit]);
    depositos.push({ consorcio: (c as any).nombre, result: rows[0] || null });
  }

  return NextResponse.json({ movs, gastos, depositos });
}
