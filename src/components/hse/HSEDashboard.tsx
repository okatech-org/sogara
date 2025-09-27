import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Users, 
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useHSE } from '@/hooks/useHSE';
import { useAuth } from '@/contexts/AppContext';
import { HSEIncident, HSETraining } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function HSEDashboard() {
  const { 
    incidents, 
    trainings, 
    loading,
    getOpenIncidents,
    getHighSeverityIncidents,
    getUpcomingTrainings,
    getComplianceRate,
    getIncidentTrends,
    getTrainingCompletionRate,
    getHSEStats
  } = useHSE();
  
  const { hasAnyRole } = useAuth();
  const [complianceRate, setComplianceRate] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [incidentTrends, setIncidentTrends] = useState<any>(null);

  const canManageHSE = hasAnyRole(['ADMIN', 'HSE']);

  // Charger les statistiques
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [compliance, completion, trends] = await Promise.all([
          getComplianceRate(),
          getTrainingCompletionRate(),
          getIncidentTrends('month')
        ]);
        
        setComplianceRate(compliance);
        setCompletionRate(completion);
        setIncidentTrends(trends);
      } catch (error) {
        console.error('Erreur chargement stats HSE:', error);
      }
    };

    loadStats();
  }, [incidents, trainings]);

  const stats = getHSEStats();
  const openIncidents = getOpenIncidents();
  const highSeverityIncidents = getHighSeverityIncidents();
  const upcomingTrainings = getUpcomingTrainings();

  // Données pour les graphiques
  const incidentsBySeverity = [
    { name: 'Faible', value: incidents.filter(i => i.severity === 'low').length, color: '#22c55e' },
    { name: 'Moyen', value: incidents.filter(i => i.severity === 'medium').length, color: '#eab308' },
    { name: 'Élevé', value: incidents.filter(i => i.severity === 'high').length, color: '#ef4444' }
  ];

  const incidentsByStatus = [
    { name: 'Signalés', value: incidents.filter(i => i.status === 'reported').length },
    { name: 'En cours', value: incidents.filter(i => i.status === 'investigating').length },
    { name: 'Résolus', value: incidents.filter(i => i.status === 'resolved').length }
  ];

  const statsCards = [
    {
      title: 'Incidents ouverts',
      value: stats.incidents.openIncidents,
      icon: AlertTriangle,
      color: 'text-red-500',
      trend: stats.incidents.thisMonth > 0 ? '+' + stats.incidents.thisMonth : '0',
      trendLabel: 'ce mois'
    },
    {
      title: 'Incidents critiques',
      value: stats.incidents.highSeverity,
      icon: XCircle,
      color: 'text-orange-500',
      trend: '',
      trendLabel: 'à traiter'
    },
    {
      title: 'Formations à venir',
      value: stats.trainings.upcomingTrainings,
      icon: Calendar,
      color: 'text-blue-500',
      trend: '',
      trendLabel: 'planifiées'
    },
    {
      title: 'Taux de conformité',
      value: `${complianceRate}%`,
      icon: Shield,
      color: 'text-green-500',
      trend: complianceRate >= 90 ? '✓' : '⚠️',
      trendLabel: 'objectif: 95%'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Chargement des données HSE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard HSE</h1>
          <p className="text-muted-foreground">
            Hygiène, Sécurité et Environnement
          </p>
        </div>
        
        {canManageHSE && (
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Générer rapport
            </Button>
            <Button className="gap-2 bg-red-600 hover:bg-red-700">
              <AlertTriangle className="w-4 h-4" />
              Signaler incident
            </Button>
          </div>
        )}
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="industrial-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.trendLabel && (
                      <p className="text-xs text-muted-foreground">
                        {stat.trend} {stat.trendLabel}
                      </p>
                    )}
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contenu principal */}
      <Tabs defaultValue="incidents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="trainings">Formations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Conformité</TabsTrigger>
        </TabsList>

        {/* Onglet Incidents */}
        <TabsContent value="incidents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incidents récents */}
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Incidents récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incidents.slice(0, 5).map((incident) => (
                    <div
                      key={incident.id}
                      className="p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                incident.severity === 'high' ? 'destructive' :
                                incident.severity === 'medium' ? 'default' :
                                'secondary'
                              }
                            >
                              {incident.type}
                            </Badge>
                            <Badge
                              variant={
                                incident.status === 'resolved' ? 'default' :
                                incident.status === 'investigating' ? 'secondary' :
                                'outline'
                              }
                            >
                              {incident.status === 'reported' ? 'Signalé' :
                               incident.status === 'investigating' ? 'En cours' :
                               'Résolu'}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-1">
                            {incident.location} • {format(incident.occurredAt, "dd/MM/yyyy 'à' HH:mm")}
                          </p>
                          
                          <p className="text-sm line-clamp-2">
                            {incident.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {incidents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucun incident signalé</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Répartition par gravité */}
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Répartition par gravité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incidentsBySeverity}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {incidentsBySeverity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex justify-center gap-4 mt-4">
                  {incidentsBySeverity.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Formations */}
        <TabsContent value="trainings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formations à venir */}
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Formations à venir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTrainings.slice(0, 5).map((training) => (
                    <div
                      key={training.id}
                      className="p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{training.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {training.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Durée: {training.duration}min</span>
                            <span>Validité: {training.validityMonths} mois</span>
                            <span>Sessions: {training.sessions.length}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {training.requiredForRoles.map(role => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {upcomingTrainings.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucune formation programmée</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Taux de complétion */}
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Taux de complétion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Formations complétées</span>
                    <span className="text-2xl font-bold">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Conformité réglementaire</span>
                    <span className="text-2xl font-bold">{complianceRate}%</span>
                  </div>
                  <Progress value={complianceRate} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Objectif: 95% minimum
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.trainings.completedSessions}</p>
                    <p className="text-xs text-muted-foreground">Sessions complétées</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.trainings.totalSessions}</p>
                    <p className="text-xs text-muted-foreground">Sessions totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendances des incidents */}
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Tendances des incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={incidentTrends?.datasets[0]?.data?.map((value: number, index: number) => ({
                      date: incidentTrends.labels[index],
                      incidents: value
                    })) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="incidents" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Répartition par statut */}
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Statut des incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incidentsByStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Conformité */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Indicateurs de conformité */}
            <Card className="industrial-card lg:col-span-2">
              <CardHeader>
                <CardTitle>Indicateurs de conformité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Sécurité</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Incidents résolus</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Temps de résolution</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Formation</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Employés formés</span>
                        <span className="text-sm font-medium">{complianceRate}%</span>
                      </div>
                      <Progress value={complianceRate} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Certifications à jour</span>
                        <span className="text-sm font-medium">88%</span>
                      </div>
                      <Progress value={88} className="h-2" />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">Score global HSE</span>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-green-600">89%</span>
                      <Badge variant="default" className="bg-green-600">
                        Bon
                      </Badge>
                    </div>
                  </div>
                  <Progress value={89} className="h-3 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Objectif réglementaire: 95%
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canManageHSE && (
                  <>
                    <Button className="w-full justify-start gap-2 bg-red-600 hover:bg-red-700">
                      <AlertTriangle className="w-4 h-4" />
                      Signaler incident urgent
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Calendar className="w-4 h-4" />
                      Programmer formation
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <FileText className="w-4 h-4" />
                      Générer rapport mensuel
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Audit de conformité
                    </Button>
                  </>
                )}
                
                <div className="pt-3 border-t space-y-2">
                  <h4 className="text-sm font-medium">Alertes</h4>
                  
                  {highSeverityIncidents.length > 0 && (
                    <div className="p-2 bg-red-50 dark:bg-red-950 rounded border border-red-200">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {highSeverityIncidents.length} incident(s) critique(s) à traiter
                      </p>
                    </div>
                  )}
                  
                  {complianceRate < 90 && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded border border-yellow-200">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Taux de conformité en dessous du seuil
                      </p>
                    </div>
                  )}
                  
                  {upcomingTrainings.length > 0 && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {upcomingTrainings.length} formation(s) cette semaine
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
