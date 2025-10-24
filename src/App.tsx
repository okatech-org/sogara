import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, type Location } from 'react-router-dom'
import { useEffect } from 'react'
import { AppProvider, useAuth } from '@/contexts/AppContext'
import { useSocket } from '@/services/socket.service'
import { useToast } from '@/hooks/use-toast'
import { Layout } from '@/components/Layout/Layout'
import { WelcomePage } from '@/components/WelcomePage'
import { LoginForm } from '@/components/auth/LoginForm'
import { Dashboard } from '@/pages/Dashboard'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { DirectionDashboard } from '@/pages/DirectionDashboard'
import { RHDashboard } from '@/pages/RHDashboard'
import { DirectorGeneralDashboard } from '@/pages/DirectorGeneralDashboard'
import { DGAnalyticsPage } from '@/pages/dg/DGAnalyticsPage'
import { DGReportsPage } from '@/pages/dg/DGReportsPage'
import { DGExportPage } from '@/pages/dg/DGExportPage'
import { DirectionPage } from '@/pages/dg/DirectionPage'
import { DGRHOverviewPage } from '@/pages/dg/DGRHOverviewPage'
import { DGPlanningPage } from '@/pages/dg/DGPlanningPage'
import { DGFormationsPage } from '@/pages/dg/DGFormationsPage'
import { DGHSEOverviewPage } from '@/pages/dg/DGHSEOverviewPage'
import { DGHSEIncidentsViewPage } from '@/pages/dg/DGHSEIncidentsViewPage'
import { DGComplianceViewPage } from '@/pages/dg/DGComplianceViewPage'
import { UserSpaceFinalization } from '@/components/UserSpaceFinalization'
import { QuickTest } from '@/components/QuickTest'
import { UserSpaceAnalysis } from '@/components/UserSpaceAnalysis'
import { CompleteFinalization } from '@/components/CompleteFinalization'
import { MesFormationsPage } from '@/pages/employee/MesFormationsPage'
import { MesEquipementsPage } from '@/pages/employee/MesEquipementsPage'
import { MesHabilitationsPage } from '@/pages/employee/MesHabilitationsPage'
import { MonPlanningPage } from '@/pages/employee/MonPlanningPage'
import { MaPaiePage } from '@/pages/employee/MaPaiePage'
import { MesEvaluationsPage } from '@/pages/external/MesEvaluationsPage'
import { MesFormationsExternePage } from '@/pages/external/MesFormationsExternePage'
import { MesEvaluationsExternePage } from '@/pages/external/MesEvaluationsExternePage'
import { MesHabilitationsExternePage } from '@/pages/external/MesHabilitationsExternePage'
import { PlanningPage } from '@/pages/PlanningPage'
import { PaiePage } from '@/pages/PaiePage'
import { PersonnelPage } from '@/pages/PersonnelPage'
import { VisitesPage } from '@/pages/VisitesPage'
import { ColisCourrierPage } from '@/pages/ColisCourrierPage'
import { EquipementsPage } from '@/pages/EquipementsPage'
import { HSEPage } from '@/pages/HSEPage'
import { HSSEManagementPage } from '@/pages/HSSEManagementPage'
import { HSSEAccountsPage } from '@/pages/HSSEAccountsPage'
import { StatistiquesFluxHSSEPage } from '@/pages/StatistiquesFluxHSSEPage'
import ConformitePage from '@/pages/ConformitePage'
import { SOGARAConnectPage } from '@/pages/SOGARAConnectPage'
import { ProjetPage } from '@/pages/ProjetPage'
import NotFound from '@/pages/NotFound'
import type { UserRole } from '@/types'
import AccountHub from '@/pages/accounts/AccountHub'
import AccountDetail from '@/pages/accounts/AccountDetail'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

function RoleProtected({ roles, children }: { roles?: UserRole[]; children: ReactNode }) {
  const { hasAnyRole } = useAuth()

  if (!roles || roles.length === 0) {
    return <>{children}</>
  }

  if (!hasAnyRole(roles)) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <>{children}</>
}

function LandingRoute() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <WelcomePage onShowLogin={() => navigate('/login')} />
}

function LoginRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const state = location.state as { from?: Location } | null
  const redirectTarget = state?.from?.pathname?.startsWith('/app')
    ? state.from.pathname
    : '/app/dashboard'

  if (isAuthenticated) {
    return <Navigate to={redirectTarget} replace />
  }

  return <LoginForm onBackToHome={() => navigate('/')} />
}

