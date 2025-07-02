import { Request } from 'express';
import AuditLog, { AuditAction, AuditSeverity } from '../models/auditLog.model';

export class AuditService {
  /**
   * Log a security event
   */
  static async logEvent(
    action: AuditAction,
    resource: string,
    req: Request,
    severity: AuditSeverity = AuditSeverity.LOW,
    userId?: string,
    details?: any,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      const sessionId = req.cookies.sessionId || req.headers['x-session-id'] as string;

      await AuditLog.createLog(
        action,
        resource,
        ipAddress,
        userAgent,
        severity,
        userId,
        details,
        sessionId,
        success,
        errorMessage
      );
    } catch (error) {
      console.error('[AuditService] Failed to log event:', error);
    }
  }

  /**
   * Log successful login
   */
  static async logSuccessfulLogin(req: Request, userId: string, email: string): Promise<void> {
    await this.logEvent(
      AuditAction.LOGIN,
      '/api/auth/login',
      req,
      AuditSeverity.LOW,
      userId,
      { email },
      true
    );
  }

  /**
   * Log failed login attempt
   */
  static async logFailedLogin(req: Request, email: string, reason: string): Promise<void> {
    await this.logEvent(
      AuditAction.LOGIN_FAILED,
      '/api/auth/login',
      req,
      AuditSeverity.MEDIUM,
      undefined,
      { email, reason },
      false,
      reason
    );
  }

  /**
   * Log logout
   */
  static async logLogout(req: Request, userId: string): Promise<void> {
    await this.logEvent(
      AuditAction.LOGOUT,
      '/api/auth/logout',
      req,
      AuditSeverity.LOW,
      userId,
      {},
      true
    );
  }

  /**
   * Log account lockout
   */
  static async logAccountLocked(req: Request, email: string, reason: string): Promise<void> {
    await this.logEvent(
      AuditAction.ACCOUNT_LOCKED,
      '/api/auth/login',
      req,
      AuditSeverity.HIGH,
      undefined,
      { email, reason },
      false,
      reason
    );
  }

  /**
   * Log unauthorized access attempt
   */
  static async logUnauthorizedAccess(req: Request, resource: string, reason: string): Promise<void> {
    await this.logEvent(
      AuditAction.UNAUTHORIZED_ACCESS,
      resource,
      req,
      AuditSeverity.MEDIUM,
      undefined,
      { reason },
      false,
      reason
    );
  }

  /**
   * Log admin action
   */
  static async logAdminAction(req: Request, userId: string, action: string, details?: any): Promise<void> {
    await this.logEvent(
      AuditAction.ADMIN_ACTION,
      req.path,
      req,
      AuditSeverity.MEDIUM,
      userId,
      { action, ...details },
      true
    );
  }

  /**
   * Log token blacklisting
   */
  static async logTokenBlacklisted(req: Request, userId: string, reason: string): Promise<void> {
    await this.logEvent(
      AuditAction.TOKEN_BLACKLISTED,
      '/api/auth/logout',
      req,
      AuditSeverity.MEDIUM,
      userId,
      { reason },
      true
    );
  }

  /**
   * Log CSRF violation
   */
  static async logCSRFViolation(req: Request, details: any): Promise<void> {
    await this.logEvent(
      AuditAction.CSRF_VIOLATION,
      req.path,
      req,
      AuditSeverity.HIGH,
      undefined,
      details,
      false,
      'CSRF token validation failed'
    );
  }

  /**
   * Log rate limit exceeded
   */
  static async logRateLimitExceeded(req: Request, limit: number, windowMs: number): Promise<void> {
    await this.logEvent(
      AuditAction.RATE_LIMIT_EXCEEDED,
      req.path,
      req,
      AuditSeverity.MEDIUM,
      undefined,
      { limit, windowMs },
      false,
      'Rate limit exceeded'
    );
  }

  /**
   * Log security breach
   */
  static async logSecurityBreach(req: Request, breachType: string, details: any): Promise<void> {
    await this.logEvent(
      AuditAction.SECURITY_BREACH,
      req.path,
      req,
      AuditSeverity.CRITICAL,
      undefined,
      { breachType, ...details },
      false,
      `Security breach detected: ${breachType}`
    );
  }

  /**
   * Get audit logs for a user
   */
  static async getUserLogs(userId: string, limit: number = 50, skip: number = 0) {
    return await AuditLog.getUserLogs(userId, limit, skip);
  }

  /**
   * Get security events
   */
  static async getSecurityEvents(severity?: AuditSeverity, limit: number = 100) {
    return await AuditLog.getSecurityEvents(severity, limit);
  }

  /**
   * Get failed login attempts
   */
  static async getFailedLogins(ipAddress?: string, hours: number = 24) {
    return await AuditLog.getFailedLogins(ipAddress, hours);
  }
} 