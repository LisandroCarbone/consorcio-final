import { Pool, type PoolClient } from "pg";

declare global {
  // Prevent multiple pool instances in dev HMR
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool() {
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      options: "-c search_path=app,public -c timezone=UTC",
    });
  }
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

// Runs `fn` inside a BEGIN/COMMIT transaction on a dedicated pool client.
// Rolls back and rethrows on any error. Callers must issue all statements
// for the unit of work via the provided client (not the shared `query`
// helper, which uses its own untransacted pool connection).
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
