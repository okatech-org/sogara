import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  variant?: 'operational' | 'maintenance' | 'urgent' | 'success' | 'warning' | 'info'
  className?: string
}

const statusVariants = {
  operational: 'status-operational',
  maintenance: 'status-maintenance',
  urgent: 'status-urgent',
  success: 'status-operational',
  warning: 'status-maintenance',
  info: 'bg-primary/10 text-primary border border-primary/20',
}

export function StatusBadge({ status, variant = 'info', className }: StatusBadgeProps) {
  return <span className={cn('status-badge', statusVariants[variant], className)}>{status}</span>
}
