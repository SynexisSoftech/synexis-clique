// Security configuration for the application
export const SECURITY_CONFIG = {
  // JWT Configuration
  JWT: {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret',
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
  },

  // eSewa Payment Gateway Configuration
  ESEWA: {
    SECRET_KEY: process.env.ESEWA_SECRET_KEY || "",
    PRODUCT_CODE: process.env.ESEWA_PRODUCT_CODE || "EPAYTEST",
    MERCHANT_ID: process.env.ESEWA_MERCHANT_ID || "EPAYTEST",
    SUCCESS_URL: process.env.ESEWA_SUCCESS_URL || "http://localhost:3000/success",
    FAILURE_URL: process.env.ESEWA_FAILURE_URL || "http://localhost:3000/failure",
    API_URL: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  },

  // Rate Limiting Configuration
  RATE_LIMITS: {
    GENERAL: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // requests per window
    },
    AUTH: {
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 10, // attempts per window
    },
    OTP: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 10, // requests per window
    },
    ORDER_CREATION: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 5, // orders per window
    },
    PAYMENT_VERIFICATION: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 10, // verifications per window
    },
    ADMIN: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 200, // requests per window
    },
    ADMIN_CRITICAL: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 50, // actions per window
    },
    ORDER_STATUS_UPDATE: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 20, // updates per window
    },
  },

  // Input Validation Configuration
  VALIDATION: {
    PASSWORD: {
      MIN_LENGTH: 8,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true,
      REQUIRE_NUMBERS: true,
      REQUIRE_SPECIAL_CHARS: true,
      REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/,
    },
    EMAIL: {
      REGEX: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    PHONE: {
      REGEX: /^[+]?[0-9\s\-\(\)]{10,15}$/,
    },
    ORDER: {
      MAX_QUANTITY_PER_ITEM: 100,
      MAX_ITEMS_PER_ORDER: 50,
      MAX_ORDER_AMOUNT: 1000000, // 1 million NPR
    },
  },

  // CORS Configuration
  CORS: {
    ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
    CREDENTIALS: true,
    METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },

  // Database Security
  DATABASE: {
    MAX_CONNECTIONS: 10,
    CONNECTION_TIMEOUT: 30000,
    QUERY_TIMEOUT: 30000,
  },

  // File Upload Security
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  },

  // Session Security
  SESSION: {
    SECRET: process.env.SESSION_SECRET || 'your-session-secret',
    COOKIE_SECURE: process.env.NODE_ENV === 'production',
    COOKIE_HTTPONLY: true,
    COOKIE_SAMESITE: 'strict' as const,
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Audit Logging
  AUDIT: {
    ENABLED: true,
    LOG_LEVEL: process.env.AUDIT_LOG_LEVEL || 'info',
    SENSITIVE_FIELDS: ['password', 'token', 'secret', 'key'],
  },

  // Security Headers
  HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  },
};

// Security utility functions
export const SecurityUtils = {
  // Sanitize sensitive data for logging
  sanitizeForLogging: (data: any, sensitiveFields: string[] = SECURITY_CONFIG.AUDIT.SENSITIVE_FIELDS): any => {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  },

  // Generate secure random string
  generateSecureToken: (length: number = 32): string => {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  },

  // Validate UUID format
  isValidUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // Validate ObjectId format
  isValidObjectId: (id: string): boolean => {
    const mongoose = require('mongoose');
    return mongoose.Types.ObjectId.isValid(id);
  },

  // Escape HTML to prevent XSS
  escapeHtml: (text: string): string => {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  },

  // Validate email format
  isValidEmail: (email: string): boolean => {
    return SECURITY_CONFIG.VALIDATION.EMAIL.REGEX.test(email);
  },

  // Validate phone format
  isValidPhone: (phone: string): boolean => {
    return SECURITY_CONFIG.VALIDATION.PHONE.REGEX.test(phone);
  },

  // Validate password strength
  isValidPassword: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < SECURITY_CONFIG.VALIDATION.PASSWORD.MIN_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.VALIDATION.PASSWORD.MIN_LENGTH} characters long`);
    }

    if (SECURITY_CONFIG.VALIDATION.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (SECURITY_CONFIG.VALIDATION.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (SECURITY_CONFIG.VALIDATION.PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (SECURITY_CONFIG.VALIDATION.PASSWORD.REQUIRE_SPECIAL_CHARS && !/[^A-Za-z\d]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },
};

// Export default configuration
export default SECURITY_CONFIG; 