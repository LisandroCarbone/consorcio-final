-- 029_perf_indexes.sql
-- Performance review: add missing indexes identified across finanzas/sueldos/expensas queries.
-- No existing index in 001-028 covers these access patterns (checked via grep of "CREATE INDEX").

-- app.periodos_expensas: queried by (consorcio_cuit, anio, mes) exact match, and by
-- consorcio_cuit with ORDER BY anio DESC, mes DESC LIMIT 1 (latest period lookup).
-- Hit in src/app/finanzas/actions.ts, expensas/conciliacion-bancaria/page.tsx,
-- sueldos/page.tsx, expensas/page.tsx. Currently a full seq scan on every call.
CREATE INDEX IF NOT EXISTS idx_periodos_expensas_consorcio_anio_mes
  ON app.periodos_expensas (consorcio_cuit, anio DESC, mes DESC);

-- app.empleados: hot filter is (consorcio_cuit, estado='activo'), not just consorcio_cuit.
-- Existing idx_empleados_consorcio only covers the single column.
-- Hit in sueldos/page.tsx, expensas/page.tsx, api/sueldos/liquidar/route.ts.
CREATE INDEX IF NOT EXISTS idx_empleados_consorcio_estado
  ON app.empleados (consorcio_cuit, estado);

-- app.escalas_suterh: filtered by periodo on every liquidacion calculation
-- (engine.ts calcularLiquidacion, called once per empleado per periodo).
CREATE INDEX IF NOT EXISTS idx_escalas_suterh_periodo
  ON app.escalas_suterh (periodo);

-- app.adicionales_suterh: same access pattern, filtered by periodo.
CREATE INDEX IF NOT EXISTS idx_adicionales_suterh_periodo
  ON app.adicionales_suterh (periodo);

-- app.parametros_cct: WHERE fecha_desde <= $1 ORDER BY fecha_desde DESC LIMIT 1.
-- Small table today, but the lookup runs once per liquidacion; index avoids a sort
-- as the historical table grows.
CREATE INDEX IF NOT EXISTS idx_parametros_cct_fecha_desde
  ON app.parametros_cct (fecha_desde DESC);
