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
  }
}
