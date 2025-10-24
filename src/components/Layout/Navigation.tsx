import { useState } from 'react'
import {
  Home,
  Users,
  Calendar,
  Package,
  HardHat,
  Shield,
  Newspaper,
  FileText,
  Menu,
  X,
  BookOpen,
  Award,
  DollarSign,
  CalendarDays,
  BarChart3,
  FileCheck,
  ClipboardCheck,
  TrendingUp,
  Download,
  Settings,
  AlertTriangle,
  Megaphone,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AppContext'
import { useEmployeeHSEInbox } from '@/hooks/useEmployeeHSEInbox'
import { UserRole } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DirectorGeneralMenu } from '@/components/navigation/DirectorGeneralMenu'

type NavigationItem = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  requiredRoles?: UserRole[]
  excludeRoles?: UserRole[]
  path: string
  description?: string
}

// Menu spécifique pour HSE001 - Chef de Division HSSE et Conformité
const hse001NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: Home,
    path: '/app/dashboard',
  },
  {
    id: 'hse001',
    label: 'Administration HSSE',
    icon: Shield,
    path: '/app/hse001',
    description: 'Administration complète HSSE',
  },
  {
    id: 'flux-hsse',
    label: 'Statistiques Flux HSSE',
    icon: BarChart3,
    path: '/app/flux-hsse',
    description: 'Statistiques visites, colis et équipements',
  },
  {
    id: 'connect',
    label: 'SOGARA Connect',
    icon: Newspaper,
    path: '/app/connect',
  },
  {
    id: 'mon-planning',
    label: 'Mon Planning',
    icon: CalendarDays,
    path: '/app/mon-planning',
    description: 'Planning personnel',
  },
]

// Menu spécifique pour HSE002 - Chef HSSE Opérationnel
const hse002NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: Home,
    path: '/app/dashboard',
  },
  {
    id: 'hse-module',
    label: 'Module HSE',
    icon: Shield,
    path: '/app/hse',
    description: 'Gestion HSE - Incidents et Formations',
  },
  {
    id: 'formations-hse',
    label: 'Formations HSE',
    icon: BookOpen,
    path: '/app/formations-hse',
    description: 'Gestion des formations HSSE',
  },
  {
    id: 'donnees-hse',
    label: 'Données HSE',
    icon: FileText,
    path: '/app/donnees-hse',
    description: 'Données et statistiques HSE',
  },
  {
    id: 'rapports-hse',
    label: 'Rapports HSE',
    icon: BarChart3,
    path: '/app/rapports-hse',
    description: 'Rapports et analyses HSE',
  },
  {
    id: 'connect',
    label: 'SOGARA Connect',
    icon: Newspaper,
    path: '/app/connect',
  },
  {
    id: 'mon-planning',
    label: 'Mon Planning',
    icon: CalendarDays,
    path: '/app/mon-planning',
    description: 'Planning personnel',
  },
  {
    id: 'parametres',
    label: 'Paramètres',
    icon: Settings,
    path: '/app/parametres',
    description: 'Paramètres du compte',
  },
]

// Menu spécifique pour REC001 - Responsable Sécurité
const rec001NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: Home,
    path: '/app/dashboard',
  },
  {
    id: 'securite-module',
    label: 'Module Sécurité',
    icon: Shield,
    path: '/app/securite',
    description: 'Gestion Sécurité - Visites, Colis et Logistique',
  },
  {
    id: 'visites-colis',
    label: 'Visites/Colis/Courrier',
    icon: Package,
    path: '/app/visites-colis',
    description: 'Gestion des visites, colis et courrier',
  },
  {
    id: 'logistique',
    label: 'Logistique',
    icon: HardHat,
    path: '/app/logistique',
    description: "Magasin d'équipement et distribution",
  },
  {
    id: 'formations-securite',
    label: 'Formations Sécurité',
    icon: BookOpen,
    path: '/app/formations-securite',
    description: 'Formations sécurité du personnel',
  },
  {
    id: 'donnees-securite',
    label: 'Données Sécurité',
    icon: FileText,
    path: '/app/donnees-securite',
    description: 'Données et statistiques sécurité',
  },
  {
    id: 'rapports-securite',
    label: 'Rapports Sécurité',
    icon: BarChart3,
    path: '/app/rapports-securite',
    description: 'Rapports et analyses sécurité',
  },
  {
    id: 'connect',
    label: 'SOGARA Connect',
    icon: Newspaper,
    path: '/app/connect',
  },
  {
    id: 'mon-planning',
    label: 'Mon Planning',
    icon: CalendarDays,
    path: '/app/mon-planning',
    description: 'Planning personnel',
  },
  {
    id: 'parametres',
    label: 'Paramètres',
    icon: Settings,
    path: '/app/parametres',
    description: 'Paramètres du compte',
  },
]

