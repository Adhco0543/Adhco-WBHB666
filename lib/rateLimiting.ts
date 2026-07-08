import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // in milliseconds
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Simple in-memory rate limit store
// In production, use Redis
const rateLimitStore: RateLimitStore = {};

/**
 * Rate limiter middleware
 * Usage: Apply to API route handlers
 */
export function createRateLimiter(config: RateLimitConfig) {
  return function rateLimitMiddleware(req: NextRequest) {
    const key = getClientIdentifier(req);
    const now = Date.now();

    // Get or initialize rate limit data
    const limit = rateLimitStore[key] || { count: 0, resetTime: now + config.windowMs };

    // Reset if window has passed
    if (now > limit.resetTime) {
      rateLimitStore[key] = { count: 1, resetTime: now + config.windowMs };
      return null; // Allow request
    }

    // Increment counter
    rateLimitStore[key].count++;

    // Check if limit exceeded
    if (rateLimitStore[key].count > config.maxRequests) {
      const resetTime = new Date(limit.resetTime);
      return NextResponse.json(
        {
          error: config.message || 'Too many requests',
          retryAfter: Math.ceil((limit.resetTime - now) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((limit.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, config.maxRequests - rateLimitStore[key].count).toString(),
            'X-RateLimit-Reset': resetTime.toISOString(),
          },
        }
      );
    }

    return null; // Allow request
  };
}

/**
 * Get unique client identifier (IP or user ID)
 */
function getClientIdentifier(req: NextRequest): string {
  // Try to get user ID from auth
  const userId = req.headers.get('x-user-id');
  if (userId) return `user:${userId}`;

  // Fall back to IP address
  const ip =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    req.ip ||
    'unknown';

  return `ip:${ip}`;
}

/**
 * Specific rate limiters for common endpoints
 */
export const RATE_LIMITS = {
  // API endpoints
  API_GENERAL: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many API requests',
  },

  // Auth endpoints (stricter)
  AUTH_LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many login attempts',
  },

  AUTH_SIGNUP: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many signup attempts',
  },

  // Invoice/Payment endpoints
  INVOICE_CREATE: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many invoice creation requests',
  },

  PAYMENT_PROCESS: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many payment requests',
  },

  // File upload
  FILE_UPLOAD: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many file uploads',
  },

  // Search/Heavy queries
  SEARCH: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many search requests',
  },

  // Exports
  EXPORT: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many export requests',
  },

  // Strict: Email sending
  EMAIL_SEND: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many email requests',
  },
};

/**
 * Helper function to apply rate limiting in route handlers
 */
export async function checkRateLimit(
  req: NextRequest,
  limitConfig: RateLimitConfig
): Promise<NextResponse | null> {
  const limiter = createRateLimiter(limitConfig);
  return limiter(req);
}

/**
 * Get remaining rate limit for a request
 */
export function getRateLimitRemaining(req: NextRequest, config: RateLimitConfig): number {
  const key = getClientIdentifier(req);
  const limit = rateLimitStore[key];

  if (!limit) {
    return config.maxRequests;
  }

  return Math.max(0, config.maxRequests - limit.count);
}

/**
 * Reset rate limit for a specific key (admin use)
 */
export function resetRateLimit(identifier: string): void {
  delete rateLimitStore[identifier];
}

/**
 * Get all active rate limits (for monitoring)
 */
export function getActiveRateLimits(): RateLimitStore {
  return { ...rateLimitStore };
}

/**
 * Cleanup expired rate limit entries
 */
export function cleanupExpiredLimits(): number {
  const now = Date.now();
  let cleaned = 0;

  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
      cleaned++;
    }
  });

  return cleaned;
}

// Cleanup expired limits every 10 minutes
if (typeof global !== 'undefined') {
  setInterval(cleanupExpiredLimits, 10 * 60 * 1000);
}
