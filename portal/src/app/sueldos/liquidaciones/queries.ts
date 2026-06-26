import { pool } from "@/lib/db";

export async function getLiquidacionDetalle(id: number) {
  const { rows } = await pool.query(
    `SELECT
       l.id, l.periodo::text AS periodo, l.tipo, l.estado,
       l.remuneracion_bruta, l.total_descuentos_empleado, l.neto_a_pagar,
       e.cuil, e.nombre AS empleado_nombre, e.funcion, e.jornada,
       e.fecha_ingreso::text AS fecha_ingreso,
       DATE_PART('year', AGE(l.periodo, e.fecha_ingreso))::int AS antiguedad_anios,
       e.obra_social, e.cbu, e.banco, e.legajo,
       c.nombre AS consorcio_nombre, c.cuit AS consorcio_cuit,
       c.suterh_key AS nro_cta_suterh,
       c.pct_contrib_jubilacion, c.pct_contrib_obra_social,
       c.art_pct_variable, c.art_fijo,
       c.sv_costo_fijo, c.sv_cant_cuiles,
       c.pct_cct_suterh, c.pct_cct_fateryh, c.pct_cct_seracarh
     FROM app.liquidaciones_sueldo l
     JOIN app.empleados e ON e.cuil = l.empleado_cuil
     JOIN app.consorcios c ON c.cuit = e.consorcio_cuit
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
  return liq;
}
