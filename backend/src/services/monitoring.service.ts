import { sendActualEmail } from './email.service';

export interface MonitoringEvent {
  type: 'PAYMENT_FAILURE' | 'STOCK_DEPLETION' | 'ORDER_FAILURE' | 'SECURITY_ALERT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details: any;
  timestamp: Date;
  userId?: string;
  orderId?: string;
  productId?: string;
}

export interface AlertConfig {
  email: string;
  enabled: boolean;
  eventTypes: string[];
  minSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

class MonitoringService {
  private alertConfigs: AlertConfig[] = [];
  private eventQueue: MonitoringEvent[] = [];
  private isProcessing = false;

  constructor() {
    // Load alert configurations from environment
    this.loadAlertConfigs();
    
    // Process events every 30 seconds
    setInterval(() => {
      this.processEventQueue();
    }, 30000);
  }

  private loadAlertConfigs(): void {
    const adminEmail = process.env.ADMIN_EMAIL;
    const monitoringEmail = process.env.MONITORING_EMAIL;
    
    if (adminEmail) {
      this.alertConfigs.push({
        email: adminEmail,
        enabled: true,
        eventTypes: ['PAYMENT_FAILURE', 'STOCK_DEPLETION', 'ORDER_FAILURE', 'SECURITY_ALERT'],
        minSeverity: 'MEDIUM'
      });
    }
    
    if (monitoringEmail && monitoringEmail !== adminEmail) {
      this.alertConfigs.push({
        email: monitoringEmail,
        enabled: true,
        eventTypes: ['PAYMENT_FAILURE', 'STOCK_DEPLETION', 'ORDER_FAILURE', 'SECURITY_ALERT'],
        minSeverity: 'HIGH'
      });
    }
  }

  /**
   * Log a monitoring event
   */
  logEvent(event: Omit<MonitoringEvent, 'timestamp'>): void {
    const fullEvent: MonitoringEvent = {
      ...event,
      timestamp: new Date()
    };

    // Add to queue for processing
    this.eventQueue.push(fullEvent);

    // Log to console for immediate visibility
    console.log(`[MONITORING] ${fullEvent.severity} - ${fullEvent.type}: ${fullEvent.message}`, fullEvent.details);

    // Process immediately for critical events
    if (fullEvent.severity === 'CRITICAL') {
      this.processEventQueue();
    }
  }

  /**
   * Process the event queue and send alerts
   */
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const events = [...this.eventQueue];
      this.eventQueue = [];

      // Group events by type and severity for better alerting
      const eventGroups = this.groupEvents(events);

      // Send alerts for each group
      for (const [key, groupEvents] of eventGroups) {
        await this.sendAlertForGroup(key, groupEvents);
      }
    } catch (error) {
      console.error('[MONITORING] Error processing event queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Group events by type and severity
   */
  private groupEvents(events: MonitoringEvent[]): Map<string, MonitoringEvent[]> {
    const groups = new Map<string, MonitoringEvent[]>();

    for (const event of events) {
      const key = `${event.type}_${event.severity}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(event);
    }

    return groups;
  }

  /**
   * Send alert for a group of events
   */
  private async sendAlertForGroup(key: string, events: MonitoringEvent[]): Promise<void> {
    if (events.length === 0) return;

    const event = events[0]; // Use first event for template
    const count = events.length;

    // Find applicable alert configurations
    const applicableConfigs = this.alertConfigs.filter(config => 
      config.enabled && 
      config.eventTypes.includes(event.type) &&
      this.isSeverityAtLeast(event.severity, config.minSeverity)
    );

    if (applicableConfigs.length === 0) return;

    // Prepare alert content
    const subject = `[${event.severity}] ${event.type} Alert - ${count} event(s)`;
    const content = this.generateAlertContent(event, events);

    // Send alerts
    for (const config of applicableConfigs) {
      try {
        await sendActualEmail(
          config.email,
          subject,
          content,
          content
        );
        console.log(`[MONITORING] Alert sent to ${config.email} for ${event.type}`);
      } catch (error) {
        console.error(`[MONITORING] Failed to send alert to ${config.email}:`, error);
      }
    }
  }

  /**
   * Generate alert content
   */
  private generateAlertContent(event: MonitoringEvent, events: MonitoringEvent[]): string {
    const count = events.length;
    const latestEvent = events[events.length - 1];

    let content = `
      <h2>${event.type} Alert</h2>
      <p><strong>Severity:</strong> ${event.severity}</p>
      <p><strong>Count:</strong> ${count} event(s)</p>
      <p><strong>Latest:</strong> ${latestEvent.message}</p>
      <p><strong>Time:</strong> ${latestEvent.timestamp.toISOString()}</p>
    `;

    if (event.orderId) {
      content += `<p><strong>Order ID:</strong> ${event.orderId}</p>`;
    }

    if (event.userId) {
      content += `<p><strong>User ID:</strong> ${event.userId}</p>`;
    }

    if (event.productId) {
      content += `<p><strong>Product ID:</strong> ${event.productId}</p>`;
    }

    content += `<h3>Details:</h3><pre>${JSON.stringify(event.details, null, 2)}</pre>`;

    if (count > 1) {
      content += `<h3>All Events (${count}):</h3>`;
      content += `<ul>`;
      events.forEach(e => {
        content += `<li>${e.timestamp.toISOString()}: ${e.message}</li>`;
      });
      content += `</ul>`;
    }

    return content;
  }

  /**
   * Check if severity is at least the minimum required
   */
  private isSeverityAtLeast(actual: string, minimum: string): boolean {
    const levels = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
    return levels[actual as keyof typeof levels] >= levels[minimum as keyof typeof levels];
  }

  /**
   * Convenience methods for common events
   */
  logPaymentFailure(orderId: string, userId: string, details: any): void {
    this.logEvent({
      type: 'PAYMENT_FAILURE',
      severity: 'HIGH',
      message: `Payment failed for order ${orderId}`,
      details,
      orderId,
      userId
    });
  }

  logStockDepletion(productId: string, productName: string, currentStock: number): void {
    this.logEvent({
      type: 'STOCK_DEPLETION',
      severity: currentStock === 0 ? 'HIGH' : 'MEDIUM',
      message: `Stock depletion for ${productName} (ID: ${productId})`,
      details: { productId, productName, currentStock },
      productId
    });
  }

  logOrderFailure(orderId: string, userId: string, error: string): void {
    this.logEvent({
      type: 'ORDER_FAILURE',
      severity: 'HIGH',
      message: `Order creation failed for user ${userId}`,
      details: { orderId, userId, error },
      orderId,
      userId
    });
  }

  logSecurityAlert(type: string, details: any, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'): void {
    this.logEvent({
      type: 'SECURITY_ALERT',
      severity,
      message: `Security alert: ${type}`,
      details
    });
  }
}

export const monitoringService = new MonitoringService(); 