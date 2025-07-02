import { Request, Response, NextFunction } from 'express';
import Tokens from 'csrf';

const tokens = new Tokens();

// Store CSRF secrets in memory (in production, use Redis or database)
const csrfSecrets = new Map<string, string>();

/**
 * Generate a new CSRF secret for a session
 */
export const generateCSRFSecret = (): string => {
  return tokens.secretSync();
};

/**
 * Generate a CSRF token from a secret
 */
export const generateCSRFToken = (secret: string): string => {
  return tokens.create(secret);
};

/**
 * Verify a CSRF token against a secret
 */
export const verifyCSRFToken = (secret: string, token: string): boolean => {
  return tokens.verify(secret, token);
};

/**
 * CSRF middleware for protecting routes
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next();
  }

  // Get CSRF secret from session or cookie
  const sessionId = req.cookies.sessionId || req.headers['x-session-id'] as string;
  
  if (!sessionId) {
    res.status(403).json({ 
      message: 'CSRF protection: No session found',
      error: 'CSRF_SESSION_MISSING'
    });
    return;
  }

  const secret = csrfSecrets.get(sessionId);

  if (!secret) {
    res.status(403).json({ 
      message: 'CSRF protection: No session found',
      error: 'CSRF_SESSION_MISSING'
    });
    return;
  }

  // Get CSRF token from header or body
  const csrfToken = req.headers['x-csrf-token'] as string || req.body._csrf;

  if (!csrfToken) {
    res.status(403).json({ 
      message: 'CSRF protection: Token missing',
      error: 'CSRF_TOKEN_MISSING'
    });
    return;
  }

  // Verify CSRF token
  if (!verifyCSRFToken(secret, csrfToken)) {
    res.status(403).json({ 
      message: 'CSRF protection: Invalid token',
      error: 'CSRF_TOKEN_INVALID'
    });
    return;
  }

  next();
};

/**
 * Middleware to generate and set CSRF token
 */
export const generateCSRFTokenMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const sessionId = req.cookies.sessionId || req.headers['x-session-id'] as string;
  
  if (!sessionId) {
    res.status(400).json({ 
      message: 'Session ID required for CSRF token generation',
      error: 'SESSION_ID_MISSING'
    });
    return;
  }

  // Get or create secret for this session
  let secret = csrfSecrets.get(sessionId);
  if (!secret) {
    secret = generateCSRFSecret();
    csrfSecrets.set(sessionId, secret);
  }

  // Generate CSRF token
  const csrfToken = generateCSRFToken(secret);

  // Set CSRF token in response
  res.locals.csrfToken = csrfToken;
  
  next();
};

/**
 * Clean up expired CSRF secrets (run periodically)
 */
export const cleanupCSRFSecrets = (): void => {
  // In a real application, you'd implement proper cleanup logic
  // For now, we'll just log the cleanup
  console.log(`[CSRF] Cleaned up ${csrfSecrets.size} CSRF secrets`);
};

/**
 * Get CSRF token endpoint
 */
export const getCSRFToken = (req: Request, res: Response): void => {
  // For the token generation endpoint, we'll use a simple approach
  // In production, you might want to use a more sophisticated session management
  
  // Generate a unique identifier for this request
  const requestId = req.headers['x-request-id'] as string || 
                   req.cookies.sessionId || 
                   `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Get or create secret for this request
  let secret = csrfSecrets.get(requestId);
  if (!secret) {
    secret = generateCSRFSecret();
    csrfSecrets.set(requestId, secret);
  }

  // Generate CSRF token
  const csrfToken = generateCSRFToken(secret);

  // Set the session ID in a cookie for future requests
  res.cookie('sessionId', requestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  res.json({ 
    csrfToken,
    sessionId: requestId 
  });
}; 