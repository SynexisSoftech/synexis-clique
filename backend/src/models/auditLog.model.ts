import mongoose, { Schema, Document, Model } from 'mongoose';

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  PROFILE_UPDATE = 'profile_update',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  TOKEN_REFRESH = 'token_refresh',
  TOKEN_BLACKLISTED = 'token_blacklisted',
  ADMIN_ACTION = 'admin_action',
  SECURITY_BREACH = 'security_breach',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  CSRF_VIOLATION = 'csrf_violation',
  UNAUTHORIZED_ACCESS = 'unauthorized_access'
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface IAuditLog extends Document {
  userId?: string;
  action: AuditAction;
  resource: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  severity: AuditSeverity;
  details: any;
  sessionId?: string;
  success: boolean;
  errorMessage?: string;
}

const auditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: String,
    required: false,
    index: true
  },
  action: {
    type: String,
    enum: Object.values(AuditAction),
    required: true,
    index: true
  },
  resource: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  severity: {
    type: String,
    enum: Object.values(AuditSeverity),
    default: AuditSeverity.LOW,
    index: true
  },
  details: {
    type: Schema.Types.Mixed,
    required: false
  },
  sessionId: {
    type: String,
    required: false,
    index: true
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  },
  errorMessage: {
    type: String,
    required: false
  }
});

// Compound indexes for efficient queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });

// Method to create audit log entry
auditLogSchema.statics.createLog = async function(
  action: AuditAction,
  resource: string,
  ipAddress: string,
  userAgent: string,
  severity: AuditSeverity = AuditSeverity.LOW,
  userId?: string,
  details?: any,
  sessionId?: string,
  success: boolean = true,
  errorMessage?: string
): Promise<void> {
  await this.create({
    action,
    resource,
    ipAddress,
    userAgent,
    severity,
    userId,
    details,
    sessionId,
    success,
    errorMessage,
    timestamp: new Date()
  });
};

// Method to get audit logs for a user
auditLogSchema.statics.getUserLogs = async function(
  userId: string,
  limit: number = 50,
  skip: number = 0
): Promise<IAuditLog[]> {
  return await this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

// Method to get security events
auditLogSchema.statics.getSecurityEvents = async function(
  severity?: AuditSeverity,
  limit: number = 100
): Promise<IAuditLog[]> {
  const query = severity ? { severity } : {};
  return await this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Method to get failed login attempts
auditLogSchema.statics.getFailedLogins = async function(
  ipAddress?: string,
  hours: number = 24
): Promise<IAuditLog[]> {
  const query: any = {
    action: AuditAction.LOGIN_FAILED,
    timestamp: { $gte: new Date(Date.now() - hours * 60 * 60 * 1000) }
  };
  
  if (ipAddress) {
    query.ipAddress = ipAddress;
  }
  
  return await this.find(query).sort({ timestamp: -1 });
};

export interface IAuditLogModel extends Model<IAuditLog> {
  createLog(
    action: AuditAction,
    resource: string,
    ipAddress: string,
    userAgent: string,
    severity: AuditSeverity,
    userId?: string,
    details?: any,
    sessionId?: string,
    success?: boolean,
    errorMessage?: string
  ): Promise<void>;
  getUserLogs(userId: string, limit?: number, skip?: number): Promise<IAuditLog[]>;
  getSecurityEvents(severity?: AuditSeverity, limit?: number): Promise<IAuditLog[]>;
  getFailedLogins(ipAddress?: string, hours?: number): Promise<IAuditLog[]>;
}

export default mongoose.model<IAuditLog, IAuditLogModel>('AuditLog', auditLogSchema); 