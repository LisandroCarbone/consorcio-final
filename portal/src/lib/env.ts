// Fail-fast environment variable validation.
// Imported by instrumentation.ts so missing/empty required vars throw at startup,
// before the app accepts any connections. No hardcoded fallbacks are permitted here.

interface Env {
  AUTH_USER: string;
  AUTH_PASSWORD: string;
  AUTH_SECRET: string;
  ARCA_ENCRYPTION_KEY: string;
  AGENT_API_KEY: string;
  DATABASE_URL: string;
  REDIS_URL: string;
}

const REQUIRED_VARS = [
  "AUTH_USER",
  "AUTH_PASSWORD",
  "AUTH_SECRET",
  "ARCA_ENCRYPTION_KEY",
  "AGENT_API_KEY",
  "DATABASE_URL",
  "REDIS_URL",
] as const;

export function validateEnv(): Env {
  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Set them before starting the application. See .env.example for reference."
    );
  }

  return {
    AUTH_USER: process.env.AUTH_USER!,
    AUTH_PASSWORD: process.env.AUTH_PASSWORD!,
    AUTH_SECRET: process.env.AUTH_SECRET!,
    ARCA_ENCRYPTION_KEY: process.env.ARCA_ENCRYPTION_KEY!,
    AGENT_API_KEY: process.env.AGENT_API_KEY!,
    DATABASE_URL: process.env.DATABASE_URL!,
    REDIS_URL: process.env.REDIS_URL!,
  };
}

// `env` is a lazy proxy: validation runs on first property access, not at
// module import time. This keeps fail-fast semantics at real runtime (first
// request / instrumentation.ts) without breaking `next build`, which statically
// imports route modules for page-data collection and would otherwise throw
// even though no request is being served.
let cached: Env | undefined;

export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    if (!cached) cached = validateEnv();
    return cached[prop as keyof Env];
  },
});
