-- Split periodos_expensas.monto_fijo into independent A/B fixed amounts for
-- 'fija' tipo_expensas consorcios. When set, monto_fijo_a/monto_fijo_b take
-- precedence over the legacy monto_fijo + pct_expensa_a proportional split.
ALTER TABLE app.periodos_expensas ADD COLUMN IF NOT EXISTS monto_fijo_a NUMERIC(14,2);
ALTER TABLE app.periodos_expensas ADD COLUMN IF NOT EXISTS monto_fijo_b NUMERIC(14,2);
