// Authentication utilities & Web Crypto token signing

export const AUTH_COOKIE_NAME = "consorcio_session";

// Default credentials requested by the user
const DEFAULT_USER = "Masoca";
const DEFAULT_PASS = "Karina1605";

// Secret for HMAC signing (uses env var if present)
const SECRET_KEY = process.env.AUTH_SECRET || "consorcio_secret_key_session_sign_2026_secure";

// Simple in-memory rate limiter for login attempts (15 min lockout after 5 failed attempts)
interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}
const loginAttempts = new Map<string, RateLimitRecord>();

export function checkRateLimit(identifier: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record) return { allowed: true };

  if (record.lockedUntil > now) {
    const waitMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return { allowed: false, waitMinutes };
  }

  if (record.lockedUntil <= now && record.lockedUntil > 0) {
    // Lock expired, reset
    loginAttempts.delete(identifier);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedAttempt(identifier: string): { locked: boolean; waitMinutes?: number } {
  const now = Date.now();
  const record = loginAttempts.get(identifier) || { attempts: 0, lockedUntil: 0 };
  record.attempts += 1;

  if (record.attempts >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000; // 15 minutes lockout
    loginAttempts.set(identifier, record);
    return { locked: true, waitMinutes: 15 };
  }

  loginAttempts.set(identifier, record);
  return { locked: false };
}

export function clearFailedAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

export function validateCredentials(user: string, pass: string): boolean {
  const validUser = process.env.AUTH_USER || DEFAULT_USER;
  const validPass = process.env.AUTH_PASSWORD || DEFAULT_PASS;
  return user === validUser && pass === validPass;
}

// Convert string to Uint8Array/BufferSource
function stringToBuffer(str: string): BufferSource {
  return new TextEncoder().encode(str) as unknown as BufferSource;
}

// Convert buffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Sign data using HMAC-SHA256 via native Web Crypto (compatible with Edge and Node.js)
export async function createSessionToken(username: string, expiresInDays = 30): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;
  const payload = { sub: username, exp };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    stringToBuffer(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, stringToBuffer(dataToSign));
  const hexSignature = bufferToHex(signature);

  return `${dataToSign}.${hexSignature}`;
}

// Verify token using Web Crypto
export async function verifySessionToken(token: string | undefined): Promise<{ valid: boolean; username?: string }> {
  if (!token) return { valid: false };

  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false };

  const [encodedHeader, encodedPayload, hexSignature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      stringToBuffer(SECRET_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Convert hex signature back to Uint8Array
    const sigBytes = new Uint8Array(
      hexSignature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    ) as unknown as BufferSource;

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, stringToBuffer(dataToSign));
    if (!isValid) return { valid: false };

    const payloadJson = atob(encodedPayload);
    const payload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false };
    }

    return { valid: true, username: payload.sub };
  } catch {
    return { valid: false };
  }
}