function SocketProvider({ children }: { children: ReactNode }) {
  const { currentUser, isAuthenticated } = useAuth()
  const { connect, disconnect, on, off } = useSocket()
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const token = localStorage.getItem('accessToken')
      if (token) {
        connect(token)

        // Écouter les notifications
        const handleNotification = (notification: any) => {
          toast({
            title: notification.title,
            description: notification.message,
            duration: 5000,
          })
        }

        const handleHseAlert = (alert: any) => {
          toast({
            title: '🚨 Alerte HSE',
            description: alert.message,
            variant: 'destructive',
            duration: 8000,
          })
        }

        const handleVisitUpdate = (update: any) => {
          toast({
            title: '👥 Visite mise à jour',
            description: update.message,
            duration: 4000,
          })
        }

        const handlePackageUpdate = (update: any) => {
          toast({
            title: '📦 Colis mis à jour',
            description: update.message,
            duration: 4000,
          })
        }

        on('notification', handleNotification)
        on('hse_alert', handleHseAlert)
        on('visit_update', handleVisitUpdate)
        on('package_update', handlePackageUpdate)

        return () => {
          off('notification', handleNotification)
          off('hse_alert', handleHseAlert)
          off('visit_update', handleVisitUpdate)
          off('package_update', handlePackageUpdate)
          disconnect()
        }
      }
    }
  }, [isAuthenticated, currentUser, connect, disconnect, on, off, toast])

  return <>{children}</>
}

