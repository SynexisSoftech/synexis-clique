import React from 'react';
import { AlertCircle, Shield, Lock, Clock, AlertTriangle } from 'lucide-react';
import { toast } from './use-toast';

interface SecurityToastProps {
  type: 'lockout' | 'rate-limit' | 'csrf' | 'session-expired' | 'security-warning';
  message: string;
  duration?: number;
}

const securityIcons = {
  lockout: Lock,
  'rate-limit': Clock,
  csrf: Shield,
  'session-expired': AlertCircle,
  'security-warning': AlertTriangle,
};

const securityTitles = {
  lockout: 'Account Locked',
  'rate-limit': 'Rate Limited',
  csrf: 'Security Token',
  'session-expired': 'Session Expired',
  'security-warning': 'Security Warning',
};

export const showSecurityToast = ({ type, message, duration = 5000 }: SecurityToastProps) => {
  const Icon = securityIcons[type];
  const title = securityTitles[type];

  toast({
    title,
    description: message,
    duration,
    variant: type === 'security-warning' ? 'destructive' : 'default',
    action: (
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{title}</span>
      </div>
    ),
  });
};

export default showSecurityToast; 
