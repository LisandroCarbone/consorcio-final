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

    // One-shot fix: reset liquidación 1526 to borrador so it can be recalculated
    try {
      const { pool } = await import("@/lib/db");
      await pool.query(
        "UPDATE app.liquidaciones_sueldo SET estado = 'borrador' WHERE id = 1526 AND estado = 'confirmada'"
      );
    } catch { }

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
  }
}
