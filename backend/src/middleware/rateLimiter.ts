import rateLimit from 'express-rate-limit';

// General limiter for most API calls
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
});

// Stricter limiter for sensitive actions like login and OTP requests
export const authActionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 attempts per windowMs for auth actions
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again after 10 minutes.' },
});

// Even stricter for OTP generation to prevent spam
export const otpGenerationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // Increased limit
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many OTP requests. Please try again after 5 minutes.' },
});

// Admin-specific rate limiter for sensitive admin operations
export const adminActionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200, // Increased from 50 to 200 for development
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many admin requests. Please try again after 5 minutes.' },
});

// Very strict limiter for critical admin operations (delete, create, update)
export const adminCriticalActionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // Increased from 10 to 50 for development
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many critical admin actions. Please try again after 1 minute.' },
});