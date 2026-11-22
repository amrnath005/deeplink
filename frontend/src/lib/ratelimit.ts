/**
 * Upstash Redis Authoritative Rate Limiting Engine
 * Production: Uses Upstash Redis REST API sliding window algorithm.
 * Development: Uses local in-memory map fallback.
 */

const ipRequestsMap = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(
  key: string,
  limit = 100,
  windowMs = 60000
): Promise<{ success: boolean; remaining: number }> {
  const isProduction = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // 1. Authoritative Production Redis Sliding Window Rate Limiting
  if (isProduction && redisUrl && redisToken && !redisUrl.includes("mock")) {
    try {
      const windowSec = Math.ceil(windowMs / 1000);
      const redisKey = `ratelimit:${key}`;

      const res = await fetch(`${redisUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", redisKey],
          ["EXPIRE", redisKey, windowSec],
        ]),
      });

      if (res.ok) {
        const data = await res.json();
        const count = data[0]?.result || 1;
        const remaining = Math.max(0, limit - count);

        if (count > limit) {
          return { success: false, remaining: 0 };
        }
        return { success: true, remaining };
      }
    } catch (err) {
      console.error("[RateLimit] Production Redis error:", err);
      // In production, fail closed if Redis is unaccessible
      return { success: false, remaining: 0 };
    }
  }

  // 2. Local Development In-Memory Fallback
  const now = Date.now();
  const record = ipRequestsMap.get(key);

  if (!record || now > record.resetTime) {
    ipRequestsMap.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count };
}
