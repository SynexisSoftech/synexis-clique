import { Request,Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel, { IUser, UserRole } from '../models/user.model'; // Adjust path as per your project structure

// Ensure ACCESS_TOKEN_SECRET is loaded from environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
    console.error("FATAL ERROR: JWT_ACCESS_SECRET is not defined in environment variables.");
    process.exit(1); // Exit if the crucial secret is missing
}

/**
 * Interface to extend Express Request object with a user property.
 * This allows TypeScript to recognize `req.user` after authentication.
 */
export interface AuthRequest extends Request {
  user?: IUser; // The user property will be populated after token verification.
}

/**
 * Middleware to protect routes by verifying JWT access token.
 * It extracts the token from the 'Authorization' header, verifies it,
 * and attaches the authenticated user (excluding password) to the request object.
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    let token;

    // 1. Check for token in Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        try {
            // 2. Extract token from "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify the token using the access token secret
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { userId: string };

            // 4. Fetch user details from database using userId from token
            // Exclude password from being attached to the request object
            const currentUser = await UserModel.findById(decoded.userId).select('-password');

            if (!currentUser) {
                res.status(401).json({ message: 'Not authorized: User belonging to this token no longer exists.' });
                return;
            }

            // Optional: Check if user is verified (if necessary for all protected routes)
            // if (!currentUser.isVerified) {
            //     res.status(403).json({ message: 'Forbidden: Account not verified.' });
            //     return;
            // }

            // 5. Attach user to the request object
            req.user = currentUser;
            next(); // Proceed to the next middleware or route handler

        } catch (error: any) {
            console.error('[Auth Middleware] Token verification failed:', error.message);
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Not authorized: Token has expired.' });
            } else if (error.name === 'JsonWebTokenError') {
                res.status(401).json({ message: 'Not authorized: Token is invalid.' });
            } else {
                res.status(401).json({ message: 'Not authorized: Token verification failed.' });
            }
            return;
        }
    } else {
        // If no token is found in the header
        res.status(401).json({ message: 'Not authorized: No token provided.' });
        return;
    }
};

/**
 * Middleware for role-based authorization.
 * This should be used AFTER the `protect` middleware.
 * @param roles - An array of UserRole enums that are permitted to access the route.
 */
export const authorize = (roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            // This should ideally not happen if `protect` middleware is used before `authorize`
            res.status(401).json({ message: 'Not authorized: User data not available for role check.' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                message: `Forbidden: User role '${req.user.role}' is not authorized to access this resource.`
            });
            return;
        }
        next(); // User has the required role, proceed to the route handler
    };
};