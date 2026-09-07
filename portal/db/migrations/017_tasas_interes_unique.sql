-- Add UNIQUE constraint on (consorcio_cuit, fecha_desde) to prevent
-- ambiguous rate lookups in interest-engine.ts buscarTasaVigente.
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasas_interes_consorcio_fecha
  ON app.tasas_interes (consorcio_cuit, fecha_desde);
