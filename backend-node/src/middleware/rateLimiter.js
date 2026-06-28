const rateLimits = new Map();

/**
 * Custom memory-based rate limiter middleware for AI routes.
 * Prevents API key consumption by limiting requests per user.
 */
function aiRateLimiter(req, res, next) {
  const userId = req.user?.id || req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 15; // Max 15 requests per minute

  if (!rateLimits.has(userId)) {
    rateLimits.set(userId, []);
  }

  // Filter out timestamps outside the current window
  const requests = rateLimits.get(userId).filter(timestamp => now - timestamp < windowMs);
  requests.push(now);
  rateLimits.set(userId, requests);

  if (requests.length > maxRequests) {
    return res.status(429).json({
      status: 429,
      message: 'Too many requests to the AI Assistant. Please wait a minute and try again.'
    });
  }

  next();
}

module.exports = { aiRateLimiter };
