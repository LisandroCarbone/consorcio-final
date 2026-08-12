import { query, queryOne } from "@/lib/db";

/**
 * Builds a WHERE clause fragment filtering by consorcio CUIT, plus the
 * matching parameter list. Returns an empty clause (no filter) when
 * `cuits` is undefined or empty — meaning "all consorcios".
 */
export function cuitFilter(
  cuits: string[] | undefined,
  alias: string = "c"
): { clause: string; params: string[] } {
  if (!cuits?.length) return { clause: "", params: [] };
  const placeholders = cuits.map((_, i) => `$${i + 1}`).join(",");
  return { clause: `${alias}.cuit IN (${placeholders})`, params: cuits };
}

export interface DashboardKPIData {
  consorciosActivos: number;
  cobranzaPct: number;
  deudaTotal: number;
  ticketsAbiertos: number;
  ordenesPendientes: number;
}

export async function getDashboardKPIs(cuits?: string[]): Promise<DashboardKPIData> {
  const now = new Date();
  const anio = now.getFullYear();
  const mes = now.getMonth() + 1;

  const consorciosF = cuitFilter(cuits, "c");
  const cobranzaF = cuitFilter(cuits, "c");
  const deudaF = cuitFilter(cuits, "c");
  const ticketsF = cuitFilter(cuits, "c");
  const ordenesF = cuitFilter(cuits, "c");

  const [consorciosRow, cobranzaRow, deudaRow, ticketsRow, ordenesRow] = await Promise.all([
    queryOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM app.consorcios c
       ${consorciosF.clause ? `WHERE ${consorciosF.clause}` : ""}`,
      consorciosF.params
    ),
    queryOne<{ total_liquidado: string; total_cobrado: string }>(
      `SELECT
         COALESCE(SUM(rcp.total_pagar), 0) AS total_liquidado,
         COALESCE(SUM(rcp.total_pagar) FILTER (WHERE rcp.estado = 'pagada'), 0) AS total_cobrado
       FROM app.res_cuenta_periodo rcp
       JOIN app.periodos_expensas pe ON pe.id = rcp.periodo_id
       JOIN app.consorcios c ON c.cuit = pe.consorcio_cuit
       WHERE pe.anio = $${cobranzaF.params.length + 1} AND pe.mes = $${cobranzaF.params.length + 2}
       ${cobranzaF.clause ? `AND ${cobranzaF.clause}` : ""}`,
      [...cobranzaF.params, anio, mes]
    ),
    queryOne<{ deuda_total: string }>(
      `SELECT COALESCE(SUM(dp.monto_capital_pendiente + dp.monto_intereses_pendiente), 0) AS deuda_total
       FROM app.deuda_periodo dp
       JOIN app.unidades u ON u.id = dp.unidad_id
       JOIN app.consorcios c ON c.cuit = u.consorcio_cuit
       WHERE dp.estado = 'pendiente'
       ${deudaF.clause ? `AND ${deudaF.clause}` : ""}`,
      deudaF.params
    ),
    queryOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM app.tickets t
       JOIN app.consorcios c ON c.cuit = t.consorcio_cuit
       WHERE t.estado NOT IN ('resuelto','cerrado')
       ${ticketsF.clause ? `AND ${ticketsF.clause}` : ""}`,
      ticketsF.params
    ),
    queryOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM app.ordenes_trabajo ot
       JOIN app.consorcios c ON c.cuit = ot.consorcio_cuit
       WHERE ot.estado NOT IN ('completada','cancelada')
       ${ordenesF.clause ? `AND ${ordenesF.clause}` : ""}`,
      ordenesF.params
    ),
  ]);

  const totalLiquidado = Number(cobranzaRow?.total_liquidado ?? 0);
  const totalCobrado = Number(cobranzaRow?.total_cobrado ?? 0);
  const cobranzaPct = totalLiquidado > 0 ? Math.round((totalCobrado / totalLiquidado) * 100) : 0;

  return {
    consorciosActivos: Number(consorciosRow?.count ?? 0),
    cobranzaPct,
    deudaTotal: Number(deudaRow?.deuda_total ?? 0),
    ticketsAbiertos: Number(ticketsRow?.count ?? 0),
    ordenesPendientes: Number(ordenesRow?.count ?? 0),
  };
}

export async function getConsorciosForFilter(): Promise<{ cuit: string; nombre: string }[]> {
  return query<{ cuit: string; nombre: string }>(
    "SELECT cuit, nombre FROM app.consorcios ORDER BY nombre"
  );
}
