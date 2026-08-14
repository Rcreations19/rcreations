import { headers } from 'next/headers';

type RateLimitStore = {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
};

// Global store for in-memory rate limiting.
// SECURITY WARNING: In-memory rate limiting is ephemeral on Cloudflare Edge.
// Edge workers scale horizontally and spin up/down frequently, meaning this 
// object state is isolated per-datacenter (and per-isolate). 
// For strict DoS protection, you MUST replace this with a distributed store 
// (e.g. Cloudflare KV, Durable Objects, or Redis/Upstash) in production.
const store: RateLimitStore = {};

export async function rateLimit(limit: number = 5, windowMs: number = 60000) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
  const now = Date.now();

  if (!store[ip]) {
    store[ip] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return { success: true };
  }

  const record = store[ip];

  if (now > record.resetTime) {
    // Reset window
    record.count = 1;
    record.resetTime = now + windowMs;
    return { success: true };
  }

  if (record.count >= limit) {
    return { success: false, error: 'Too many requests. Please try again later.' };
  }

  record.count++;
  return { success: true };
}
