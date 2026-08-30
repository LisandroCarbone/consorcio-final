// Audit logging — append-only trail of mutating/sensitive actions.
// `logAudit` resolves the current user/IP from the request context (cookies +
// headers) and writes fire-and-forget so it never blocks or fails the caller.
// `logAuditDirect` is for API route handlers (login/logout) where the
// username/IP are already resolved (or, for failed logins, there is no valid
// session to read).

import { cookies, headers } from "next/headers";
import { pool } from "./db";
import { AUTH_COOKIE_NAME, verifySessionToken } from "./auth";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "confirm"
  | "annul"
  | "login"
  | "logout"
  | "login_failed"
  | "access"
  | "historico_create"
  | "historico_update"
  | "historico_delete";

export interface AuditEntry {
  id: number;
  timestamp: Date;
  username: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  consorcio_cuit: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
}

// Fields stripped from `details` at any nesting depth before insert. Never
// log secrets — passwords, tokens, encryption keys, credentials, etc.
const SENSITIVE_KEYS = [
  "password",
  "token",
  "secret",
  "key",
  "credential",
  "clave",
  "encryption",
];

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEYS.some((sk) => lower.includes(sk));
}

// Recursively strips any object key matching the sensitive-key list.
// Returns a new object/array — does not mutate the input.
export function stripSensitiveKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((v) => stripSensitiveKeys(v));
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (isSensitiveKey(k)) continue;
      out[k] = stripSensitiveKeys(v);
    }
    return out;
  }
  return value;
}

async function resolveIp(): Promise<string | null> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]?.trim() || null;
    return null;
  } catch {
    return null;
  }
}

async function resolveUsername(): Promise<string | null> {
  try {
    const store = await cookies();
    const token = store.get(AUTH_COOKIE_NAME)?.value;
    const { valid, username } = await verifySessionToken(token);
    return valid && username ? username : null;
  } catch {
    return null;
  }
}

async function insertAuditRow(
  username: string,
  ip: string | null,
  action: AuditAction,
  entityType: string,
  entityId: string | number | null | undefined,
  details: Record<string, unknown> | undefined,
  consorcioCuit: string | null | undefined
): Promise<void> {
  const cleanDetails = stripSensitiveKeys(details ?? {});
  try {
    await pool.query(
      `INSERT INTO app.audit_log
         (username, action, entity_type, entity_id, consorcio_cuit, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        username,
        action,
        entityType,
        entityId != null ? String(entityId) : null,
        consorcioCuit ?? null,
        JSON.stringify(cleanDetails),
        ip,
      ]
    );
  } catch (err) {
    console.error("[audit] failed to write audit log entry:", err);
  }
}

// Main helper — call from server actions. Resolves user/IP from the current
// request context. Fire-and-forget: NEVER await this from a caller that must
// not be delayed or blocked by audit failures — the returned promise never
// rejects.
export function logAudit(
  action: AuditAction,
  entityType: string,
  entityId?: string | number | null,
  details?: Record<string, unknown>,
  consorcioCuit?: string | null
): void {
  (async () => {
    try {
      const [username, ip] = await Promise.all([resolveUsername(), resolveIp()]);
      await insertAuditRow(
        username ?? "unknown",
        ip,
        action,
        entityType,
        entityId,
        details,
        consorcioCuit
      );
    } catch (err) {
      console.error("[audit] logAudit failed:", err);
    }
  })().catch((err) => console.error("[audit] logAudit unhandled failure:", err));
}

// For API route handlers where username/IP are already known (or, for
// login_failed, there is no valid session to resolve a username from).
export function logAuditDirect(
  username: string,
  ip: string,
  action: AuditAction,
  entityType: string,
  entityId?: string | number | null,
  details?: Record<string, unknown>
): void {
  insertAuditRow(username, ip, action, entityType, entityId, details, null).catch((err) =>
    console.error("[audit] logAuditDirect failed:", err)
  );
}
