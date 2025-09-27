import { Home, Users, Calendar, Package, HardHat, Shield, Newspaper, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AppContext';
import { UserRole } from '@/types';

type NavigationItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  requiredRoles?: UserRole[];
};

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: Home },
  { id: 'connect', label: 'SOGARA Connect', icon: Newspaper }, // Accessible à tous
  { id: 'personnel', label: 'Personnel', icon: Users, requiredRoles: ['ADMIN', 'HSE', 'SUPERVISEUR'] },
  { id: 'visites', label: 'Visites', icon: Calendar, requiredRoles: ['ADMIN', 'RECEP', 'SUPERVISEUR'] },
  { id: 'colis', label: 'Colis & Courriers', icon: Package, requiredRoles: ['ADMIN', 'RECEP'] },
  { id: 'equipements', label: 'Équipements', icon: HardHat, requiredRoles: ['ADMIN', 'HSE', 'SUPERVISEUR'] },
  { id: 'hse', label: 'HSE', icon: Shield, requiredRoles: ['ADMIN', 'HSE'] },
  { id: 'projet', label: 'Documentation Projet', icon: FileText, requiredRoles: ['ADMIN'] },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
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
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3 h-11',
                isActive && 'gradient-primary text-white shadow-md'
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={cn(
                  'ml-auto text-xs px-2 py-1 rounded-full',
                  isActive ? 'bg-white/20' : 'bg-accent text-accent-foreground'
                )}>
                  {item.badge}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}