import { Home, Users, Calendar, Package, HardHat, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NavigationItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: Home },
  { id: 'personnel', label: 'Personnel', icon: Users },
  { id: 'visites', label: 'Visites', icon: Calendar },
  { id: 'colis', label: 'Colis & Courriers', icon: Package },
  { id: 'equipements', label: 'Équipements', icon: HardHat },
  { id: 'hse', label: 'HSE', icon: Shield },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="industrial-card border-r bg-white/50 backdrop-blur-sm w-64 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-2">
        {navigationItems.map((item) => {
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