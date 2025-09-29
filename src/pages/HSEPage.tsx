import { HSEDashboard } from '@/components/hse/HSEDashboard';
import { HSEErrorBoundary } from '@/components/hse/HSEErrorBoundary';

export function HSEPage() {
  return (
    <HSEErrorBoundary>
      <HSEDashboard />
    </HSEErrorBoundary>
  );
}