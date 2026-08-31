// Next.js instrumentation hook — runs once at server startup (not at build time).
// Explicitly validates env vars so missing/empty required vars throw before the
// app accepts connections. env.ts itself validates lazily (Proxy) so this is the
// deliberate eager trigger point.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("@/lib/env");
    validateEnv();

    // Auto-migrate: add base_patronal column if missing
    try {
      const { pool } = await import("@/lib/db");
      await pool.query(
        "ALTER TABLE app.liquidaciones_sueldo ADD COLUMN IF NOT EXISTS base_patronal NUMERIC(14,2)"
      );
    } catch {
      // Non-fatal — column may already exist or DB not ready yet
    }

    // Auto-migrate: add fecha_pago column if missing
    try {
      const { pool } = await import("@/lib/db");
      await pool.query(
        "ALTER TABLE app.liquidaciones_sueldo ADD COLUMN IF NOT EXISTS fecha_pago DATE"
      );
    } catch {
      // Non-fatal
    }

    // Auto-migrate: create append-only audit_log table if missing
    try {
      const { pool } = await import("@/lib/db");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS app.audit_log (
          id          BIGSERIAL PRIMARY KEY,
          timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          username    TEXT NOT NULL,
          action      TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id   TEXT NOT NULL DEFAULT '',
          consorcio_cuit TEXT,
          details     JSONB NOT NULL DEFAULT '{}',
          ip_address  INET
        )
      `);
      await pool.query(
        "CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON app.audit_log (entity_type, entity_id)"
      );
      await pool.query(
        "CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON app.audit_log (timestamp DESC)"
      );
      await pool.query(
        "CREATE INDEX IF NOT EXISTS idx_audit_log_consorcio ON app.audit_log (consorcio_cuit) WHERE consorcio_cuit IS NOT NULL"
      );
    } catch {
      // Non-fatal — table may already exist or DB not ready yet
    }

    // Auto-migrate: empleado surrogate id (multi-consorcio support)
    // See db/migrations/021_empleado_surrogate_id.sql for the full rationale.
    // Every statement below is idempotent — safe to run on every startup.
    try {
      const { pool } = await import("@/lib/db");

      await pool.query(
        "ALTER TABLE app.empleados ADD COLUMN IF NOT EXISTS id SERIAL"
      );

      // Drop old FKs that reference empleados(cuil) before changing PK
      await pool.query("ALTER TABLE app.liquidaciones_sueldo DROP CONSTRAINT IF EXISTS liquidaciones_sueldo_empleado_cuil_fkey");
      await pool.query("ALTER TABLE app.novedades_sueldo DROP CONSTRAINT IF EXISTS novedades_sueldo_empleado_cuil_fkey");

      await pool.query(`
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
              )::text[] = ARRAY['cuil']
          ) THEN
            ALTER TABLE app.empleados DROP CONSTRAINT empleados_pkey;
            ALTER TABLE app.empleados ADD PRIMARY KEY (id);
          END IF;
        END $$;
      `);

      await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'uq_empleados_cuil_consorcio'
          ) THEN
            ALTER TABLE app.empleados
              ADD CONSTRAINT uq_empleados_cuil_consorcio UNIQUE (cuil, consorcio_cuit);
          END IF;
        END $$;
      `);

      await pool.query(
        "ALTER TABLE app.novedades_sueldo ADD COLUMN IF NOT EXISTS empleado_id INTEGER"
      );
      await pool.query(
        "ALTER TABLE app.liquidaciones_sueldo ADD COLUMN IF NOT EXISTS empleado_id INTEGER"
      );

      // Make old empleado_cuil columns nullable (code no longer populates them)
      await pool.query("ALTER TABLE app.novedades_sueldo ALTER COLUMN empleado_cuil DROP NOT NULL");
      await pool.query("ALTER TABLE app.liquidaciones_sueldo ALTER COLUMN empleado_cuil DROP NOT NULL");

      await pool.query(`
        UPDATE app.novedades_sueldo n
        SET empleado_id = e.id
        FROM app.empleados e
        WHERE e.cuil = n.empleado_cuil
          AND n.empleado_id IS NULL
      `);
      await pool.query(`
        UPDATE app.liquidaciones_sueldo l
        SET empleado_id = e.id
        FROM app.empleados e
        WHERE e.cuil = l.empleado_cuil
          AND l.empleado_id IS NULL
      `);

      await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM app.novedades_sueldo WHERE empleado_id IS NULL) THEN
            ALTER TABLE app.novedades_sueldo ALTER COLUMN empleado_id SET NOT NULL;
          END IF;
        END $$;
      `);
      await pool.query(`
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
      `);

      await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM app.liquidaciones_sueldo WHERE empleado_id IS NULL) THEN
            ALTER TABLE app.liquidaciones_sueldo ALTER COLUMN empleado_id SET NOT NULL;
          END IF;
        END $$;
      `);
      await pool.query(`
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
      `);

      await pool.query(
        "ALTER TABLE app.novedades_sueldo DROP CONSTRAINT IF EXISTS novedades_sueldo_empleado_cuil_periodo_key"
      );
      await pool.query(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_novedades_empleado_id_periodo ON app.novedades_sueldo(empleado_id, periodo)"
      );
      await pool.query(
        "ALTER TABLE app.liquidaciones_sueldo DROP CONSTRAINT IF EXISTS liquidaciones_sueldo_empleado_cuil_periodo_tipo_key"
      );
      await pool.query(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_liquidaciones_empleado_id_periodo_tipo ON app.liquidaciones_sueldo(empleado_id, periodo, tipo)"
      );

      await pool.query(
        "CREATE INDEX IF NOT EXISTS idx_novedades_empleado_id ON app.novedades_sueldo(empleado_id)"
      );
      await pool.query(
        "CREATE INDEX IF NOT EXISTS idx_liquidaciones_empleado_id ON app.liquidaciones_sueldo(empleado_id)"
      );
    } catch (err) {
      console.error("[instrumentation] empleado surrogate-id migration failed:", err);
    }

    // One-shot fix: correct Ley 26475 → 26474 typo in existing conceptos
    try {
      const { pool } = await import("@/lib/db");
      await pool.query(
        `UPDATE app.conceptos_liquidacion SET concepto = REPLACE(concepto, '26475', '26474') WHERE concepto LIKE '%26475%'`
      );
    } catch {
      // Non-fatal
    }

    // Migration 022: add origen column to liquidaciones_sueldo
    try {
      const { pool } = await import("@/lib/db");
      await pool.query(
        `ALTER TABLE app.liquidaciones_sueldo ADD COLUMN IF NOT EXISTS origen VARCHAR(20) NOT NULL DEFAULT 'sistema'`
      );
    } catch {
      // Non-fatal — column may already exist
    }

    // Migration 019: cuota tracking columns on gastos_periodo.
    // This migration file existed in db/migrations/019_cuota_tracking.sql but was
    // never wired into this auto-migrate startup hook (unlike 020-022), so on
    // environments where it was never run manually, every query touching
    // cuota_grupo_id/cuota_nro/cuota_total/consorcio_cuit (installment expenses,
    // "gastos en cuota") throws "column does not exist" and crashes the
    // /expensas Server Component. All statements are idempotent.
    try {
      const { pool } = await import("@/lib/db");
      await pool.query("ALTER TABLE app.gastos_periodo ADD COLUMN IF NOT EXISTS cuota_grupo_id UUID");
      await pool.query("ALTER TABLE app.gastos_periodo ADD COLUMN IF NOT EXISTS cuota_nro INT");
      await pool.query("ALTER TABLE app.gastos_periodo ADD COLUMN IF NOT EXISTS cuota_total INT");
      await pool.query(
        "ALTER TABLE app.gastos_periodo ADD COLUMN IF NOT EXISTS consorcio_cuit TEXT REFERENCES app.consorcios(cuit)"
      );
      await pool.query("ALTER TABLE app.gastos_periodo ALTER COLUMN periodo_id DROP NOT NULL");
      await pool.query(
        "CREATE INDEX IF NOT EXISTS idx_gastos_periodo_cuota_grupo ON app.gastos_periodo (cuota_grupo_id) WHERE cuota_grupo_id IS NOT NULL"
      );
      await pool.query(
        "CREATE INDEX IF NOT EXISTS idx_gastos_periodo_pending ON app.gastos_periodo (consorcio_cuit) WHERE periodo_id IS NULL AND cuota_grupo_id IS NOT NULL"
      );
    } catch (err) {
      console.error("[instrumentation] cuota_tracking migration failed:", err);
    }
  }
}
