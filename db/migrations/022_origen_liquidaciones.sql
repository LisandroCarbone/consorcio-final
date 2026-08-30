-- Historical liquidacion onboarding: tag manually-entered rows so the UI can
-- badge/lock them while leaving them fully visible to engine.ts queries
-- (which filter by estado='confirmada', not by origen).
ALTER TABLE app.liquidaciones_sueldo
  ADD COLUMN IF NOT EXISTS origen VARCHAR(20) NOT NULL DEFAULT 'sistema';

-- Note: no additional unique index is needed for duplicate-period prevention.
-- The existing UNIQUE (empleado_id, periodo, tipo) constraint from 001_init.sql
-- already rejects a second row for the same empleado_id + periodo + tipo='mensual',
-- covering both real and historical (origen='manual') rows.
