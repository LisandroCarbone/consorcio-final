-- ============================================================
-- 021: EMPLEADO SURROGATE ID (multi-consorcio support)
-- Replaces `cuil` as PK of app.empleados with a surrogate `id SERIAL`.
-- Allows the same CUIL to exist in multiple consorcios (each employment
-- relationship is a separate row). Enforces UNIQUE(cuil, consorcio_cuit).
--
-- Child tables (novedades_sueldo, liquidaciones_sueldo) get a new
-- empleado_id column, backfilled from the existing empleado_cuil column.
-- Old empleado_cuil columns are kept (nullable, denormalized) for one
-- release cycle to allow rollback — see ADR-1 in design doc.
--
-- Every statement is idempotent: safe to run multiple times, safe to run
-- against a DB where some steps already applied.
-- ============================================================

SET search_path TO app, public;

-- ------------------------------------------------------------
-- Phase 1: Add surrogate column
-- ------------------------------------------------------------
ALTER TABLE app.empleados ADD COLUMN IF NOT EXISTS id SERIAL;

-- ------------------------------------------------------------
-- Phase 2: Swap PK (only if cuil is still PK)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'app'
      AND t.relname = 'empleados'
      AND c.contype = 'p'
      AND c.conname = 'empleados_pkey'
      AND (
        SELECT array_agg(a.attname)
        FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord)
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k.attnum
      ) = ARRAY['cuil']
  ) THEN
    ALTER TABLE app.empleados DROP CONSTRAINT empleados_pkey;
    ALTER TABLE app.empleados ADD PRIMARY KEY (id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_empleados_cuil_consorcio'
  ) THEN
    ALTER TABLE app.empleados
      ADD CONSTRAINT uq_empleados_cuil_consorcio UNIQUE (cuil, consorcio_cuit);
  END IF;
END $$;

-- ------------------------------------------------------------
-- Phase 3: Add empleado_id columns to child tables
-- ------------------------------------------------------------
ALTER TABLE app.novedades_sueldo ADD COLUMN IF NOT EXISTS empleado_id INTEGER;
ALTER TABLE app.liquidaciones_sueldo ADD COLUMN IF NOT EXISTS empleado_id INTEGER;

-- ------------------------------------------------------------
-- Phase 4: Backfill empleado_id from cuil join
-- ------------------------------------------------------------
UPDATE app.novedades_sueldo n
SET empleado_id = e.id
FROM app.empleados e
WHERE e.cuil = n.empleado_cuil
  AND n.empleado_id IS NULL;

UPDATE app.liquidaciones_sueldo l
SET empleado_id = e.id
FROM app.empleados e
WHERE e.cuil = l.empleado_cuil
  AND l.empleado_id IS NULL;

-- ------------------------------------------------------------
-- Phase 5: Make empleado_id NOT NULL + FK (only once backfill is complete)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM app.novedades_sueldo WHERE empleado_id IS NULL) THEN
    ALTER TABLE app.novedades_sueldo ALTER COLUMN empleado_id SET NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_novedades_empleado_id'
  ) THEN
    ALTER TABLE app.novedades_sueldo
      ADD CONSTRAINT fk_novedades_empleado_id
      FOREIGN KEY (empleado_id) REFERENCES app.empleados(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM app.liquidaciones_sueldo WHERE empleado_id IS NULL) THEN
    ALTER TABLE app.liquidaciones_sueldo ALTER COLUMN empleado_id SET NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_liquidaciones_empleado_id'
  ) THEN
    ALTER TABLE app.liquidaciones_sueldo
      ADD CONSTRAINT fk_liquidaciones_empleado_id
      FOREIGN KEY (empleado_id) REFERENCES app.empleados(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ------------------------------------------------------------
-- Phase 6: Replace unique constraints on child tables (cuil -> id)
-- ------------------------------------------------------------
ALTER TABLE app.novedades_sueldo DROP CONSTRAINT IF EXISTS novedades_sueldo_empleado_cuil_periodo_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_novedades_empleado_id_periodo
  ON app.novedades_sueldo(empleado_id, periodo);

ALTER TABLE app.liquidaciones_sueldo DROP CONSTRAINT IF EXISTS liquidaciones_sueldo_empleado_cuil_periodo_tipo_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_liquidaciones_empleado_id_periodo_tipo
  ON app.liquidaciones_sueldo(empleado_id, periodo, tipo);

-- ------------------------------------------------------------
-- Phase 7: Indexes for the new FK columns
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_novedades_empleado_id ON app.novedades_sueldo(empleado_id);
CREATE INDEX IF NOT EXISTS idx_liquidaciones_empleado_id ON app.liquidaciones_sueldo(empleado_id);

-- ------------------------------------------------------------
-- Phase 8 (DEFERRED — do not run yet): drop old empleado_cuil columns.
-- Keep for one release cycle to allow rollback (ADR-1). Uncomment
-- manually after confirming rollback is not needed.
-- ------------------------------------------------------------
-- ALTER TABLE app.novedades_sueldo DROP COLUMN empleado_cuil;
-- ALTER TABLE app.liquidaciones_sueldo DROP COLUMN empleado_cuil;
