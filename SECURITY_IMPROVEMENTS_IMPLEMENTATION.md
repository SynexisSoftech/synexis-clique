# 🛡️ Security Improvements Implementation Guide

## Overview

This guide provides step-by-step instructions to fix the critical security vulnerabilities identified in your authentication system.

## 🚨 Critical Fixes (Implement First)

### 1. Server-Side Role Validation

**Problem**: Client-side role validation can be easily bypassed
**Solution**: Add server-side role validation middleware

#### Step 1: Create Admin Middleware
```typescript
// backend/src/middleware/admin.middleware.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  next();
};

export const requireUser = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  next();
};
```

#### Step 2: Update Admin Routes
```typescript
// backend/src/routes/admin/admin.routes.ts
import { requireAdmin } from '../../middleware/admin.middleware';

// Add requireAdmin to all admin routes
router.route('/users')
  .get(protect, requireAdmin, getUsers) // Add requireAdmin here
  .post(protect, requireAdmin, createUser);

router.route('/orders')
  .get(protect, requireAdmin, getOrders)
  .put(protect, requireAdmin, updateOrder);
```

### 2. Token Blacklisting

**Problem**: Stolen tokens remain valid until expiry
**Solution**: Implement token blacklisting on logout

#### Step 1: Create Blacklisted Token Model
```typescript
// backend/src/models/blacklistedToken.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IBlacklistedToken extends Document {
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const blacklistedTokenSchema = new Schema<IBlacklistedToken>({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IBlacklistedToken>('BlacklistedToken', blacklistedTokenSchema);
```

#### Step 2: Update Auth Middleware
```typescript
// backend/src/middleware/auth.middleware.ts
import BlacklistedToken from '../models/blacklistedToken.model';

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Check if token is blacklisted
      const blacklistedToken = await BlacklistedToken.findOne({ token });
      if (blacklistedToken) {
        res.status(401).json({ message: 'Token has been revoked' });
        return;
      }

      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { userId: string };
      // ... rest of existing code
    } catch (error: any) {
      // ... existing error handling
    }
  } else {
    res.status(401).json({ message: 'Not authorized: No token provided.' });
    return;
  }
};
```

#### Step 3: Update Logout Controller
```typescript
// backend/src/controllers/auth.controller.ts
import BlacklistedToken from '../models/blacklistedToken.model';
import jwt from 'jsonwebtoken';

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      // Decode token to get expiry
      const decoded = jwt.decode(token) as any;
      const expiresAt = new Date(decoded.exp * 1000);
      
      // Add token to blacklist
      await BlacklistedToken.create({
        token,
        expiresAt
      });
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};
```

### 3. CSRF Protection

**Problem**: No CSRF protection on non-GET requests
**Solution**: Implement CSRF tokens

#### Step 1: Install CSRF Package
```bash
npm install csurf
```

#### Step 2: Add CSRF Middleware
```typescript
// backend/src/middleware/csrf.middleware.ts
import csrf from 'csurf';

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

export const csrfMiddleware = csrfProtection;

export const getCSRFToken = (req: Request, res: Response): void => {
  res.json({ csrfToken: req.csrfToken() });
};
```

#### Step 3: Add CSRF Route
```typescript
// backend/src/routes/auth.routes.ts
import { getCSRFToken } from '../middleware/csrf.middleware';

router.get('/csrf-token', getCSRFToken);
```

#### Step 4: Update Frontend
```typescript
// frontend/utils/axiosInstance.ts
let csrfToken: string | null = null;

// Get CSRF token on app start
const getCSRFToken = async () => {
  try {
    const response = await axios.get('/api/auth/csrf-token');
    csrfToken = response.data.csrfToken;
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
  }
};

// Add CSRF token to requests
apiClient.interceptors.request.use(
  (config) => {
    if (csrfToken && config.method !== 'get') {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Initialize CSRF token
getCSRFToken();
```

### 4. Security Headers

**Problem**: Missing security headers
**Solution**: Add comprehensive security headers

#### Step 1: Install Helmet
```bash
npm install helmet
```

#### Step 2: Configure Security Headers
```typescript
// backend/src/server.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
```

## 🔧 Medium Priority Fixes

### 5. Account Lockout

**Problem**: No protection against brute force attacks
**Solution**: Implement account lockout after failed attempts

#### Step 1: Update User Model
```typescript
// backend/src/models/user.model.ts
interface IUser {
  // ... existing fields
  loginAttempts: number;
  lockUntil: Date;
}

const userSchema = new Schema<IUser>({
  // ... existing fields
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
});
```

#### Step 2: Update Login Controller
```typescript
// backend/src/controllers/auth.controller.ts
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000 / 60);
      res.status(423).json({ 
        message: `Account locked. Try again in ${remainingTime} minutes` 
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts += 1;
      
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCKOUT_DURATION);
        await user.save();
        res.status(423).json({ 
          message: `Account locked for ${LOCKOUT_DURATION / 1000 / 60} minutes due to too many failed attempts` 
        });
        return;
      }
      
      await user.save();
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // ... rest of login logic
  } catch (error) {
    // ... error handling
  }
};
```

### 6. Token Rotation

**Problem**: Refresh tokens don't rotate, increasing risk
**Solution**: Implement refresh token rotation

#### Step 1: Update Token Service
```typescript
// backend/src/services/token.service.ts
export const rotateRefreshToken = (userId: string): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  
  return { accessToken, refreshToken };
};
```

#### Step 2: Update Refresh Token Handler
```typescript
// backend/src/controllers/auth.controller.ts
export const refreshTokenHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      res.status(401).json({ message: 'No refresh token provided' });
      return;
    }

    const decoded = TokenService.verifyRefreshToken(refreshToken);
    if (!decoded) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    // Generate new tokens (rotation)
    const { accessToken, refreshToken: newRefreshToken } = TokenService.rotateRefreshToken(decoded.userId);

    // Blacklist old refresh token
    await BlacklistedToken.create({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Token refresh failed' });
  }
};
```

## 🔒 Long-term Improvements

### 7. Audit Logging

```typescript
// backend/src/models/auditLog.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: any;
}

const auditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    type: Schema.Types.Mixed
  }
});

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
```

### 8. Rate Limiting Enhancement

```typescript
// backend/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
```

## 🧪 Testing the Fixes

### 1. Test Server-Side Role Validation
```bash
# Try accessing admin endpoint with non-admin token
curl -H "Authorization: Bearer USER_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3001/api/admin/users
# Should return 403 Forbidden
```

### 2. Test Token Blacklisting
```bash
# Login and get token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}' | jq -r '.accessToken')

# Use token
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/api/auth/me

# Logout
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# Try using token again (should fail)
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/api/auth/me
# Should return 401 Unauthorized
```

### 3. Test CSRF Protection
```javascript
// In browser console
fetch('/api/auth/change-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ newPassword: 'hacked123' })
});
// Should return 403 Forbidden (CSRF token missing)
```

## 📊 Security Checklist After Implementation

- [ ] Server-side role validation implemented
- [ ] Token blacklisting working
- [ ] CSRF protection active
- [ ] Security headers configured
- [ ] Account lockout implemented
- [ ] Token rotation working
- [ ] Rate limiting enhanced
- [ ] Audit logging implemented
- [ ] All tests passing

## 🎯 Expected Security Rating After Fixes

**Before**: 6.5/10 ⚠️
**After**: 8.5/10 ✅

The implementation of these fixes will significantly improve your authentication security and protect against the identified vulnerabilities. 