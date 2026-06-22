import { Pool } from "pg";

declare global {
  // Prevent multiple pool instances in dev HMR
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool() {
  return new Pool({
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? "consorcio",
    user: process.env.POSTGRES_USER ?? "consorcio",
    password: process.env.POSTGRES_PASSWORD ?? "consorcio_secret",
    options: "-c search_path=app,public -c timezone=UTC",
  });
}

export const pool = global.__pgPool ?? (global.__pgPool = createPool());

export async function query<T extends Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query<T>(sql, params);
  return result.rows;
}

export async function queryOne<T extends Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
