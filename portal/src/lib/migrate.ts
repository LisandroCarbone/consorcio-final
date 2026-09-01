// SQL migration runner — replaces the old inline try/catch blocks that used
// to live in instrumentation.ts. Reads *.sql files from db/migrations/,
// tracks applied versions in app.schema_migrations, and runs unapplied
// migrations in order, each inside its own transaction.
//
// Non-fatal by design: a failing migration is logged but does not crash the
// app on startup (same behavior as the code this replaces).

import fs from "node:fs";
import path from "node:path";

const MIGRATIONS_DIR = path.join(process.cwd(), "..", "db", "migrations");

interface MigrationFile {
  version: number;
  name: string;
  fullPath: string;
}

function loadMigrationFiles(): MigrationFile[] {
  let entries: string[];
  try {
    entries = fs.readdirSync(MIGRATIONS_DIR);
  } catch (err) {
    console.error(`[migrate] Could not read migrations dir ${MIGRATIONS_DIR}:`, err);
    return [];
  }

  const migrations: MigrationFile[] = [];
  for (const name of entries) {
    if (!name.endsWith(".sql")) continue;
    const match = name.match(/^(\d+)_/);
    if (!match) continue;
    migrations.push({
      version: Number.parseInt(match[1], 10),
      name,
      fullPath: path.join(MIGRATIONS_DIR, name),
    });
  }

  migrations.sort((a, b) => a.version - b.version);
  return migrations;
}

export async function runMigrations(): Promise<void> {
  const { pool } = await import("@/lib/db");

  // 1. Ensure the tracking table exists.
  let trackingTableExisted = true;
  try {
    const check = await pool.query(
      "SELECT to_regclass('app.schema_migrations') AS reg"
    );
    trackingTableExisted = check.rows[0]?.reg !== null;

    await pool.query(`
      CREATE TABLE IF NOT EXISTS app.schema_migrations (
        version INT PRIMARY KEY,
        name TEXT,
        applied_at TIMESTAMPTZ DEFAULT now()
      )
    `);
  } catch (err) {
    console.error("[migrate] Failed to ensure schema_migrations table:", err);
    return;
  }

  const migrations = loadMigrationFiles();
  if (migrations.length === 0) {
    console.log("[migrate] No migration files found, skipping.");
    return;
  }

  // 2. Bootstrap: if the tracking table didn't exist yet but the schema
  // clearly already has data from previous inline migrations (app.consorcios
  // exists), assume every currently known migration has already been
  // effectively applied. Seed schema_migrations without running them.
  if (!trackingTableExisted) {
    try {
      const check = await pool.query(
        "SELECT to_regclass('app.consorcios') AS reg"
      );
      const consorciosExists = check.rows[0]?.reg !== null;

      if (consorciosExists) {
        console.log(
          "[migrate] Existing database detected — seeding schema_migrations with known versions without running them."
        );
        for (const m of migrations) {
          await pool.query(
            "INSERT INTO app.schema_migrations (version, name) VALUES ($1, $2) ON CONFLICT (version) DO NOTHING",
            [m.version, m.name]
          );
        }
        return;
      }
    } catch (err) {
      console.error("[migrate] Bootstrap detection failed:", err);
      // Fall through and attempt to run migrations normally.
    }
  }

  // 3. Find which versions are already applied.
  let appliedVersions = new Set<number>();
  try {
    const result = await pool.query<{ version: number }>(
      "SELECT version FROM app.schema_migrations"
    );
    appliedVersions = new Set(result.rows.map((r) => r.version));
  } catch (err) {
    console.error("[migrate] Failed to read schema_migrations:", err);
    return;
  }

  // 4. Run unapplied migrations in order, each in its own transaction.
  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) continue;

    console.log(`[migrate] Applying ${migration.name}...`);

    let sql: string;
    try {
      sql = fs.readFileSync(migration.fullPath, "utf-8");
    } catch (err) {
      console.error(`[migrate] Could not read ${migration.name}:`, err);
      continue;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO app.schema_migrations (version, name) VALUES ($1, $2) ON CONFLICT (version) DO NOTHING",
        [migration.version, migration.name]
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`[migrate] Migration ${migration.name} failed (non-fatal):`, err);
    } finally {
      client.release();
    }
  }
}
