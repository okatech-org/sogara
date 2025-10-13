import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, type Location } from 'react-router-dom'
import { AppProvider, useAuth } from '@/contexts/AppContext'
import { Layout } from '@/components/Layout/Layout'
import { WelcomePage } from '@/components/WelcomePage'
import { LoginForm } from '@/components/auth/LoginForm'
import { Dashboard } from '@/pages/Dashboard'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { DirectionDashboard } from '@/pages/DirectionDashboard'
import { RHDashboard } from '@/pages/RHDashboard'
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

function AppRoutes() {
  return (
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
            <RoleProtected roles={['ADMIN', 'HSE', 'SUPERVISEUR']}>
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
            <RoleProtected roles={['ADMIN', 'HSE', 'SUPERVISEUR']}>
              <EquipementsPage />
            </RoleProtected>
          }
        />
        <Route
          path="hse"
          element={
            <RoleProtected roles={['ADMIN', 'HSE']}>
              <HSEPage />
            </RoleProtected>
          }
        />
        <Route path="connect" element={<SOGARAConnectPage />} />
        <Route
          path="projet"
          element={
            <RoleProtected roles={['ADMIN']}>
              <ProjetPage />
            </RoleProtected>
          }
        />
        <Route path="accounts" element={<AccountHub />} />
        <Route path="accounts/:slug" element={<AccountDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <AppProvider>
    <AppRoutes />
  </AppProvider>
)

export default App