function AppRoutes() {
  return (
    <SocketProvider>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/comptes" element={<AccountHub />} />
        <Route path="/comptes/:slug" element={<AccountDetail />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route
            path="dg-strategic"
            element={
              <RoleProtected roles={['DG']}>
                <DirectorGeneralDashboard />
              </RoleProtected>
            }
          />
          <Route
            path="dg-analytics"
            element={
              <RoleProtected roles={['DG']}>
                <DGAnalyticsPage />
              </RoleProtected>
            }
          />
          <Route
            path="dg-rapports"
            element={
              <RoleProtected roles={['DG']}>
                <DGReportsPage />
              </RoleProtected>
            }
          />
          <Route
            path="dg-export"
            element={
              <RoleProtected roles={['DG']}>
                <DGExportPage />
              </RoleProtected>
            }
          />
          <Route
            path="direction"
            element={
              <RoleProtected roles={['DG']}>
                <DirectionPage />
              </RoleProtected>
            }
          />
          <Route
            path="dg-rh-overview"
            element={
              <RoleProtected roles={['DG']}>
                <DGRHOverviewPage />
              </RoleProtected>
            }
          />
          <Route
            path="planning"
            element={
              <RoleProtected roles={['DG']}>
                <DGPlanningPage />
              </RoleProtected>
            }
          />
          <Route
            path="formations"
            element={
              <RoleProtected roles={['DG']}>
                <DGFormationsPage />
              </RoleProtected>
            }
          />
          <Route
            path="dg-hse-overview"
            element={
              <RoleProtected roles={['DG']}>
                <DGHSEOverviewPage />
              </RoleProtected>
            }
          />
          <Route
            path="hse-incidents-view"
            element={
              <RoleProtected roles={['DG']}>
                <DGHSEIncidentsViewPage />
              </RoleProtected>
            }
          />
          <Route
            path="dg-compliance-view"
            element={
              <RoleProtected roles={['DG']}>
                <DGComplianceViewPage />
              </RoleProtected>
            }
          />
          <Route
            path="dg-operations-view"
            element={
              <RoleProtected roles={['DG']}>
                <DGHSEOverviewPage />
              </RoleProtected>
            }
          />
          <Route
            path="admin"
            element={
              <RoleProtected roles={['ADMIN']}>
                <AdminDashboard />
              </RoleProtected>
            }
          />
          <Route
            path="direction"
            element={
              <RoleProtected roles={['DG', 'ADMIN']}>
                <DirectionDashboard />
              </RoleProtected>
            }
          />
          <Route
            path="rh"
            element={
              <RoleProtected roles={['DRH', 'ADMIN']}>
                <RHDashboard />
              </RoleProtected>
            }
          />
          <Route path="mes-evaluations" element={<MesEvaluationsPage />} />
          <Route path="formations-externes" element={<MesFormationsExternePage />} />
          <Route path="evaluations-externes" element={<MesEvaluationsExternePage />} />
          <Route path="habilitations-externes" element={<MesHabilitationsExternePage />} />
          <Route path="mon-planning" element={<MonPlanningPage />} />
          <Route path="ma-paie" element={<MaPaiePage />} />
          <Route path="mes-formations" element={<MesFormationsPage />} />
          <Route path="mes-equipements" element={<MesEquipementsPage />} />
          <Route path="mes-habilitations" element={<MesHabilitationsPage />} />
          <Route
            path="planning"
            element={
              <RoleProtected roles={['ADMIN', 'DRH', 'DG']}>
                <PlanningPage />
              </RoleProtected>
            }
          />
          <Route
            path="paie"
            element={
              <RoleProtected roles={['ADMIN', 'DRH', 'DG']}>
                <PaiePage />
              </RoleProtected>
            }
          />
          <Route
            path="personnel"
            element={
              <RoleProtected roles={['ADMIN', 'HSE', 'SUPERVISEUR', 'COMPLIANCE', 'DRH']}>
                <PersonnelPage />
              </RoleProtected>
            }
          />
          <Route
            path="visites"
            element={
              <RoleProtected roles={['ADMIN', 'RECEP', 'SUPERVISEUR']}>
                <VisitesPage />
              </RoleProtected>
            }
          />
          <Route
            path="colis"
            element={
              <RoleProtected roles={['ADMIN', 'RECEP']}>
                <ColisCourrierPage />
              </RoleProtected>
            }
          />
          <Route
            path="equipements"
            element={
              <RoleProtected roles={['ADMIN', 'HSE', 'SUPERVISEUR', 'COMPLIANCE']}>
                <EquipementsPage />
              </RoleProtected>
            }
          />
          <Route
            path="hse"
            element={
              <RoleProtected roles={['ADMIN', 'HSE', 'COMPLIANCE']}>
                <HSEPage />
              </RoleProtected>
            }
          />
          <Route
            path="formations-hse"
            element={
              <RoleProtected roles={['ADMIN', 'HSE', 'COMPLIANCE']}>
                <HSEPage />
              </RoleProtected>
            }
          />
          <Route
            path="donnees-hse"
            element={
              <RoleProtected roles={['ADMIN', 'HSE', 'COMPLIANCE']}>
                <HSEPage />
              </RoleProtected>
            }
          />
          <Route
            path="rapports-hse"
            element={
              <RoleProtected roles={['ADMIN', 'HSE', 'COMPLIANCE']}>
                <HSEPage />
              </RoleProtected>
            }
          />
          <Route
            path="hse001"
            element={
              <RoleProtected roles={['ADMIN', 'HSE', 'COMPLIANCE', 'SECURITE']}>
                <HSEPage />
              </RoleProtected>
            }
          />
          <Route
            path="hse002"
            element={
              <RoleProtected roles={['HSE', 'COMPLIANCE', 'SECURITE']}>
                <HSEPage />
              </RoleProtected>
            }
          />
          <Route
            path="hsse-management"
            element={
              <RoleProtected roles={['HSSE_CHIEF']}>
                <HSSEManagementPage />
              </RoleProtected>
            }
          />
          <Route
            path="hsse-accounts"
            element={
              <RoleProtected roles={['HSSE_CHIEF']}>
                <HSSEAccountsPage />
              </RoleProtected>
            }
          />
          <Route
            path="flux-hsse"
            element={
              <RoleProtected roles={['HSSE_CHIEF']}>
                <StatistiquesFluxHSSEPage />
              </RoleProtected>
            }
          />
          <Route
            path="conformite"
            element={
              <RoleProtected roles={['COMPLIANCE']}>
                <ConformitePage />
              </RoleProtected>
            }
          />
          <Route path="connect" element={<SOGARAConnectPage />} />
          <Route path="connect-analytics" element={<UserSpaceFinalization />} />
          <Route path="quick-test" element={<QuickTest />} />
          <Route path="user-space-analysis" element={<UserSpaceAnalysis />} />
          <Route path="complete-finalization" element={<CompleteFinalization />} />
          <Route
            path="projet"
            element={
              <RoleProtected roles={['ADMIN']}>
                <ProjetPage />
              </RoleProtected>
            }
          />
          <Route
            path="accounts"
            element={
              <RoleProtected roles={['ADMIN']}>
                <AccountHub />
              </RoleProtected>
            }
          />
          <Route
            path="accounts/:slug"
            element={
              <RoleProtected roles={['ADMIN']}>
                <AccountDetail />
              </RoleProtected>
            }
          />
          <Route
            path="parametres"
            element={
              <div className="p-6">
                <h1 className="text-2xl font-bold">Paramètres</h1>
                <p>Page de paramètres en cours de développement</p>
              </div>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SocketProvider>
  )
}

const App = () => (
  <AppProvider>
    <AppRoutes />
  </AppProvider>
)

export default App
