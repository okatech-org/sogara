import { Bell, Package, Users, Plus, List, HardHat } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AppContext'
import { useDashboard } from '@/hooks/useDashboard'
import { HSENotificationPopover } from '@/components/hse/HSENotificationPopover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { currentUser, logout, hasAnyRole } = useAuth()
  const { recentNotifications } = useDashboard()
  const navigate = useNavigate()
  const location = useLocation()

  const unreadCount = recentNotifications.length

  // Determine available actions based on user roles
  const canCreateVisit = hasAnyRole(['ADMIN', 'RECEP', 'SUPERVISEUR'])
  const canCreatePackage = hasAnyRole(['ADMIN', 'RECEP'])
  const canCreateEquipment = hasAnyRole(['ADMIN', 'HSE', 'SUPERVISEUR'])

  const goTo = (path: string) => {
    navigate(path)
  }

  const showAccountHubShortcut =
    hasAnyRole(['ADMIN']) && 
    !hasAnyRole(['DG']) && 
    !location.pathname.startsWith('/app/accounts')

  const getRoleDisplayName = (roles: string[]) => {
    const roleNames = {
      ADMIN: 'Administrateur',
      HSE: 'Responsable HSE',
      SUPERVISEUR: 'Superviseur',
      RECEP: 'Réceptionniste',
      EMPLOYE: 'Employé',
    }
    return roles.map(role => roleNames[role as keyof typeof roleNames] || role).join(', ')
  }

  return (
    <header className="industrial-card-elevated border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white">
              <img
                src={'/Sogara_logo.png'}
                alt="SOGARA"
                className="w-full h-full object-contain"
                onError={e => {
                  ;(e.currentTarget as HTMLImageElement).src = '/placeholder.svg'
                }}
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">SOGARA Access</h1>
              <p className="text-xs text-muted-foreground">Gestion des Accès</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {(canCreateVisit || canCreatePackage || canCreateEquipment) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Actions rapides
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Créer</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {canCreateVisit && (
                    <DropdownMenuItem onClick={() => goTo('/app/visites')} className="gap-2">
                      <Users className="w-4 h-4" />
                      Nouvelle visite
                    </DropdownMenuItem>
                  )}
                  {canCreatePackage && (
                    <DropdownMenuItem onClick={() => goTo('/app/colis')} className="gap-2">
                      <Package className="w-4 h-4" />
                      Nouveau colis
                    </DropdownMenuItem>
                  )}
                  {canCreateEquipment && (
                    <DropdownMenuItem onClick={() => goTo('/app/equipements')} className="gap-2">
                      <HardHat className="w-4 h-4" />
                      Nouvel équipement
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <div className="flex items-center gap-1">
              {hasAnyRole(['ADMIN', 'HSE', 'SUPERVISEUR', 'EMPLOYE']) ? (
                <HSENotificationPopover unreadCount={unreadCount} />
              ) : (
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="h-6 w-px bg-border" />

          {showAccountHubShortcut && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => goTo('/app/accounts')}
            >
              <List className="w-4 h-4" />
              Comptes démo
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                  {currentUser?.firstName?.[0] || 'U'}
                </div>
                <span className="hidden sm:block">
                  {currentUser?.firstName} {currentUser?.lastName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{currentUser?.service}</p>
                  <p className="text-xs text-primary font-medium">
                    {getRoleDisplayName(currentUser?.roles || [])}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Se déconnecter</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
