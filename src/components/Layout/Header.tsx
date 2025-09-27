import { Bell, Package, Users, HardHat, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AppContext';
import { useDashboard } from '@/hooks/useDashboard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onCreateVisit: () => void;
  onCreatePackage: () => void;
  onCreateEquipment: () => void;
}

export function Header({ onCreateVisit, onCreatePackage, onCreateEquipment }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const { recentNotifications } = useDashboard();

  const unreadCount = recentNotifications.length;

  return (
    <header className="industrial-card-elevated border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">SOGARA Access</h1>
              <p className="text-xs text-muted-foreground">Gestion des Accès</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
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
                <DropdownMenuItem onClick={onCreateVisit} className="gap-2">
                  <Users className="w-4 h-4" />
                  Nouvelle visite
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCreatePackage} className="gap-2">
                  <Package className="w-4 h-4" />
                  Nouveau colis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCreateEquipment} className="gap-2">
                  <HardHat className="w-4 h-4" />
                  Nouvel équipement
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{currentUser?.firstName} {currentUser?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.service}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}