import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

/**
 * Middleware to require admin role for protected routes.
 * This should be used AFTER the `protect` middleware.
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ 
      message: 'Admin access required',
      error: 'INSUFFICIENT_PERMISSIONS'
    });
    return;
  }

  next();
};

/**
 * Middleware to require user authentication.
 * This should be used AFTER the `protect` middleware.
 */
export const requireUser = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  next();
};

/**
 * Middleware to check if user is the owner of the resource or admin.
 * This should be used AFTER the `protect` middleware.
 */
export const requireOwnerOrAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  // Admin can access any resource
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user is the owner of the resource
  const resourceUserId = req.params.userId || req.body.userId;
  if (req.user._id.toString() === resourceUserId) {
    return next();
  }

  res.status(403).json({ 
    message: 'Access denied. You can only access your own resources.',
    error: 'INSUFFICIENT_PERMISSIONS'
  });
}; 