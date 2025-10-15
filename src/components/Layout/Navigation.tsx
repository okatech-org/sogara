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
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AppContext'
import { useEmployeeHSEInbox } from '@/hooks/useEmployeeHSEInbox'
import { UserRole } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type NavigationItem = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  requiredRoles?: UserRole[]
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
    id: 'hsse-management',
    label: 'Gestion HSSE',
    icon: Shield,
    path: '/app/hsse-management',
    description: 'Statistiques et supervision HSSE',
  },
  {
    id: 'hsse-accounts',
    label: 'Comptes HSSE',
    icon: Users,
    path: '/app/hsse-accounts',
    description: 'Gestion des comptes HSE/Sécurité',
  },
  {
    id: 'hse001',
    label: 'Administration HSSE',
    icon: Shield,
    path: '/app/hse001',
    description: 'Administration complète HSSE',
  },
  {
    id: 'visits-stats',
    label: 'Statistiques Visites',
    icon: Users,
    path: '/app/visits-stats',
    description: 'Statistiques et gestion des visites',
  },
  {
    id: 'mail-stats',
    label: 'Statistiques Colis',
    icon: Package,
    path: '/app/mail-stats',
    description: 'Statistiques colis et courriers',
  },
  {
    id: 'equipment-stats',
    label: 'Statistiques Équipements',
    icon: HardHat,
    path: '/app/equipment-stats',
    description: 'Statistiques équipements de sécurité',
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
    requiredRoles: ['ADMIN', 'HSE', 'SUPERVISEUR', 'DRH'],
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
    requiredRoles: ['ADMIN', 'HSE', 'SUPERVISEUR'],
    path: '/app/equipements',
  },
  { id: 'hse', label: 'HSE', icon: Shield, requiredRoles: ['ADMIN', 'HSE'], path: '/app/hse' },
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
  },
]

export function Navigation() {
  const { hasAnyRole, currentUser, user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { unreadCount } = useEmployeeHSEInbox(currentUser?.id || '')

  // Vérifier si c'est le compte HSE001 - Chef de Division HSSE
  const isHSSEDirector =
    (user?.roles && user.roles.includes('HSSE_CHIEF')) ||
    user?.matricule === 'HSE001' ||
    (currentUser?.roles && currentUser.roles.includes('HSSE_CHIEF')) ||
    currentUser?.matricule === 'HSE001'

  const getVisibleItems = () => {
    // Menu spécifique pour HSE001
    if (isHSSEDirector) {
      return hse001NavigationItems
    }

    // Menu standard pour les autres utilisateurs
    return navigationItems.filter(item => {
      if (item.id === 'dashboard') return true
      if (!item.requiredRoles || item.requiredRoles.length === 0) return true
      return hasAnyRole(item.requiredRoles)
    })
  }

  const visibleItems = getVisibleItems()

  const renderNavItems = () => (
    <>
      {visibleItems.map(item => {
        const Icon = item.icon
        const showHSEBadge = item.id === 'connect' && unreadCount > 0

        return (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex w-full flex-col items-start gap-1 px-3 py-2.5 rounded-md transition-colors relative',
                isActive ? 'gradient-primary text-white shadow-md' : 'hover:bg-muted',
              )
            }
          >
            <div className="flex items-center gap-3 w-full">
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 font-medium">{item.label}</span>
              {(item.badge || showHSEBadge) && (
                <Badge className="text-xs">{showHSEBadge ? unreadCount : item.badge}</Badge>
              )}
            </div>
            {item.description && (
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
              <span className="text-sm font-semibold text-primary">HSSE et Conformité</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Administrateur, Responsable HSSE, COMPLIANCE, SECURITE
            </p>
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
                    <span className="text-sm font-semibold text-primary">HSSE et Conformité</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Administrateur, Responsable HSSE, COMPLIANCE, SECURITE
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
