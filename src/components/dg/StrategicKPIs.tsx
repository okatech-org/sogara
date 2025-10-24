import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Shield, 
  Users, 
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StrategicKPI {
  title: string;
  value: string | number;
  trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: '7j' | '30j' | '12m';
  };
  status: 'critical' | 'warning' | 'healthy';
  action?: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface StrategicKPIsProps {
  kpis: StrategicKPI[];
}

export function StrategicKPIs({ kpis }: StrategicKPIsProps) {
  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return <ArrowUp className="w-3 h-3" />;
      case 'down': return <ArrowDown className="w-3 h-3" />;
      case 'stable': return <Minus className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: 'critical' | 'warning' | 'healthy') => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusLabel = (status: 'critical' | 'warning' | 'healthy') => {
    switch (status) {
      case 'critical': return 'Critique';
      case 'warning': return 'Attention';
      case 'healthy': return 'Bon';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={cn(
                'p-2 rounded-lg',
                kpi.color.replace('text-', 'bg-').replace('-600', '-100')
              )}>
                <Icon className={cn('h-4 w-4', kpi.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">{kpi.value}</div>
              <div className="flex items-center gap-2 text-xs mb-2">
                <div className={cn(
                  'flex items-center gap-1',
                  kpi.trend.direction === 'up' ? 'text-green-600' : 
                  kpi.trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                )}>
                  {getTrendIcon(kpi.trend.direction)}
                  <span>
                    {kpi.trend.percentage > 0 ? '+' : ''}{kpi.trend.percentage}%
                  </span>
                </div>
                <span className="text-muted-foreground">sur {kpi.trend.period}</span>
              </div>
              <Badge className={cn('text-xs', getStatusColor(kpi.status))}>
                {getStatusLabel(kpi.status)}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
