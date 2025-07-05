import { Request, Response, NextFunction } from 'express';
import { ESewaSignatureVerifier } from '../utils/esewaSignature';
import { ESEWA_CONFIG } from '../config/esewa.config';
import ipRangeCheck from 'ip-range-check';

// Check if IP is in eSewa whitelist
const validateESewaIP = (ip: string): boolean => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // In development, allow localhost and development IPs
  if (isDevelopment && ESEWA_CONFIG.DEVELOPMENT_IPS.includes(ip)) {
    console.log('[eSewa Middleware] Development IP allowed:', ip);
    return true;
  }
  
  // In development mode, allow all IPs for testing
  if (isDevelopment) {
    console.log('[eSewa Middleware] Development mode - allowing all IPs for testing');
    return true;
  }
  
  // Production IP validation using proper IP range library
  const isWhitelisted = ipRangeCheck(ip, ESEWA_CONFIG.IP_WHITELIST);
  
  console.log('[eSewa Middleware] IP:', ip, 'Whitelisted:', isWhitelisted);
  return isWhitelisted;
};

// Validate request timestamp to prevent replay attacks
const validateRequestTimestamp = (timestamp?: string): boolean => {
  if (!ESEWA_CONFIG.ENABLE_TIMESTAMP_VALIDATION) {
    console.log('[eSewa Middleware] Timestamp validation disabled');
    return true;
  }
  
  if (!timestamp) {
    console.log('[eSewa Middleware] No timestamp provided');
    return !ESEWA_CONFIG.ENABLE_TIMESTAMP_VALIDATION; // Allow if validation is disabled
  }
  
  try {
    const requestTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const timeDiff = Math.abs(currentTime - requestTime);
    
    // Allow 5-minute window for request timing
    const isValid = timeDiff <= 5 * 60 * 1000;
    console.log('[eSewa Middleware] Time diff:', timeDiff, 'ms, Valid:', isValid);
    
    return isValid;
  } catch (error) {
    console.error('[eSewa Middleware] Timestamp validation error:', error);
    return !ESEWA_CONFIG.ENABLE_TIMESTAMP_VALIDATION; // Allow if validation is disabled
  }
};

// Use centralized signature verification
const verifyESewaSignature = (data: any, signature: string): boolean => {
  return ESewaSignatureVerifier.verify(data, signature);
};

// eSewa webhook security middleware
export const eSewaWebhookSecurity = (req: Request, res: Response, next: NextFunction): void => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '';
  console.log('[eSewa Middleware] Processing webhook from IP:', clientIP);
  
  // 1. IP Whitelist Validation
  if (ESEWA_CONFIG.ENABLE_IP_WHITELIST && !validateESewaIP(clientIP)) {
    console.error('[eSewa Middleware] IP not whitelisted:', clientIP);
    res.status(403).json({ 
      error: 'Access denied',
      message: 'IP address not authorized for eSewa webhooks',
      ip: clientIP
    });
    return;
  }
  
  // 2. Timestamp Validation
  const timestamp = req.headers['x-esewa-timestamp'] as string || req.body.timestamp;
  if (!validateRequestTimestamp(timestamp)) {
    console.error('[eSewa Middleware] Invalid timestamp or replay attack detected');
    res.status(400).json({ 
      error: 'Invalid timestamp',
      message: 'Request timestamp is invalid or too old'
    });
    return;
  }
  
  // 3. Signature Validation
  const signature = req.headers['x-esewa-signature'] as string || req.body.signature;
  
  if (ESEWA_CONFIG.ENABLE_STRICT_SIGNATURE) {
    if (!signature) {
      console.error('[eSewa Middleware] No signature provided in production');
      res.status(400).json({ 
        error: 'Missing signature',
        message: 'Signature is required for eSewa webhooks in production'
      });
      return;
    }
    
    const { total_amount, transaction_uuid } = req.body;
    if (!total_amount || !transaction_uuid) {
      console.error('[eSewa Middleware] Missing required fields for signature verification');
      res.status(400).json({ 
        error: 'Missing data',
        message: 'Required fields missing for signature verification'
      });
      return;
    }
    
    const isValidSignature = verifyESewaSignature(
      { 
        total_amount, 
        transaction_uuid, 
        product_code: ESEWA_CONFIG.PRODUCT_CODE 
      },
      signature
    );
    
    if (!isValidSignature) {
      console.error('[eSewa Middleware] Invalid signature in production');
      res.status(400).json({ 
        error: 'Invalid signature',
        message: 'eSewa webhook signature verification failed'
      });
      return;
    }
  } else {
    // In development, log signature status but don't block
    if (signature) {
      const { total_amount, transaction_uuid } = req.body;
      if (total_amount && transaction_uuid) {
        const isValidSignature = verifyESewaSignature(
          { 
            total_amount, 
            transaction_uuid, 
            product_code: ESEWA_CONFIG.PRODUCT_CODE 
          },
          signature
        );
        console.log('[eSewa Middleware] Development signature check:', isValidSignature ? 'VALID' : 'INVALID');
      }
    } else {
      console.log('[eSewa Middleware] No signature provided in development mode');
    }
  }
  
  // All security checks passed
  console.log('[eSewa Middleware] Security checks passed for IP:', clientIP);
  next();
};

// Rate limiting specifically for eSewa webhooks
export const eSewaWebhookRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '';
  
  // Simple in-memory rate limiting (use Redis in production)
  const now = Date.now();
  const windowMs = ESEWA_CONFIG.WEBHOOK_WINDOW_MS;
  const maxRequests = ESEWA_CONFIG.WEBHOOK_RATE_LIMIT;
  
  // This is a simplified rate limiter - use a proper rate limiting library in production
  if (!req.app.locals.esewaRateLimit) {
    req.app.locals.esewaRateLimit = new Map();
  }
  
  const rateLimitMap = req.app.locals.esewaRateLimit;
  const clientData = rateLimitMap.get(clientIP) || { count: 0, resetTime: now + windowMs };
  
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + windowMs;
  } else {
    clientData.count++;
  }
  
  rateLimitMap.set(clientIP, clientData);
  
  if (clientData.count > maxRequests) {
    console.error('[eSewa Middleware] Rate limit exceeded for IP:', clientIP);
    res.status(429).json({ 
      error: 'Rate limit exceeded',
      message: 'Too many eSewa webhook requests from this IP'
    });
    return;
  }
  
  next();
};

// Combined eSewa webhook middleware
export const eSewaWebhookMiddleware = [eSewaWebhookRateLimit, eSewaWebhookSecurity]; 