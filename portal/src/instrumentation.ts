// Next.js instrumentation hook — runs once at server startup (not at build time).
// Explicitly validates env vars so missing/empty required vars throw before the
// app accepts connections. env.ts itself validates lazily (Proxy) so this is the
// deliberate eager trigger point.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    process.on("unhandledRejection", (reason) => {
      const msg = reason instanceof Error ? reason.message : String(reason);
      if (msg.includes("ECONNRESET") || msg.includes("aborted")) return;
      console.error("[unhandledRejection]", reason);
    });

    const { validateEnv } = await import("@/lib/env");
    validateEnv();

    const { runMigrations } = await import("@/lib/migrate");
    await runMigrations();
  }
}
