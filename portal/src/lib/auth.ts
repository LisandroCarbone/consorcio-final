// Authentication utilities — JWT via `jose` + Redis-backed session revocation.

import { SignJWT, jwtVerify } from "jose";
import { randomUUID, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { env } from "./env";
import { createSession, deleteSession, sessionExists } from "./session-store";

export const AUTH_COOKIE_NAME = "consorcio_session";

export { checkRateLimit, recordFailedAttempt, clearFailedAttempts } from "./rate-limiter";

// Computed lazily (not at module scope) so importing this module during
// `next build` page-data collection doesn't trigger env validation.
let secretKeyCache: Uint8Array | undefined;
function getSecretKey(): Uint8Array {
  if (!secretKeyCache) secretKeyCache = new TextEncoder().encode(env.AUTH_SECRET);
  return secretKeyCache;
}

export async function validateCredentials(user: string, pass: string): Promise<boolean> {
  const userBuf = Buffer.from(user);
  const expectedUserBuf = Buffer.from(env.AUTH_USER);
  const userMatch =
    userBuf.length === expectedUserBuf.length &&
    timingSafeEqual(userBuf, expectedUserBuf);
  if (!userMatch) return false;
  return bcrypt.compare(pass, env.AUTH_PASSWORD_HASH);
}

// Signs a JWT (HS256) and creates the corresponding session record in Redis.
// The token carries a random `sid` (session id) claim used to look up the
// session record on every subsequent request, enabling server-side revocation.
export async function createSessionToken(username: string, expiresInHours = 8): Promise<string> {
  const sessionId = randomUUID();
  await createSession(sessionId, username);

  const token = await new SignJWT({ sub: username, sid: sessionId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${expiresInHours}h`)
    .sign(getSecretKey());

  return token;
}

export async function verifySessionToken(
  token: string | undefined
): Promise<{ valid: boolean; username?: string; sessionId?: string }> {
  if (!token) return { valid: false };

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const username = typeof payload.sub === "string" ? payload.sub : undefined;
    const sessionId = typeof payload.sid === "string" ? payload.sid : undefined;

    if (!username || !sessionId) return { valid: false };

    const exists = await sessionExists(sessionId);
    if (!exists) return { valid: false };

    return { valid: true, username, sessionId };
  } catch {
    return { valid: false };
  }
}

// Revokes the session tied to the given token. Session records also carry an
// 8-hour Redis TTL matching JWT expiry, so this is best-effort cleanup on logout.
export async function revokeSessionFromToken(token: string | undefined): Promise<void> {
  if (!token) return;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const sessionId = typeof payload.sid === "string" ? payload.sid : undefined;
    if (sessionId) await deleteSession(sessionId);
  } catch {
    // Token is malformed/expired/unverifiable — nothing to revoke.
  }
}
