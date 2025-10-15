import { HSEDashboard } from '@/components/hse/HSEDashboard'
import { HSEAdminDashboard } from '@/components/hse/HSEAdminDashboard'
import { HSEErrorBoundary } from '@/components/hse/HSEErrorBoundary'
import { useAuth } from '@/contexts/AppContext'

export function HSEPage() {
  const { user } = useAuth()

  const isHSSEDirector =
    user?.roles.includes('ADMIN') &&
    (user?.roles.includes('HSE') ||
      user?.roles.includes('COMPLIANCE') ||
      user?.roles.includes('SECURITE'))

  return (
    <HSEErrorBoundary>{isHSSEDirector ? <HSEAdminDashboard /> : <HSEDashboard />}</HSEErrorBoundary>
  )
}