// Menu spécifique pour CONF001 - Responsable Conformité
const conf001NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: Home,
    path: '/app/dashboard',
  },
  {
    id: 'conformite-module',
    label: 'Module Conformité',
    icon: FileCheck,
    path: '/app/conformite',
    description: 'Gestion Conformité - Audits et Réglementation',
  },
  {
    id: 'formations-conformite',
    label: 'Formations Conformité',
    icon: BookOpen,
    path: '/app/formations-conformite',
    description: 'Formations conformité réglementaire',
  },
  {
    id: 'donnees-conformite',
    label: 'Données Conformité',
    icon: FileText,
    path: '/app/donnees-conformite',
    description: 'Données et statistiques conformité',
  },
  {
    id: 'rapports-conformite',
    label: 'Rapports Conformité',
    icon: BarChart3,
    path: '/app/rapports-conformite',
    description: 'Rapports et analyses conformité',
  },
  {
    id: 'connect',
    label: 'SOGARA Connect',
    icon: Newspaper,
    path: '/app/connect',
  },
  {
    id: 'mon-planning',
    label: 'Mon Planning',
    icon: CalendarDays,
    path: '/app/mon-planning',
    description: 'Planning personnel',
  },
  {
    id: 'parametres',
    label: 'Paramètres',
    icon: Settings,
    path: '/app/parametres',
    description: 'Paramètres du compte',
  },
]

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: Home, path: '/app/dashboard' },
  { id: 'connect', label: 'SOGARA Connect', icon: Newspaper, path: '/app/connect' },

  // Section Candidat Externe
  {
    id: 'mes-formations-ext',
    label: 'Formations',
    icon: BookOpen,
    requiredRoles: ['EXTERNE'],
    path: '/app/formations-externes',
  },
  {
    id: 'mes-evaluations-ext',
    label: 'Évaluations',
    icon: FileText,
    requiredRoles: ['EXTERNE'],
    path: '/app/evaluations-externes',
  },
  {
    id: 'mes-habilitations-ext',
    label: 'Habilitations',
    icon: Award,
    requiredRoles: ['EXTERNE'],
    path: '/app/habilitations-externes',
  },

  // Section Employé
  {
    id: 'mon-planning',
    label: 'Mon Planning',
    icon: CalendarDays,
    requiredRoles: ['EMPLOYE'],
    path: '/app/mon-planning',
  },
  {
    id: 'ma-paie',
    label: 'Ma Paie',
    icon: DollarSign,
    requiredRoles: ['EMPLOYE'],
    path: '/app/ma-paie',
  },
  {
    id: 'mes-formations',
    label: 'Mes Formations HSE',
    icon: BookOpen,
    requiredRoles: ['EMPLOYE'],
    path: '/app/mes-formations',
  },
  {
    id: 'mes-equipements',
    label: 'Mes Équipements',
    icon: HardHat,
    requiredRoles: ['EMPLOYE'],
    path: '/app/mes-equipements',
  },
  {
    id: 'mes-habilitations',
    label: 'Mes Habilitations',
    icon: Award,
    requiredRoles: ['EMPLOYE'],
    path: '/app/mes-habilitations',
  },

  // Section Gestion
  {
    id: 'personnel',
    label: 'Personnel',
    icon: Users,
    requiredRoles: ['ADMIN', 'HSE', 'SUPERVISEUR', 'DRH', 'COMPLIANCE'],
    path: '/app/personnel',
  },
  {
    id: 'planning',
    label: 'Planning Global',
    icon: CalendarDays,
    requiredRoles: ['ADMIN', 'DRH', 'DG'],
    path: '/app/planning',
  },
  {
    id: 'paie',
    label: 'Gestion Paie',
    icon: DollarSign,
    requiredRoles: ['ADMIN', 'DRH', 'DG'],
    path: '/app/paie',
  },
  {
    id: 'visites',
    label: 'Visites',
    icon: Calendar,
    requiredRoles: ['ADMIN', 'RECEP', 'SUPERVISEUR'],
    path: '/app/visites',
  },
  {
    id: 'colis',
    label: 'Colis & Courriers',
    icon: Package,
    requiredRoles: ['ADMIN', 'RECEP'],
    path: '/app/colis',
  },
  {
    id: 'equipements',
    label: 'Équipements',
    icon: HardHat,
    requiredRoles: ['ADMIN', 'HSE', 'SUPERVISEUR', 'COMPLIANCE'],
    path: '/app/equipements',
  },
  {
    id: 'hse',
    label: 'HSE',
    icon: Shield,
    requiredRoles: ['ADMIN', 'HSE', 'COMPLIANCE'],
    path: '/app/hse',
  },
  {
    id: 'hse001',
    label: 'HSSE Admin',
    icon: Shield,
    requiredRoles: ['ADMIN', 'HSE', 'COMPLIANCE', 'SECURITE'],
    path: '/app/hse001',
  },
  {
    id: 'hse002',
    label: 'HSSE Opérationnel',
    icon: Shield,
    requiredRoles: ['HSE', 'COMPLIANCE', 'SECURITE'],
    path: '/app/hse002',
  },
  {
    id: 'projet',
    label: 'Documentation Projet',
    icon: FileText,
    requiredRoles: ['ADMIN'],
    path: '/app/projet',
  },
  {
    id: 'accounts',
    label: 'Comptes & Profils',
    icon: Users,
    path: '/app/accounts',
    requiredRoles: ['ADMIN'],
    excludeRoles: ['DG'],
  },
]

