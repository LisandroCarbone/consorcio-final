-- Motor de Intereses Real — Phase 3: data migration
-- Populates tasas_interes and deuda_periodo from existing data. Purely
-- additive: does not touch res_cuenta_periodo, periodos_expensas, or any
-- other pre-existing table/column.
--
-- Rollback:
--   DELETE FROM app.deuda_periodo;
--   DELETE FROM app.tasas_interes;
-- (existing tables are untouched by this migration)

-- 3.2 Seed tasas_interes with the current rate per consorcio.
-- vigente_desde = earliest known period's fecha_vencimiento (or fecha_cierre
-- as fallback) for that consorcio, so it covers every existing period.
INSERT INTO app.tasas_interes (consorcio_cuit, tasa, fecha_desde, fecha_hasta)
SELECT
  c.cuit,
  c.interest_rate,
  COALESCE(
    (SELECT MIN(COALESCE(p.fecha_vencimiento, (p.anio || '-' || LPAD(p.mes::text, 2, '0') || '-01')::date))
     FROM app.periodos_expensas p
     WHERE p.consorcio_cuit = c.cuit),
    CURRENT_DATE
  ) AS fecha_desde,
  NULL::date
FROM app.consorcios c
WHERE NOT EXISTS (
  SELECT 1 FROM app.tasas_interes t WHERE t.consorcio_cuit = c.cuit
);

-- 3.1 Populate deuda_periodo from existing res_cuenta_periodo rows that are
-- not fully paid and have an actual amount due.
-- monto_original excludes the cascading `deuda` component (which duplicates
-- prior-period debt already tracked separately) and subtracts payments
-- already recorded in app.pagos so capital pendiente is not overstated.
-- meses_atraso is computed from the period's fecha_vencimiento vs. today.
WITH pagos_por_res_cuenta AS (
  SELECT p.res_cuenta_id, SUM(p.monto) AS total_pagado
  FROM app.pagos p
  GROUP BY p.res_cuenta_id
)
INSERT INTO app.deuda_periodo (
  unidad_id,
  periodo_id,
  monto_original,
  monto_capital_pendiente,
  monto_intereses_acumulado,
  monto_intereses_pendiente,
  meses_atraso,
  estado
)
SELECT
  r.unidad_id,
  r.periodo_id,
  (r.expensas_a + r.expensas_b + r.s_asamblea + r.otros + r.gast_part) AS monto_original,
  GREATEST(
    0,
    (r.expensas_a + r.expensas_b + r.s_asamblea + r.otros + r.gast_part)
      - COALESCE(pg.total_pagado, 0)
  ) AS monto_capital_pendiente,
  r.intereses,
  r.intereses,
  GREATEST(
    0,
    (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pe.fecha_vencimiento)) * 12
      + (EXTRACT(MONTH FROM CURRENT_DATE) - EXTRACT(MONTH FROM pe.fecha_vencimiento))
  )::integer AS meses_atraso,
  CASE WHEN r.estado = 'vencida' THEN 'pendiente' ELSE r.estado END
FROM app.res_cuenta_periodo r
JOIN app.periodos_expensas pe ON pe.id = r.periodo_id
LEFT JOIN pagos_por_res_cuenta pg ON pg.res_cuenta_id = r.id
WHERE r.estado != 'pagada'
  AND r.total_pagar > 0
ON CONFLICT (unidad_id, periodo_id) DO NOTHING;
