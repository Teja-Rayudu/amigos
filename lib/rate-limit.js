/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or a dedicated rate limiting service
 */

const rateLimitMap = new Map();

/**
 * Rate limit middleware
 * @param {Object} options - Rate limit options
 * @param {number} options.maxRequests - Maximum number of requests
 * @param {number} options.windowMs - Time window in milliseconds
 * @returns {Function} Middleware function
 */
export function rateLimit({ maxRequests = 10, windowMs = 60000 }) {
  return (identifier) => {
    const now = Date.now();
    const key = identifier || 'default';

    // Clean up old entries
    if (rateLimitMap.has(key)) {
      const { requests, resetTime } = rateLimitMap.get(key);
      
      // If window has passed, reset
      if (now > resetTime) {
        rateLimitMap.delete(key);
      } else {
        // Check if limit exceeded
        if (requests.length >= maxRequests) {
          const oldestRequest = requests[0];
          if (now - oldestRequest < windowMs) {
            return {
              success: false,
              limit: maxRequests,
              remaining: 0,
              resetTime: resetTime,
            };
          }
          // Remove old requests outside window
          rateLimitMap.set(key, {
            requests: requests.filter(time => now - time < windowMs),
            resetTime: now + windowMs,
          });
        }
      }
    }

    // Get or create entry
    const entry = rateLimitMap.get(key) || {
      requests: [],
      resetTime: now + windowMs,
    };

    // Add current request
    entry.requests.push(now);

    // Clean old requests
    entry.requests = entry.requests.filter(time => now - time < windowMs);

    // Update map
    rateLimitMap.set(key, entry);

    return {
      success: true,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - entry.requests.length),
      resetTime: entry.resetTime,
    };
  };
}

/**
 * Get client identifier from request
 * @param {Request} request - Next.js request object
 * @returns {string} Client identifier
 */
export function getClientIdentifier(request) {
  // Try to get IP from headers (works with proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

