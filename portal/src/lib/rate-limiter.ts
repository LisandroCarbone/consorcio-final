// Redis-backed login rate limiter (15 min lockout after 5 failed attempts).
// Same public API as the previous in-memory implementation, now shared across
// restarts and replicas via Redis INCR + EXPIRE.

import { redis } from "./redis";

const ATTEMPTS_PREFIX = "ratelimit:attempts:";
const LOCK_PREFIX = "ratelimit:lock:";
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 15 * 60;

export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; waitMinutes?: number }> {
  const ttl = await redis.ttl(`${LOCK_PREFIX}${identifier}`);
  if (ttl > 0) {
    return { allowed: false, waitMinutes: Math.ceil(ttl / 60) };
  }
  return { allowed: true };
}

export async function recordFailedAttempt(identifier: string): Promise<{ locked: boolean; waitMinutes?: number }> {
  const attemptsKey = `${ATTEMPTS_PREFIX}${identifier}`;
  const attempts = await redis.incr(attemptsKey);
  if (attempts === 1) {
    // First failed attempt in this window — set expiry so counts don't accumulate forever.
    await redis.expire(attemptsKey, LOCKOUT_SECONDS);
  }

  if (attempts >= MAX_ATTEMPTS) {
    await redis.set(`${LOCK_PREFIX}${identifier}`, "1", "EX", LOCKOUT_SECONDS);
    return { locked: true, waitMinutes: 15 };
  }

  return { locked: false };
}

export async function clearFailedAttempts(identifier: string): Promise<void> {
  await redis.del(`${ATTEMPTS_PREFIX}${identifier}`, `${LOCK_PREFIX}${identifier}`);
}
