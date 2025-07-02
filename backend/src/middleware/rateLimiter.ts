import rateLimit from 'express-rate-limit';
import { AuthRequest } from './auth.middleware';

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

// Order creation rate limiter - prevent order spam
export const orderCreationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 order creation attempts per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many order creation attempts. Please try again after 5 minutes.' },
  keyGenerator: (req: any) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user?._id?.toString() || req.ip;
  },
});

// Payment verification rate limiter - prevent payment verification spam
export const paymentVerificationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 payment verification attempts per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many payment verification attempts. Please try again after 1 minute.' },
});

// Order status update rate limiter for admin
export const orderStatusUpdateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each admin to 20 status updates per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many order status updates. Please try again after 1 minute.' },
  keyGenerator: (req: any) => {
    // Use admin user ID for rate limiting
    return req.user?._id?.toString() || req.ip;
  },
});

// Login attempt rate limiter - prevent brute force attacks
export const loginAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
  keyGenerator: (req: any) => {
    // Use email if available, otherwise use IP
    return req.body?.email || req.ip;
  },
});

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each email to 3 password reset attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many password reset attempts. Please try again after 1 hour.' },
  keyGenerator: (req: any) => {
    return req.body?.email || req.ip;
  },
});

// API limiter for all endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

export const newsletterRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many newsletter requests from this IP, please try again later.'
});