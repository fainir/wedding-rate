interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Prune expired entries every 60 s to avoid unbounded growth
const interval = setInterval(() => {
  const now = Date.now();
  for (const [k, e] of store) {
    if (e.resetAt < now) store.delete(k);
  }
}, 60_000);

// Prevent the timer from keeping Node alive in test / build environments
if (typeof interval.unref === "function") interval.unref();

/**
 * Simple in-memory rate limiter — suitable for single-instance Railway deploys.
 *
 * @param key      Unique identifier, e.g. `"login:1.2.3.4"`
 * @param limit    Max requests allowed per window
 * @param windowMs Window size in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count++;
  return { allowed: true, retryAfter: 0 };
}

/** Extract best-effort client IP from Next.js request headers */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}
