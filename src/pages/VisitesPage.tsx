import { useMemo, useState } from 'react';
import { Calendar, Clock, Users, Search, Plus, CheckCircle, XCircle, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useVisits } from '@/hooks/useVisits';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/contexts/AppContext';
import type { Visit, VisitStatus } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { CreateVisitDialog } from '@/components/dialogs/CreateVisitDialog';
import { CheckInVisitorDialog } from '@/components/dialogs/CheckInVisitorDialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function VisitesPage() {
  const {
    visits,
    visitors,
    updateVisitStatus,
    refetchVisits,
    isLoading: visitsLoading,
    isError: visitsError
  } = useVisits();
  const { employees, isLoading: employeesLoading } = useEmployees();
  const { hasAnyRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingVisitIds, setUpdatingVisitIds] = useState<string[]>([]);

  const canManageVisits = hasAnyRole(['ADMIN', 'RECEP', 'SUPERVISEUR']);
  const isLoading = visitsLoading || employeesLoading;

  const todayVisits = useMemo(() => {
    const today = new Date().toDateString();
    return visits.filter(visit => visit.scheduledAt.toDateString() === today);
  }, [visits]);

  const filteredVisits = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return todayVisits.filter(visit => {
      const visitor = visitors.find(v => v.id === visit.visitorId);
      const host = employees.find(e => e.id === visit.hostEmployeeId);

      return (
        (visitor?.firstName.toLowerCase().includes(searchLower) ?? false) ||
        (visitor?.lastName.toLowerCase().includes(searchLower) ?? false) ||
        (visitor?.company.toLowerCase().includes(searchLower) ?? false) ||
        (host?.firstName.toLowerCase().includes(searchLower) ?? false) ||
        (host?.lastName.toLowerCase().includes(searchLower) ?? false)
      );
    });
  }, [todayVisits, visitors, employees, searchTerm]);

  const statusVariants = {
    expected: { label: 'Attendu', variant: 'info' as const, icon: Clock },
    waiting: { label: 'En attente', variant: 'warning' as const, icon: Clock },
    in_progress: { label: 'En cours', variant: 'success' as const, icon: Users },
    checked_out: { label: 'Terminé', variant: 'operational' as const, icon: CheckCircle },
  };

  const handleStatusChange = async (visit: Visit, newStatus: VisitStatus) => {
    if (updatingVisitIds.includes(visit.id)) return;

    setUpdatingVisitIds(prev => [...prev, visit.id]);
    try {
      await updateVisitStatus(visit.id, newStatus);
      toast({
        title: 'Statut mis à jour',
        description: `La visite de ${getVisitorName(visit.visitorId)} est maintenant ${statusVariants[newStatus].label.toLowerCase()}.`
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut de la visite.',
        variant: 'destructive'
      });
    } finally {
      setUpdatingVisitIds(prev => prev.filter(id => id !== visit.id));
    }
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

  const renderActions = (visit: Visit) => {
    if (!canManageVisits) return null;

    const isUpdating = updatingVisitIds.includes(visit.id);
    const loadingIcon = <Loader2 className="w-4 h-4 animate-spin" />;

    if (visit.status === 'expected') {
      return (
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          disabled={isUpdating}
          onClick={() => handleStatusChange(visit, 'waiting')}
        >
          {isUpdating ? loadingIcon : null}
          Arrivé
        </Button>
      );
    }

    if (visit.status === 'waiting') {
      const visitor = visitors.find(v => v.id === visit.visitorId);
      const host = employees.find(e => e.id === visit.hostEmployeeId);

      if (!visitor || !host) return null;

      return (
        <CheckInVisitorDialog
          visit={visit}
          visitor={visitor}
          hostEmployee={host}
          trigger={
            <Button
              size="sm"
              variant="default"
              className="gap-2"
              disabled={isUpdating}
            >
              {isUpdating ? loadingIcon : null}
              Enregistrer entrée
            </Button>
          }
          onSuccess={() => setUpdatingVisitIds(prev => prev.filter(id => id !== visit.id))}
        />
      );
    }

    if (visit.status === 'in_progress') {
      return (
        <Button
          size="sm"
          variant="destructive"
          className="gap-2"
          disabled={isUpdating}
          onClick={() => handleStatusChange(visit, 'checked_out')}
        >
          {isUpdating ? loadingIcon : null}
          Sortir
        </Button>
      );
    }

    return null;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchVisits();
      toast({ title: 'Données actualisées', description: 'Les visites ont été rechargées avec succès.' });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de rafraîchir les visites.',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

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
          <CreateVisitDialog
            onSuccess={() => {
              toast({
                title: 'Visite créée',
                description: 'La visite a été enregistrée avec succès.'
              });
            }}
            trigger={
              <Button className="gap-2 gradient-primary" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Nouvelle visite
              </Button>
            }
          />
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

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher visiteur, hôte ou société..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
          >
            {(isRefreshing || isLoading) ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Actualiser
          </Button>
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
          {visitsError && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>Impossible de charger les visites. Vérifiez la connexion au serveur.</span>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              Chargement des visites en cours...
            </div>
          )}

          <div className="space-y-3">
            {!isLoading && filteredVisits.map((visit) => {
              const statusInfo = statusVariants[visit.status];
              const StatusIcon = statusInfo.icon;
              const isUpdating = updatingVisitIds.includes(visit.id);
              const visitor = visitors.find(v => v.id === visit.visitorId);
              const host = employees.find(e => e.id === visit.hostEmployeeId);
              
              return (
                <div
                  key={visit.id}
                  className={cn(
                    'p-4 rounded-lg border border-border bg-card transition-all',
                    isUpdating ? 'opacity-70' : 'hover:bg-muted/30'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {visitor ? `${visitor.firstName} ${visitor.lastName}` : 'Visiteur inconnu'}
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          <p>Hôte: {host ? `${host.firstName} ${host.lastName}` : 'Hôte inconnu'}</p>
                          <p>Programmée: {new Date(visit.scheduledAt).toLocaleString()}</p>
                          {visit.purpose && <p>Objet: {visit.purpose}</p>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <StatusBadge 
                        status={statusInfo.label} 
                        variant={statusInfo.variant}
                      />
                      
                      {renderActions(visit)}
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

          {!isLoading && filteredVisits.length === 0 && (
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