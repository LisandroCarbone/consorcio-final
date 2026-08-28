import { pool } from "@/lib/db";

export async function getLiquidacionDetalle(id: number) {
  const { rows } = await pool.query(
    `SELECT
       l.id, l.periodo::text AS periodo, l.tipo, l.estado,
       l.remuneracion_bruta, l.total_descuentos_empleado, l.total_aportes_patronales,
       l.base_patronal, l.neto_a_pagar, l.fecha_pago::text,
       e.cuil, e.nombre AS empleado_nombre, e.funcion, e.jornada,
       e.fecha_ingreso::text AS fecha_ingreso,
       DATE_PART('year', AGE(l.periodo, e.fecha_ingreso))::int AS antiguedad_anios,
       e.obra_social, e.cbu, e.banco, e.legajo, e.email, e.whatsapp,
       c.nombre AS consorcio_nombre, c.cuit AS consorcio_cuit,
       c.direccion AS consorcio_direccion,
       c.categoria_edificio AS consorcio_categoria,
       c.suterh_key AS nro_cta_suterh,
       c.pct_contrib_jubilacion, c.pct_contrib_obra_social,
       c.art_pct_variable, c.art_fijo,
       c.sv_costo_fijo, c.sv_cant_cuiles,
       c.pct_cct_suterh, c.pct_cct_fateryh, c.pct_cct_seracarh,
       n.horas_jornada::numeric AS novedad_horas_jornada,
       n.dias_trabajados_suplente::numeric AS novedad_dias_trabajados_suplente,
       n.suplencia_100_hs::numeric AS novedad_suplencia_100_hs,
       (SELECT p.fateryh_art19bis::numeric FROM app.parametros_cct p WHERE p.fecha_desde <= l.periodo ORDER BY p.fecha_desde DESC LIMIT 1) AS fateryh_art19bis,
       (SELECT p.sv_costo_fijo::numeric FROM app.parametros_cct p WHERE p.fecha_desde <= l.periodo ORDER BY p.fecha_desde DESC LIMIT 1) AS parametros_sv_costo_fijo
     FROM app.liquidaciones_sueldo l
     JOIN app.empleados e ON e.cuil = l.empleado_cuil
     JOIN app.consorcios c ON c.cuit = e.consorcio_cuit
     LEFT JOIN app.novedades_sueldo n ON n.empleado_cuil = e.cuil AND n.periodo = l.periodo
     WHERE l.id = $1`,
    [id]
  );
  if (rows.length === 0) return null;
  const liq = rows[0];

  const { rows: conceptoRows } = await pool.query(
    `SELECT code, tipo, concepto, importe, orden
     FROM app.conceptos_liquidacion
     WHERE liquidacion_id = $1
       AND tipo IN ('haber', 'descuento')
     ORDER BY orden`,
    [id]
  );
  liq.conceptos = conceptoRows;

  liq.ultimo_deposito_aportes = await getUltimoDepositoAportes(liq.consorcio_cuit, liq.periodo);

  return liq;
}

// Aportes y contribuciones se depositan con un mes de atraso (F.931 del mes
// anterior). Para el recibo de un período dado, se debe mostrar el depósito
// correspondiente al período INMEDIATO ANTERIOR, no el más reciente sin más
// (que podría ser del mismo mes del recibo si ya fue matcheado).
export async function getUltimoDepositoAportes(consorcioCuit: string, reciboPeriodo?: string) {
  const params: unknown[] = [consorcioCuit];
  let periodoFilter = "";
  if (reciboPeriodo) {
    const d = new Date(reciboPeriodo);
    const anio = d.getUTCFullYear();
    const mes = d.getUTCMonth() + 1;
    params.push(anio, mes);
    periodoFilter = `AND (pe.anio < $2 OR (pe.anio = $2 AND pe.mes <= $3))`;
  }
  const { rows } = await pool.query(
    `SELECT c.banco, em.fecha::text AS fecha, em.descripcion,
            pe.anio AS periodo_anio, pe.mes AS periodo_mes
     FROM app.extracto_movimientos em
     JOIN app.extractos_bancarios eb ON eb.id = em.extracto_id
     JOIN app.gastos_periodo gp ON gp.id = em.match_id
     JOIN app.periodos_expensas pe ON pe.id = gp.periodo_id
     JOIN app.consorcios c ON c.cuit = eb.consorcio_cuit
     WHERE eb.consorcio_cuit = $1
       AND em.estado_match = 'confirmado'
       AND em.match_tipo = 'gasto'
       AND em.es_credito = false
       AND (gp.descripcion ILIKE '%F. 931%' OR gp.descripcion ILIKE '%F.931%' OR gp.descripcion ILIKE '%AFIP%VEP%' OR gp.descripcion ILIKE '%ARCA%931%')
       ${periodoFilter}
     ORDER BY pe.anio DESC, pe.mes DESC, em.fecha DESC
     LIMIT 1`,
    params
  );
  if (rows.length === 0) return null;
  return rows[0];
}
