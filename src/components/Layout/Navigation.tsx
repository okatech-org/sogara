import { Home, Users, Calendar, Package, HardHat, Shield, Newspaper, FileText } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AppContext';
import { UserRole } from '@/types';

type NavigationItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  requiredRoles?: UserRole[];
  path: string;
};

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: Home, path: '/app/dashboard' },
  { id: 'connect', label: 'SOGARA Connect', icon: Newspaper, path: '/app/connect' },
  { id: 'personnel', label: 'Personnel', icon: Users, requiredRoles: ['ADMIN', 'HSE', 'SUPERVISEUR'], path: '/app/personnel' },
  { id: 'visites', label: 'Visites', icon: Calendar, requiredRoles: ['ADMIN', 'RECEP', 'SUPERVISEUR'], path: '/app/visites' },
  { id: 'colis', label: 'Colis & Courriers', icon: Package, requiredRoles: ['ADMIN', 'RECEP'], path: '/app/colis' },
  { id: 'equipements', label: 'Équipements', icon: HardHat, requiredRoles: ['ADMIN', 'HSE', 'SUPERVISEUR'], path: '/app/equipements' },
  { id: 'hse', label: 'HSE', icon: Shield, requiredRoles: ['ADMIN', 'HSE'], path: '/app/hse' },
  { id: 'projet', label: 'Documentation Projet', icon: FileText, requiredRoles: ['ADMIN'], path: '/app/projet' },
  { id: 'accounts', label: 'Comptes & Profils', icon: Users, path: '/app/accounts', requiredRoles: ['ADMIN'] },
];

export function Navigation() {
  const { hasAnyRole } = useAuth();

  const getVisibleItems = () => {
    return navigationItems.filter(item => {
      // Dashboard is visible to everyone
      if (item.id === 'dashboard') return true;
      // If no roles specified, show to everyone
      if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
      // Check if user has any of the required roles
      return hasAnyRole(item.requiredRoles);
    });
  };

  return (
    <nav className="industrial-card border-r bg-white/50 backdrop-blur-sm w-64 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-2">
        {getVisibleItems().map((item) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex w-full items-center gap-3 h-11 px-3 rounded-md transition-colors',
                  isActive ? 'gradient-primary text-white shadow-md' : 'hover:bg-muted'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}