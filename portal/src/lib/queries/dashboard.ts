import { query, queryOne } from "@/lib/db";

/**
 * Builds a WHERE clause fragment filtering by consorcio CUIT, plus the
 * matching parameter list. Returns an empty clause (no filter) when
 * `cuits` is undefined or empty — meaning "all consorcios".
 */
export function cuitFilter(
  cuits: string[] | undefined,
  alias: string = "c",
  column: string = "cuit"
): { clause: string; params: string[] } {
  if (!cuits?.length) return { clause: "", params: [] };
  const placeholders = cuits.map((_, i) => `$${i + 1}`).join(",");
  return { clause: `${alias}.${column} IN (${placeholders})`, params: cuits };
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

export interface MorosidadRow {
  consorcio: string;
  uf: string;
  propietario: string | null;
  capitalPendiente: number;
  interesesPendiente: number;
  deudaTotal: number;
  maxMesesAtraso: number;
  cartaDocumento: boolean;
}

export async function getMorosidadData(cuits?: string[]): Promise<MorosidadRow[]> {
  const f = cuitFilter(cuits, "c");

  const rows = await query<{
    consorcio: string;
    uf: string;
    propietario: string | null;
    capital_pendiente: string;
    intereses_pendiente: string;
    deuda_total: string;
    max_meses_atraso: string;
    carta_documento: boolean;
  }>(
    `SELECT
       c.nombre AS consorcio,
       u.uf,
       NULLIF(TRIM(COALESCE(prop.nombre,'') || ' ' || COALESCE(prop.apellido,'')), '') AS propietario,
       SUM(dp.monto_capital_pendiente) AS capital_pendiente,
       SUM(dp.monto_intereses_pendiente) AS intereses_pendiente,
       SUM(dp.monto_capital_pendiente + dp.monto_intereses_pendiente) AS deuda_total,
       MAX(dp.meses_atraso) AS max_meses_atraso,
       BOOL_OR(dp.meses_atraso >= 3) AS carta_documento
     FROM app.deuda_periodo dp
     JOIN app.unidades u ON u.id = dp.unidad_id
     JOIN app.consorcios c ON c.cuit = u.consorcio_cuit
     LEFT JOIN LATERAL (
       SELECT per.nombre, per.apellido
       FROM app.ocupantes o
       JOIN app.personas per ON per.id = o.persona_id
       WHERE o.unidad_id = u.id AND o.activo AND o.rol = 'propietario'
       ORDER BY o.desde DESC NULLS LAST
       LIMIT 1
     ) prop ON true
     WHERE dp.estado = 'pendiente'
     ${f.clause ? `AND ${f.clause}` : ""}
     GROUP BY c.cuit, c.nombre, u.id, u.uf, prop.nombre, prop.apellido
     HAVING SUM(dp.monto_capital_pendiente + dp.monto_intereses_pendiente) > 0
     ORDER BY max_meses_atraso DESC, deuda_total DESC
     LIMIT 25`,
    f.params
  );

  return rows.map((r) => ({
    consorcio: r.consorcio,
    uf: r.uf,
    propietario: r.propietario,
    capitalPendiente: Number(r.capital_pendiente),
    interesesPendiente: Number(r.intereses_pendiente),
    deudaTotal: Number(r.deuda_total),
    maxMesesAtraso: Number(r.max_meses_atraso),
    cartaDocumento: Boolean(r.carta_documento),
  }));
}

export interface CobranzaRow {
  consorcio: string;
  liquidado: number;
  cobrado: number;
}

export async function getCobranzaByConsorcio(cuits?: string[]): Promise<CobranzaRow[]> {
  const now = new Date();
  const anio = now.getFullYear();
  const mes = now.getMonth() + 1;

  const f = cuitFilter(cuits, "c");

  const rows = await query<{ consorcio: string; liquidado: string; cobrado: string }>(
    `SELECT c.nombre AS consorcio,
       COALESCE(SUM(rcp.total_pagar), 0) AS liquidado,
       COALESCE(SUM(rcp.total_pagar) FILTER (WHERE rcp.estado = 'pagada'), 0) AS cobrado
     FROM app.periodos_expensas pe
     JOIN app.consorcios c ON c.cuit = pe.consorcio_cuit
     LEFT JOIN app.res_cuenta_periodo rcp ON rcp.periodo_id = pe.id
     WHERE pe.anio = $${f.params.length + 1} AND pe.mes = $${f.params.length + 2}
     ${f.clause ? `AND ${f.clause}` : ""}
     GROUP BY c.cuit, c.nombre
     ORDER BY liquidado DESC`,
    [...f.params, anio, mes]
  );

  return rows.map((r) => ({
    consorcio: r.consorcio,
    liquidado: Number(r.liquidado),
    cobrado: Number(r.cobrado),
  }));
}

export interface CajaRow {
  consorcio: string;
  cuit: string;
  saldoBanco: number;
  cobroEfectivo: number;
  cobroTransferencia: number;
  cobroDebito: number;
  cobroOtro: number;
}

export async function getEstadoCaja(cuits?: string[]): Promise<CajaRow[]> {
  const f = cuitFilter(cuits, "c");

  const rows = await query<{
    consorcio: string;
    cuit: string;
    saldo_banco: string;
    cobro_efectivo: string;
    cobro_transferencia: string;
    cobro_debito: string;
    cobro_otro: string;
  }>(
    `SELECT
       c.nombre AS consorcio,
       c.cuit,
       COALESCE((
         SELECT eb.saldo_cierre FROM app.extractos_bancarios eb
         WHERE eb.consorcio_cuit = c.cuit
         ORDER BY eb.anio DESC, eb.mes DESC
         LIMIT 1
       ), 0) AS saldo_banco,
       COALESCE(SUM(p.monto) FILTER (WHERE p.medio_pago = 'efectivo'), 0) AS cobro_efectivo,
       COALESCE(SUM(p.monto) FILTER (WHERE p.medio_pago = 'transferencia'), 0) AS cobro_transferencia,
       COALESCE(SUM(p.monto) FILTER (WHERE p.medio_pago = 'debito_automatico'), 0) AS cobro_debito,
       COALESCE(SUM(p.monto) FILTER (WHERE COALESCE(p.medio_pago, 'otro') NOT IN ('efectivo','transferencia','debito_automatico')), 0) AS cobro_otro
     FROM app.consorcios c
     LEFT JOIN app.pagos p ON p.consorcio_cuit = c.cuit
       AND p.fecha >= date_trunc('month', CURRENT_DATE)
       AND p.fecha < date_trunc('month', CURRENT_DATE) + interval '1 month'
     ${f.clause ? `WHERE ${f.clause}` : ""}
     GROUP BY c.cuit, c.nombre
     ORDER BY c.nombre`,
    f.params
  );

  return rows.map((r) => ({
    consorcio: r.consorcio,
    cuit: r.cuit,
    saldoBanco: Number(r.saldo_banco),
    cobroEfectivo: Number(r.cobro_efectivo),
    cobroTransferencia: Number(r.cobro_transferencia),
    cobroDebito: Number(r.cobro_debito),
    cobroOtro: Number(r.cobro_otro),
  }));
}

export interface AlertItem {
  type: "morosidad" | "liquidacion" | "orden" | "ticket";
  severity: "high" | "medium";
  title: string;
  description: string;
  href: string;
}

export async function getAlertItems(cuits?: string[]): Promise<AlertItem[]> {
  const now = new Date();
  const anio = now.getFullYear();
  const mes = now.getMonth() + 1;
  const dayOfMonth = now.getDate();

  const morosidadF = cuitFilter(cuits, "u", "consorcio_cuit");
  const unliquidatedF = cuitFilter(cuits, "c");
  const ordenesF = cuitFilter(cuits, "ot", "consorcio_cuit");
  const ticketsF = cuitFilter(cuits, "t", "consorcio_cuit");

  const [morosidadRow, unliquidatedRows, ordenesRows, ticketsRows] = await Promise.all([
    queryOne<{ count: string }>(
      `SELECT COUNT(DISTINCT dp.unidad_id) AS count
       FROM app.deuda_periodo dp
       JOIN app.unidades u ON u.id = dp.unidad_id
       WHERE dp.meses_atraso >= 3 AND dp.estado = 'pendiente'
       ${morosidadF.clause ? `AND ${morosidadF.clause}` : ""}`,
      morosidadF.params
    ),
    dayOfMonth > 10
      ? query<{ nombre: string; anio: number; mes: number }>(
          `SELECT c.nombre, pe.anio, pe.mes
           FROM app.periodos_expensas pe
           JOIN app.consorcios c ON c.cuit = pe.consorcio_cuit
           WHERE pe.estado != 'liquidado' AND pe.anio = $${unliquidatedF.params.length + 1} AND pe.mes = $${unliquidatedF.params.length + 2}
           ${unliquidatedF.clause ? `AND ${unliquidatedF.clause}` : ""}
           ORDER BY c.nombre`,
          [...unliquidatedF.params, anio, mes]
        )
      : Promise.resolve([]),
    query<{ id: number; descripcion: string; consorcio_cuit: string }>(
      `SELECT ot.id, ot.descripcion, ot.consorcio_cuit
       FROM app.ordenes_trabajo ot
       WHERE ot.estado NOT IN ('completada','cancelada')
       AND ot.created_at < NOW() - interval '14 days'
       ${ordenesF.clause ? `AND ${ordenesF.clause}` : ""}
       ORDER BY ot.created_at ASC
       LIMIT 10`,
      ordenesF.params
    ),
    query<{ id: number; titulo: string; consorcio_cuit: string; prioridad: string }>(
      `SELECT t.id, t.titulo, t.consorcio_cuit, t.prioridad
       FROM app.tickets t
       WHERE t.estado NOT IN ('resuelto','cerrado')
       AND t.prioridad IN ('urgente','alta')
       AND t.created_at < NOW() - interval '48 hours'
       ${ticketsF.clause ? `AND ${ticketsF.clause}` : ""}
       ORDER BY t.created_at ASC
       LIMIT 10`,
      ticketsF.params
    ),
  ]);

  const items: AlertItem[] = [];

  const morosidadCount = Number(morosidadRow?.count ?? 0);
  if (morosidadCount > 0) {
    items.push({
      type: "morosidad",
      severity: "high",
      title: `${morosidadCount} unidad${morosidadCount === 1 ? "" : "es"} con 3+ meses de atraso`,
      description: "Requieren gestión de cobranza o carta documento.",
      href: "/finanzas/cuenta-corriente",
    });
  }

  for (const row of unliquidatedRows) {
    items.push({
      type: "liquidacion",
      severity: "medium",
      title: `${row.nombre}: período sin liquidar`,
      description: `El período ${row.mes}/${row.anio} sigue sin cerrarse tras el día 10.`,
      href: "/expensas",
    });
  }

  for (const row of ordenesRows) {
    items.push({
      type: "orden",
      severity: "medium",
      title: `Orden de trabajo demorada #${row.id}`,
      description: row.descripcion,
      href: "/proveedores",
    });
  }

  for (const row of ticketsRows) {
    items.push({
      type: "ticket",
      severity: "medium",
      title: `Ticket ${row.prioridad} sin atender #${row.id}`,
      description: row.titulo,
      href: "/tickets",
    });
  }

  return items;
}
