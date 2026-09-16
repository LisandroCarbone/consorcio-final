-- Add cuota extraordinaria columns to consorcios (mirrors fondo_obra pattern)
ALTER TABLE app.consorcios
  ADD COLUMN IF NOT EXISTS cuota_extra_activo BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cuota_extra NUMERIC(12,2) DEFAULT NULL;

-- Add cuota_extra column to res_cuenta_periodo for per-unit tracking
ALTER TABLE app.res_cuenta_periodo
  ADD COLUMN IF NOT EXISTS cuota_extra NUMERIC(12,2) NOT NULL DEFAULT 0;
