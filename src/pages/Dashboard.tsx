import { useState, useEffect } from 'react';
import { Calendar, Package, HardHat, Shield, Users, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/contexts/AppContext';
import { StatusBadge } from '@/components/ui/status-badge';

export function Dashboard() {
  const { stats, recentNotifications, markNotificationAsRead } = useDashboard();
  const { currentUser } = useAuth();

  const kpiCards = [
    {
      title: 'Visites aujourd\'hui',
      value: stats.visitsToday.total,
      change: `${stats.visitsToday.waiting} en attente`,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Colis en attente',
      value: stats.packages.pending,
      change: `${stats.packages.urgent} urgents`,
      icon: Package,
      color: stats.packages.urgent > 0 ? 'text-accent' : 'text-primary',
      bgColor: stats.packages.urgent > 0 ? 'bg-accent/10' : 'bg-primary/10',
    },
    {
      title: 'Équipements à contrôler',
      value: stats.equipment.needsCheck,
      change: `${stats.equipment.inMaintenance} en maintenance`,
      icon: HardHat,
      color: stats.equipment.needsCheck > 0 ? 'text-warning' : 'text-success',
      bgColor: stats.equipment.needsCheck > 0 ? 'bg-warning/10' : 'bg-success/10',
    },
    {
      title: 'Conformité HSE',
      value: `${stats.hse.complianceRate}%`,
      change: `${stats.hse.openIncidents} incidents ouverts`,
      icon: Shield,
      color: stats.hse.complianceRate >= 95 ? 'text-success' : 'text-warning',
      bgColor: stats.hse.complianceRate >= 95 ? 'bg-success/10' : 'bg-warning/10',
    },
  ];

  const visitStatusData = [
    { label: 'En attente', count: stats.visitsToday.waiting, variant: 'warning' as const },
    { label: 'En cours', count: stats.visitsToday.inProgress, variant: 'info' as const },
    { label: 'Terminées', count: stats.visitsToday.completed, variant: 'success' as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground">
          Bonjour {currentUser?.firstName}, voici l'aperçu de votre journée
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="industrial-card hover:shadow-[var(--shadow-elevated)] transition-shadow animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {card.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Visites du jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visitStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.label} variant={item.variant} />
                  </div>
                  <span className="font-semibold text-lg">{item.count}</span>
                </div>
              ))}
            </div>
            
            {stats.visitsToday.total === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucune visite programmée aujourd'hui</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Notifications récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentNotifications.length > 0 ? (
                recentNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className={`p-1 rounded-full mt-1 ${
                      notification.type === 'urgent' ? 'bg-destructive/10' :
                      notification.type === 'warning' ? 'bg-warning/10' :
                      notification.type === 'success' ? 'bg-success/10' : 'bg-primary/10'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        notification.type === 'urgent' ? 'bg-destructive' :
                        notification.type === 'warning' ? 'bg-warning' :
                        notification.type === 'success' ? 'bg-success' : 'bg-primary'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune notification en attente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Colis & Courriers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">En attente de remise</span>
                <Badge variant={stats.packages.pending > 0 ? "destructive" : "secondary"}>
                  {stats.packages.pending}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Priorité urgente</span>
                <Badge variant={stats.packages.urgent > 0 ? "destructive" : "secondary"}>
                  {stats.packages.urgent}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Remis aujourd'hui</span>
                <Badge variant="outline">{stats.packages.delivered}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardHat className="w-5 h-5" />
              Équipements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Contrôles à venir</span>
                <Badge variant={stats.equipment.needsCheck > 0 ? "destructive" : "secondary"}>
                  {stats.equipment.needsCheck}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">En maintenance</span>
                <Badge variant="outline">{stats.equipment.inMaintenance}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              HSE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taux de conformité</span>
                <Badge variant={stats.hse.complianceRate >= 95 ? "default" : "destructive"}>
                  {stats.hse.complianceRate}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Incidents ouverts</span>
                <Badge variant={stats.hse.openIncidents > 0 ? "destructive" : "secondary"}>
                  {stats.hse.openIncidents}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}