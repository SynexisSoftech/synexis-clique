import apiClient from '../utils/axiosInstance';

export interface AuditLog {
  _id: string;
  action: string;
  userId?: {
    _id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: any;
  createdAt: string;
}

export interface AuditLogStats {
  totalLogs: number;
  logsToday: number;
  logsThisWeek: number;
  logsThisMonth: number;
  actionBreakdown: Array<{ _id: string; count: number }>;
  severityBreakdown: Array<{ _id: string; count: number }>;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  action?: string;
  userId?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalLogs: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ExportFilters {
  startDate?: string;
  endDate?: string;
  action?: string;
  severity?: string;
}

class AuditLogService {
  /**
   * Get audit logs with pagination and filtering
   */
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/api/admin/audit-logs?${params.toString()}`);
    return response.data;
  }

  /**
   * Get audit log statistics
   */
  async getAuditLogStats(): Promise<AuditLogStats> {
    const response = await apiClient.get('/api/admin/audit-logs/stats');
    return response.data;
  }

  /**
   * Get specific audit log details
   */
  async getAuditLogById(id: string): Promise<AuditLog> {
    const response = await apiClient.get(`/api/admin/audit-logs/${id}`);
    return response.data;
  }

  /**
   * Export audit logs to CSV
   */
  async exportAuditLogs(filters: ExportFilters = {}): Promise<Blob> {
    const response = await apiClient.post('/api/admin/audit-logs/export', filters, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Download CSV file
   */
  async downloadAuditLogs(filters: ExportFilters = {}): Promise<void> {
    const blob = await this.exportAuditLogs(filters);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get severity color for UI
   */
  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  /**
   * Get action display name
   */
  getActionDisplayName(action: string): string {
    const actionMap: Record<string, string> = {
      'login': 'User Login',
      'logout': 'User Logout',
      'login_failed': 'Failed Login',
      'password_change': 'Password Change',
      'profile_update': 'Profile Update',
      'token_blacklisted': 'Token Blacklisted',
      'admin_action': 'Admin Action',
      'security_violation': 'Security Violation',
      'rate_limit_exceeded': 'Rate Limit Exceeded',
      'account_locked': 'Account Locked',
      'csrf_violation': 'CSRF Violation'
    };
    return actionMap[action] || action;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}

export default new AuditLogService(); 