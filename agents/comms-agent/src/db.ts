import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.POSTGRES_HOST ?? "localhost",
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  database: process.env.POSTGRES_DB ?? "consorcio",
  user: process.env.POSTGRES_USER ?? "consorcio",
  password: process.env.POSTGRES_PASSWORD ?? "consorcio_secret",
  options: "-c search_path=app,public",
});

export async function query<T extends pg.QueryResultRow>(sql: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query<T>(sql, params);
  return result.rows;
}

export async function queryOne<T extends pg.QueryResultRow>(sql: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
