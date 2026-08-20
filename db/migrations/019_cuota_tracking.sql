-- Cuota tracking: allow gastos split into installments to live as "pending"
-- rows (periodo_id = NULL) until manually assigned to a period.
ALTER TABLE app.gastos_periodo ADD COLUMN IF NOT EXISTS cuota_grupo_id UUID;
ALTER TABLE app.gastos_periodo ADD COLUMN IF NOT EXISTS cuota_nro INT;
ALTER TABLE app.gastos_periodo ADD COLUMN IF NOT EXISTS cuota_total INT;
ALTER TABLE app.gastos_periodo ADD COLUMN IF NOT EXISTS consorcio_cuit TEXT REFERENCES app.consorcios(cuit);

-- periodo_id must be nullable to support pending cuotas
ALTER TABLE app.gastos_periodo ALTER COLUMN periodo_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gastos_periodo_cuota_grupo
  ON app.gastos_periodo (cuota_grupo_id) WHERE cuota_grupo_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gastos_periodo_pending
  ON app.gastos_periodo (consorcio_cuit) WHERE periodo_id IS NULL AND cuota_grupo_id IS NOT NULL;
