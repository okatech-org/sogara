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
}

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
  const { hasAnyRole, currentUser } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { unreadCount } = useEmployeeHSEInbox(currentUser?.id || '')

  const getVisibleItems = () => {
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
                'flex w-full items-center gap-3 h-11 px-3 rounded-md transition-colors relative',
                isActive ? 'gradient-primary text-white shadow-md' : 'hover:bg-muted',
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span className="flex-1">{item.label}</span>
            {(item.badge || showHSEBadge) && (
              <Badge className="text-xs">{showHSEBadge ? unreadCount : item.badge}</Badge>
            )}
          </NavLink>
        )
      })}
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
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
              <h2 className="font-semibold">Navigation</h2>
            </div>
            <div className="p-4 space-y-2">{renderNavItems()}</div>
          </nav>
        </>
      )}
    </>
  )
}
