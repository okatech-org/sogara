import { useState } from 'react';
import { Shield, AlertTriangle, BookOpen, CheckSquare, Plus, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AppContext';
import { StatusBadge } from '@/components/ui/status-badge';

export function HSEPage() {
  const { hasAnyRole } = useAuth();

  const canManageHSE = hasAnyRole(['ADMIN', 'HSE', 'SUPERVISEUR']);

  const stats = {
    incidents: {
      open: 2,
      resolved: 15,
      thisMonth: 3,
    },
    trainings: {
      scheduled: 5,
      completed: 28,
      compliance: 95,
    },
    checklists: {
      pending: 8,
      completed: 45,
      overdue: 1,
    },
  };

  const mockIncidents = [
    {
      id: '1',
      type: 'Chute de plain-pied',
      severity: 'medium' as const,
      location: 'Zone production',
      date: new Date('2024-01-15'),
      status: 'investigating' as const,
      employee: 'Ahmed Diallo',
    },
    {
      id: '2',
      type: 'EPI manquant',
      severity: 'low' as const,
      location: 'Entrée site',
      date: new Date('2024-01-14'),
      status: 'resolved' as const,
      employee: 'Fatou Kane',
    },
  ];

  const mockTrainings = [
    {
      id: '1',
      title: 'Port des EPI',
      date: new Date('2024-01-25'),
      instructor: 'Dr. Sow',
      participants: 12,
      maxParticipants: 15,
      status: 'scheduled' as const,
    },
    {
      id: '2',
      title: 'Sécurité incendie',
      date: new Date('2024-01-20'),
      instructor: 'M. Diop',
      participants: 20,
      maxParticipants: 20,
      status: 'completed' as const,
    },
  ];

  const severityVariants = {
    low: { label: 'Faible', variant: 'info' as const },
    medium: { label: 'Moyen', variant: 'warning' as const },
    high: { label: 'Élevé', variant: 'urgent' as const },
  };

  const incidentStatusVariants = {
    reported: { label: 'Signalé', variant: 'info' as const },
    investigating: { label: 'En cours', variant: 'warning' as const },
    resolved: { label: 'Résolu', variant: 'success' as const },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HSE</h1>
          <p className="text-muted-foreground">
            Hygiène, Sécurité et Environnement
          </p>
        </div>
        {canManageHSE && (
          <Button className="gap-2 gradient-primary">
            <Plus className="w-4 h-4" />
            Nouvel incident
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents ouverts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.incidents.open}</div>
            <p className="text-xs text-muted-foreground">
              {stats.incidents.thisMonth} ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formations HSE</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trainings.scheduled}</div>
            <p className="text-xs text-muted-foreground">
              Programmées ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformité</CardTitle>
            <Shield className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trainings.compliance}%</div>
            <p className="text-xs text-muted-foreground">
              Taux de conformité
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="incidents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="formations">Formations</TabsTrigger>
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Incidents récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockIncidents.map((incident) => (
                  <div key={incident.id} className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground">{incident.type}</h3>
                      <div className="flex items-center gap-2">
                        <StatusBadge 
                          status={severityVariants[incident.severity].label}
                          variant={severityVariants[incident.severity].variant}
                        />
                        <StatusBadge 
                          status={incidentStatusVariants[incident.status].label}
                          variant={incidentStatusVariants[incident.status].variant}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Employé: {incident.employee}</p>
                      <p>Lieu: {incident.location}</p>
                      <p>Date: {incident.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formations" className="space-y-4">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Sessions de formation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTrainings.map((training) => (
                  <div key={training.id} className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground">{training.title}</h3>
                      <StatusBadge 
                        status={training.status === 'scheduled' ? 'Programmé' : 'Terminé'}
                        variant={training.status === 'scheduled' ? 'info' : 'success'}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Date: {training.date.toLocaleDateString()}</p>
                      <p>Formateur: {training.instructor}</p>
                      <p>Participants: {training.participants}/{training.maxParticipants}</p>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Inscription</span>
                        <span>{training.participants}/{training.maxParticipants}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${(training.participants / training.maxParticipants) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklists" className="space-y-4">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Checklists de sécurité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-dashed">
                  <CardContent className="text-center p-6">
                    <CheckSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="font-medium mb-2">En attente</h3>
                    <p className="text-2xl font-bold text-warning">{stats.checklists.pending}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-dashed">
                  <CardContent className="text-center p-6">
                    <CheckSquare className="w-12 h-12 mx-auto mb-3 text-success" />
                    <h3 className="font-medium mb-2">Complétées</h3>
                    <p className="text-2xl font-bold text-success">{stats.checklists.completed}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-dashed">
                  <CardContent className="text-center p-6">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-destructive" />
                    <h3 className="font-medium mb-2">En retard</h3>
                    <p className="text-2xl font-bold text-destructive">{stats.checklists.overdue}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}