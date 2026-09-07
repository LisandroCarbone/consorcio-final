ALTER TABLE app.parametros_cct ADD COLUMN IF NOT EXISTS detraccion_fija_empleador NUMERIC(12,4) DEFAULT 0;
UPDATE app.parametros_cct SET detraccion_fija_empleador = 1800 WHERE detraccion_fija_empleador = 0 OR detraccion_fija_empleador IS NULL;
