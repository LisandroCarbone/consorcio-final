-- ============================================================
-- 034: SUPLENTES Y REACTIVACIÓN DE EMPLEADOS
-- Relaxes the blanket UNIQUE(cuil, consorcio_cuit) constraint to a
-- partial unique index that only applies to active employees, so an
-- inactive (former) employee can be rehired as a new row without
-- colliding with their own historical record. Adds 'pendiente_revision'
-- as a valid estado for suplentes whose fecha_fin_reemplazo has expired
-- and are awaiting admin confirmation (baja or extensión).
--
-- Every statement is idempotent: safe to run multiple times.
-- ============================================================

SET search_path TO app, public;

-- ------------------------------------------------------------
-- Phase 1: Pre-validation — abort if duplicate ACTIVE (cuil, consorcio_cuit)
-- rows already exist. The partial unique index cannot be created otherwise.
-- ------------------------------------------------------------
DO $$
DECLARE
  dup_count integer;
  dup_list  text;
BEGIN
  SELECT COUNT(*), string_agg(cuil || ' / ' || consorcio_cuit, ', ')
    INTO dup_count, dup_list
  FROM (
    SELECT cuil, consorcio_cuit
    FROM app.empleados
    WHERE estado = 'activo'
    GROUP BY cuil, consorcio_cuit
    HAVING COUNT(*) > 1
  ) dups;

  IF dup_count > 0 THEN
    RAISE EXCEPTION 'Migración 034 abortada: existen % pares (cuil / consorcio_cuit) con más de un empleado activo: %. Resolvé los duplicados antes de continuar.', dup_count, dup_list;
  END IF;
END $$;

-- ------------------------------------------------------------
-- Phase 2: Drop the blanket unique constraints on (cuil, consorcio_cuit).
-- Two may exist historically: the table-level constraint auto-named by
-- Postgres in 001_init, and the explicitly-named one added in 021.
-- ------------------------------------------------------------
ALTER TABLE app.empleados DROP CONSTRAINT IF EXISTS empleados_cuil_consorcio_cuit_key;
ALTER TABLE app.empleados DROP CONSTRAINT IF EXISTS uq_empleados_cuil_consorcio;

-- ------------------------------------------------------------
-- Phase 3: Partial unique index — at most one ACTIVE employee per
-- (cuil, consorcio_cuit). Inactive/pendiente_revision rows are excluded,
-- allowing rehires to create a new active row for a previously-employed
-- person without violating uniqueness.
-- ------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_empleados_cuil_consorcio_activo
  ON app.empleados (cuil, consorcio_cuit)
  WHERE estado = 'activo';

-- ------------------------------------------------------------
-- Phase 4: Add 'pendiente_revision' to the estado CHECK constraint.
-- ------------------------------------------------------------
ALTER TABLE app.empleados DROP CONSTRAINT IF EXISTS empleados_estado_check;
ALTER TABLE app.empleados
  ADD CONSTRAINT empleados_estado_check CHECK (estado IN ('activo', 'inactivo', 'pendiente_revision'));