export function Navigation() {
  const { hasAnyRole, currentUser, user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { unreadCount } = useEmployeeHSEInbox(currentUser?.id || '')

  // Vérifier si c'est le compte DG001 - Directeur Général
  const isDirectorGeneral =
    (user?.roles && user.roles.includes('DG')) ||
    user?.matricule === 'DG001' ||
    (currentUser?.roles && currentUser.roles.includes('DG')) ||
    currentUser?.matricule === 'DG001'

  // Vérifier si c'est le compte HSE001 - Chef de Division HSSE
  const isHSSEDirector =
    (user?.roles && user.roles.includes('HSSE_CHIEF')) ||
    user?.matricule === 'HSE001' ||
    (currentUser?.roles && currentUser.roles.includes('HSSE_CHIEF')) ||
    currentUser?.matricule === 'HSE001'

  // Vérifier si c'est le compte HSE002 - Chef HSSE Opérationnel
  const isHSEOperational =
    (user?.roles && user.roles.includes('HSE')) ||
    user?.matricule === 'HSE002' ||
    (currentUser?.roles && currentUser.roles.includes('HSE')) ||
    currentUser?.matricule === 'HSE002'

  // Vérifier si c'est le compte REC001 - Responsable Sécurité
  const isSecurityManager =
    (user?.roles && user.roles.includes('SECURITE')) ||
    user?.matricule === 'REC001' ||
    (currentUser?.roles && currentUser.roles.includes('SECURITE')) ||
    currentUser?.matricule === 'REC001'

  // Vérifier si c'est le compte CONF001 - Responsable Conformité
  const isComplianceManager =
    (user?.roles && user.roles.includes('COMPLIANCE')) ||
    user?.matricule === 'CONF001' ||
    (currentUser?.roles && currentUser.roles.includes('COMPLIANCE')) ||
    currentUser?.matricule === 'CONF001'

  const getVisibleItems = () => {
    // Menu spécifique pour HSE001 - Chef de Division HSSE
    if (isHSSEDirector) {
      return hse001NavigationItems
    }

    // Menu spécifique pour HSE002 - Chef HSSE Opérationnel
    if (isHSEOperational) {
      return hse002NavigationItems
    }

    // Menu spécifique pour REC001 - Responsable Sécurité
    if (isSecurityManager) {
      return rec001NavigationItems
    }

    // Menu spécifique pour CONF001 - Responsable Conformité
    if (isComplianceManager) {
      return conf001NavigationItems
    }

    // Menu standard pour les autres utilisateurs
    return navigationItems.filter(item => {
      if (item.id === 'dashboard') return true

      // Vérifier les rôles exclus
      if (item.excludeRoles && item.excludeRoles.length > 0) {
        if (hasAnyRole(item.excludeRoles)) return false
      }

      // Vérifier les rôles requis
      if (!item.requiredRoles || item.requiredRoles.length === 0) return true
      return hasAnyRole(item.requiredRoles)
    })
  }

  const visibleItems = getVisibleItems()

  const renderNavItems = () => {
    // Si c'est le DG, utiliser le menu spécialisé
    if (isDirectorGeneral) {
      return <DirectorGeneralMenu />
    }

    // Menu standard pour les autres utilisateurs
    return (
      <>
        {visibleItems.map(item => {
          const Icon = item.icon
          const showHSEBadge = item.id === 'connect' && unreadCount > 0
          const isSectionHeader = item.id.startsWith('section-')
          const isPrioritySection = item.badge === 'PRIORITÉ'

          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex w-full flex-col items-start gap-1 px-3 py-2.5 rounded-md transition-colors relative',
                  isSectionHeader
                    ? cn(
                        'bg-gradient-to-r text-white font-bold border-l-4 border-l-blue-500 mb-2 mt-4',
                        isPrioritySection
                          ? 'from-blue-600 to-indigo-600'
                          : 'from-gray-600 to-gray-700',
                      )
                    : isActive
                      ? 'gradient-primary text-white shadow-md'
                      : 'hover:bg-muted',
                )
              }
            >
              <div className="flex items-center gap-3 w-full">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 font-medium">{item.label}</span>
                {(item.badge || showHSEBadge) && !isSectionHeader && (
                  <Badge
                    className={cn(
                      'text-xs',
                      item.badge === 'PRIORITÉ'
                        ? 'bg-red-600 text-white'
                        : 'bg-blue-600 text-white',
                    )}
                  >
                    {showHSEBadge ? unreadCount : item.badge}
                  </Badge>
                )}
              </div>
              {item.description && !isSectionHeader && (
                <span
                  className={cn(
                    'text-xs ml-8 opacity-80',
                    !item.description.includes('stat') && 'italic',
                  )}
                >
                  {item.description}
                </span>
              )}
            </NavLink>
          )
        })}
      </>
    )
  }

  return (
    <>
      {/* Mobile Menu Button - Visible uniquement sur mobile */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block industrial-card border-r bg-white/50 backdrop-blur-sm w-64 min-h-[calc(100vh-4rem)]">
        {isHSSEDirector && (
          <div className="p-4 pb-3 border-b bg-secondary/20">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Direction HSSE</span>
            </div>
            <p className="text-xs text-muted-foreground">Chef de Division HSSE et Conformité</p>
          </div>
        )}
        {isHSEOperational && (
          <div className="p-4 pb-3 border-b bg-secondary/20">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Opérations HSE</span>
            </div>
            <p className="text-xs text-muted-foreground">Gestion HSE - Incidents et Formations</p>
          </div>
        )}
        <div className="p-4 space-y-2">{renderNavItems()}</div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <nav className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-xl">
            <div className="p-4 border-b">
              {isHSSEDirector ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">Direction HSSE</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Chef de Division HSSE et Conformité
                  </p>
                </>
              ) : isHSEOperational ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">Opérations HSE</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Gestion HSE - Incidents et Formations
                  </p>
                </>
              ) : (
                <h2 className="font-semibold">Navigation</h2>
              )}
            </div>
            <div className="p-4 space-y-2">{renderNavItems()}</div>
          </nav>
        </>
      )}
    </>
  )
}
