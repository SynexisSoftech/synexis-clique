// Payment Security Utilities for Frontend
// This file provides additional security measures for payment processing

// Payment security configuration
const PAYMENT_SECURITY_CONFIG = {
  // CSRF token generation
  CSRF_TOKEN_LENGTH: 32,
  
  // Rate limiting for payment attempts
  MAX_PAYMENT_ATTEMPTS: 5,
  PAYMENT_ATTEMPT_WINDOW: 15 * 60 * 1000, // 15 minutes
  
  // Payment validation rules
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 100000, // 1 million NPR
};

// Generate CSRF token for payment forms
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(PAYMENT_SECURITY_CONFIG.CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Validate payment amount
export const validatePaymentAmount = (amount: number): { valid: boolean; error?: string } => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { valid: false, error: 'Invalid amount format' };
  }
  
  if (amount < PAYMENT_SECURITY_CONFIG.MIN_AMOUNT) {
    return { valid: false, error: `Amount must be at least ${PAYMENT_SECURITY_CONFIG.MIN_AMOUNT} NPR` };
  }
  
  if (amount > PAYMENT_SECURITY_CONFIG.MAX_AMOUNT) {
    return { valid: false, error: `Amount cannot exceed ${PAYMENT_SECURITY_CONFIG.MAX_AMOUNT} NPR` };
  }
  
  return { valid: true };
};

// Validate eSewa payment response
export const validateESewaResponse = (response: any): { valid: boolean; error?: string } => {
  if (!response) {
    return { valid: false, error: 'No payment response received' };
  }
  
  const requiredFields = ['transaction_uuid', 'transaction_code', 'status', 'total_amount'];
  for (const field of requiredFields) {
    if (!response[field]) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }
  
  // Validate status
  if (!['COMPLETE', 'PENDING', 'FAILED'].includes(response.status)) {
    return { valid: false, error: 'Invalid payment status' };
  }
  
  // Validate amount
  const amountValidation = validatePaymentAmount(parseFloat(response.total_amount));
  if (!amountValidation.valid) {
    return { valid: false, error: amountValidation.error };
  }
  
  return { valid: true };
};

// Payment attempt rate limiting (client-side)
class PaymentRateLimiter {
  private attempts: Map<string, { count: number; firstAttempt: number }> = new Map();
  
  canAttemptPayment(userId: string): { allowed: boolean; remainingAttempts: number; resetTime?: number } {
    const now = Date.now();
    const userAttempts = this.attempts.get(userId);
    
    if (!userAttempts) {
      this.attempts.set(userId, { count: 1, firstAttempt: now });
      return { 
        allowed: true, 
        remainingAttempts: PAYMENT_SECURITY_CONFIG.MAX_PAYMENT_ATTEMPTS - 1 
      };
    }
    
    // Check if window has expired
    if (now - userAttempts.firstAttempt > PAYMENT_SECURITY_CONFIG.PAYMENT_ATTEMPT_WINDOW) {
      this.attempts.set(userId, { count: 1, firstAttempt: now });
      return { 
        allowed: true, 
        remainingAttempts: PAYMENT_SECURITY_CONFIG.MAX_PAYMENT_ATTEMPTS - 1 
      };
    }
    
    // Check if limit exceeded
    if (userAttempts.count >= PAYMENT_SECURITY_CONFIG.MAX_PAYMENT_ATTEMPTS) {
      const resetTime = userAttempts.firstAttempt + PAYMENT_SECURITY_CONFIG.PAYMENT_ATTEMPT_WINDOW;
      return { 
        allowed: false, 
        remainingAttempts: 0, 
        resetTime 
      };
    }
    
    // Increment attempt count
    userAttempts.count++;
    this.attempts.set(userId, userAttempts);
    
    return { 
      allowed: true, 
      remainingAttempts: PAYMENT_SECURITY_CONFIG.MAX_PAYMENT_ATTEMPTS - userAttempts.count 
    };
  }
  
  resetAttempts(userId: string): void {
    this.attempts.delete(userId);
  }
  
  getAttempts(userId: string): { count: number; firstAttempt: number } | null {
    return this.attempts.get(userId) || null;
  }
}

export const paymentRateLimiter = new PaymentRateLimiter();

// Sanitize payment form data
export const sanitizePaymentData = (data: any): any => {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      sanitized[key] = value
        .replace(/[<>]/g, '') // Remove < and >
        .trim();
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Generate secure payment session ID
export const generatePaymentSessionId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return `${timestamp}-${random}`;
};

// Validate payment session
export const validatePaymentSession = (sessionId: string, maxAge: number = 30 * 60 * 1000): boolean => {
  try {
    const [timestamp] = sessionId.split('-');
    const sessionTime = parseInt(timestamp);
    const now = Date.now();
    
    return (now - sessionTime) <= maxAge;
  } catch (error) {
    return false;
  }
};

// Payment security audit logging
export const logPaymentSecurityEvent = (event: string, details: any): void => {
  const securityEvent = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
  };
  
  
  
  // In production, you might want to send this to a security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to security monitoring service
    // Example: sendToSecurityService(securityEvent);
  }
};

// Enhanced eSewa form submission with security
export const submitSecureESewaPayment = (
  formAction: string, 
  fields: Record<string, any>,
  csrfToken?: string
): void => {
  try {
    // Log security event
    logPaymentSecurityEvent('payment_form_submission', {
      formAction,
      hasCSRFToken: !!csrfToken,
      fieldCount: Object.keys(fields).length,
    });
    
    // Sanitize form data
    const sanitizedFields = sanitizePaymentData(fields);
    
    // Create form
    const form = document.createElement("form");
    form.method = "POST";
    form.action = formAction;
    form.style.display = "none";
    
    // Add CSRF token if provided
    if (csrfToken) {
      const csrfInput = document.createElement("input");
      csrfInput.type = "hidden";
      csrfInput.name = "_csrf";
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);
    }
    
    // Add form fields
    Object.entries(sanitizedFields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value.toString();
      form.appendChild(input);
    });
    
    // Submit form
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    // Log successful submission
    logPaymentSecurityEvent('payment_form_submitted', {
      formAction,
      success: true,
    });
    
  } catch (error) {
    
    logPaymentSecurityEvent('payment_form_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}; 