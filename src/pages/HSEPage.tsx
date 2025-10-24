import { HSEDashboard } from '@/components/hse/HSEDashboard'
import { HSEAdminDashboard } from '@/components/hse/HSEAdminDashboard'
import { DGHSEDashboard } from '@/components/hse/DGHSEDashboard'
import { HSEErrorBoundary } from '@/components/hse/HSEErrorBoundary'
import { useAuth } from '@/contexts/AppContext'

export function HSEPage() {
  const { currentUser } = useAuth()

  const isHSSEDirector =
    currentUser?.roles.includes('ADMIN') &&
    (currentUser?.roles.includes('HSE') ||
      currentUser?.roles.includes('COMPLIANCE') ||
      currentUser?.roles.includes('SECURITE'))

  const isDirectorGeneral = currentUser?.roles.includes('DG')

  return (
    <HSEErrorBoundary>
      {isDirectorGeneral ? (
        <DGHSEDashboard />
      ) : isHSSEDirector ? (
        <HSEAdminDashboard />
      ) : (
        <HSEDashboard />
      )}
    </HSEErrorBoundary>
  )
}
