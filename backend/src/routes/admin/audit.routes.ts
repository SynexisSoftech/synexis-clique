import express, { Request, Response } from 'express';
import { protect } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';
import { adminActionLimiter } from '../../middleware/rateLimiter';
import { csrfProtection } from '../../middleware/csrf.middleware';
import AuditLog from '../../models/auditLog.model';

const router = express.Router();

// Apply middleware to all audit routes
router.use(protect);
router.use(requireAdmin);
router.use(adminActionLimiter);
router.use(csrfProtection);

/**
 * Get audit logs with pagination and filtering
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    
    if (req.query.action && req.query.action !== 'all') {
      filter.action = req.query.action;
    }
    
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    
    if (req.query.severity && req.query.severity !== 'all') {
      filter.severity = req.query.severity;
    }
    
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    // Get logs with pagination
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email firstName lastName')
      .lean();

    // Get total count for pagination
    const totalLogs = await AuditLog.countDocuments(filter);
    const totalPages = Math.ceil(totalLogs / limit);

    res.json({
      logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalLogs,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error: any) {
    console.error('[Audit Logs] Error fetching logs:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
});

/**
 * Get audit log statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Get counts
    const [totalLogs, logsToday, logsThisWeek, logsThisMonth] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ createdAt: { $gte: today } }),
      AuditLog.countDocuments({ createdAt: { $gte: weekAgo } }),
      AuditLog.countDocuments({ createdAt: { $gte: monthAgo } })
    ]);

    // Get action breakdown
    const actionBreakdown = await AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get severity breakdown
    const severityBreakdown = await AuditLog.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalLogs,
      logsToday,
      logsThisWeek,
      logsThisMonth,
      actionBreakdown,
      severityBreakdown
    });

  } catch (error: any) {
    console.error('[Audit Logs] Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch audit log statistics' });
  }
});

/**
 * Export audit logs to CSV
 */
router.post('/export', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, action, severity } = req.body;

    // Build filter
    const filter: any = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (action) filter.action = action;
    if (severity) filter.severity = severity;

    const logs = await AuditLog.find(filter)
      .populate('userId', 'username email firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    // Generate CSV
    const csvHeader = 'Timestamp,Action,User,IP Address,User Agent,Severity,Details\n';
    const csvRows = logs.map((log: any) => {
      const user = log.userId ? `${log.userId.username} (${log.userId.email})` : 'N/A';
      const details = log.details ? JSON.stringify(log.details).replace(/"/g, '""') : '';
      return `"${log.createdAt}","${log.action}","${user}","${log.ipAddress || 'N/A'}","${log.userAgent || 'N/A'}","${log.severity}","${details}"`;
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);

  } catch (error: any) {
    console.error('[Audit Logs] Error exporting logs:', error);
    res.status(500).json({ message: 'Failed to export audit logs' });
  }
});

export default router; 