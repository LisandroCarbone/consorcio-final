import Redis from "ioredis";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: Redis | undefined;
}

function createClient(): Redis {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
  client.on("error", (err) => {
    console.error("Redis connection error:", err);
  });
  return client;
}

// Lazily instantiated singleton — created on first actual use (a request handler
// touching Redis), not at module import time. Next.js statically imports route
// modules during `next build` page-data collection; eagerly connecting here would
// both break the build (no env vars available) and open sockets that are never used.
function getClient(): Redis {
  if (!global.__redisClient) {
    global.__redisClient = createClient();
  }
  return global.__redisClient;
}

export const redis: Redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
