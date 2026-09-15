-- 030_suplente_reemplazo_fechas.sql
-- Add structured replacement date fields for suplentes eventuales.
-- These track the specific replacement period (start/end) independently
-- of the employment relationship dates (empleados.fecha_ingreso/egreso).

ALTER TABLE app.novedades_sueldo
  ADD COLUMN IF NOT EXISTS fecha_inicio_reemplazo DATE,
  ADD COLUMN IF NOT EXISTS fecha_fin_reemplazo DATE;
