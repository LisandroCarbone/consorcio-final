import { redis } from "./redis";

const SESSION_PREFIX = "session:";
const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

function key(sessionId: string): string {
  return `${SESSION_PREFIX}${sessionId}`;
}

export async function createSession(sessionId: string, username: string): Promise<void> {
  await redis.set(key(sessionId), username, "EX", SESSION_TTL_SECONDS);
}

export async function sessionExists(sessionId: string): Promise<boolean> {
  const result = await redis.get(key(sessionId));
  return result !== null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await redis.del(key(sessionId));
}
