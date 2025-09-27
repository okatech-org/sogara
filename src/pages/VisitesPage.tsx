import { useState } from 'react';
import { Calendar, Clock, Users, Search, Plus, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useVisits } from '@/hooks/useVisits';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/contexts/AppContext';
import { Visit, VisitStatus } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';

export function VisitesPage() {
  const { visits, visitors, updateVisitStatus } = useVisits();
  const { employees } = useEmployees();
  const { hasAnyRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const canManageVisits = hasAnyRole(['ADMIN', 'RECEP', 'SUPERVISEUR']);

  const todayVisits = visits.filter(visit => {
    const visitDate = new Date(visit.scheduledAt).toDateString();
    const today = new Date().toDateString();
    return visitDate === today;
  });

  const filteredVisits = todayVisits.filter(visit => {
    const visitor = visitors.find(v => v.id === visit.visitorId);
    const host = employees.find(e => e.id === visit.hostEmployeeId);
    
    const searchLower = searchTerm.toLowerCase();
    return (
      visitor?.firstName.toLowerCase().includes(searchLower) ||
      visitor?.lastName.toLowerCase().includes(searchLower) ||
      visitor?.company.toLowerCase().includes(searchLower) ||
      host?.firstName.toLowerCase().includes(searchLower) ||
      host?.lastName.toLowerCase().includes(searchLower)
    );
  });

  const statusVariants = {
    expected: { label: 'Attendu', variant: 'info' as const, icon: Clock },
    waiting: { label: 'En attente', variant: 'warning' as const, icon: Clock },
    in_progress: { label: 'En cours', variant: 'success' as const, icon: Users },
    checked_out: { label: 'Terminé', variant: 'operational' as const, icon: CheckCircle },
  };

  const handleStatusChange = (visitId: string, newStatus: VisitStatus) => {
    updateVisitStatus(visitId, newStatus);
  };

  const getVisitorName = (visitorId: string) => {
    const visitor = visitors.find(v => v.id === visitorId);
    return visitor ? `${visitor.firstName} ${visitor.lastName}` : 'Visiteur inconnu';
  };

  const getHostName = (hostId: string) => {
    const host = employees.find(e => e.id === hostId);
    return host ? `${host.firstName} ${host.lastName}` : 'Hôte inconnu';
  };

  const statsCards = [
    {
      title: 'Visites attendues',
      value: todayVisits.filter(v => v.status === 'expected').length,
      icon: Clock,
      color: 'text-primary',
    },
    {
      title: 'En attente',
      value: todayVisits.filter(v => v.status === 'waiting').length,
      icon: Users,
      color: 'text-warning',
    },
    {
      title: 'En cours',
      value: todayVisits.filter(v => v.status === 'in_progress').length,
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      title: 'Terminées',
      value: todayVisits.filter(v => v.status === 'checked_out').length,
      icon: XCircle,
      color: 'text-muted-foreground',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visites</h1>
          <p className="text-muted-foreground">
            Gestion des visiteurs et de leurs accès
          </p>
        </div>
        {canManageVisits && (
          <Button className="gap-2 gradient-primary">
            <Plus className="w-4 h-4" />
            Nouvelle visite
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="industrial-card">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="p-2 bg-muted/30 rounded-lg">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher visiteur, hôte ou société..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Visites du jour ({filteredVisits.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredVisits.map((visit) => {
              const statusInfo = statusVariants[visit.status];
              const StatusIcon = statusInfo.icon;
              
              return (
                <div
                  key={visit.id}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {getVisitorName(visit.visitorId)}
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          <p>Hôte: {getHostName(visit.hostEmployeeId)}</p>
                          <p>Programmé: {new Date(visit.scheduledAt).toLocaleString()}</p>
                          {visit.purpose && <p>Objet: {visit.purpose}</p>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <StatusBadge 
                        status={statusInfo.label} 
                        variant={statusInfo.variant}
                      />
                      
                      {canManageVisits && (
                        <div className="flex gap-2">
                          {visit.status === 'expected' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusChange(visit.id, 'waiting')}
                            >
                              Arrivé
                            </Button>
                          )}
                          {visit.status === 'waiting' && (
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleStatusChange(visit.id, 'in_progress')}
                            >
                              Entrer
                            </Button>
                          )}
                          {visit.status === 'in_progress' && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleStatusChange(visit.id, 'checked_out')}
                            >
                              Sortir
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {visit.checkedInAt && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      Entrée: {new Date(visit.checkedInAt).toLocaleTimeString()}
                      {visit.checkedOutAt && (
                        <span> • Sortie: {new Date(visit.checkedOutAt).toLocaleTimeString()}</span>
                      )}
                    </div>
                  )}

                  {visit.badgeNumber && (
                    <div className="mt-2">
                      <Badge variant="outline">Badge: {visit.badgeNumber}</Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredVisits.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune visite trouvée pour aujourd'hui</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}