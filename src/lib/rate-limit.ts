const buckets = new Map<string, number[]>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > windowStart);
  hits.push(now);
  buckets.set(key, hits);
  if (hits.length > limit) {
    return false;
  }
  if (buckets.size > 1000) {
    const cutoff = now - 60000;
    for (const [k, v] of buckets) {
      if (v.every((t) => t < cutoff)) buckets.delete(k);
    }
  }
  return true;
}
