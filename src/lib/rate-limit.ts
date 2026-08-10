type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Best-effort process-local guard. Use Vercel WAF/Supabase rate limits for a
// distributed production limit across multiple instances.
export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const existing = buckets.get(key)
  const bucket = !existing || existing.resetAt <= now ? { count: 0, resetAt: now + windowMs } : existing
  bucket.count += 1
  buckets.set(key, bucket)
  if (buckets.size > 5000) {
    for (const [bucketKey, value] of buckets) if (value.resetAt <= now) buckets.delete(bucketKey)
  }
  return { allowed: bucket.count <= limit, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) }
}
