import { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Users,
  AlertTriangle,
  Award,
  Download,
  Filter,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HSEIncident, HSETraining, Employee } from '@/types';

interface HSEAnalyticsDashboardProps {
  incidents: HSEIncident[];
  trainings: HSETraining[];
  employees: Employee[];
}

export function HSEAnalyticsDashboard({ incidents, trainings, employees }: HSEAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('last-12-months');
  const [analysisType, setAnalysisType] = useState('overview');

  // Calculer les métriques
  const analytics = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    // Incidents par sévérité
    const incidentsBySeverity = {
      low: incidents.filter(i => i.severity === 'low').length,
      medium: incidents.filter(i => i.severity === 'medium').length,
      high: incidents.filter(i => i.severity === 'high').length
    };

    // Incidents par mois (12 derniers mois)
    const incidentsByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIncidents = incidents.filter(incident => {
        const incidentDate = incident.occurredAt;
        return incidentDate.getMonth() === monthDate.getMonth() && 
               incidentDate.getFullYear() === monthDate.getFullYear();
      });
      incidentsByMonth.push({
        month: monthDate.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        count: monthIncidents.length
      });
    }

    // Formations par statut (robuste si `sessions` absent)
    const trainingsByStatus = trainings.reduce((acc, training: any) => {
      const sessions = Array.isArray(training?.sessions) ? training.sessions : [];
      sessions.forEach((session: any) => {
        const status = session?.status || 'scheduled';
        acc[status] = (acc[status] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Conformité par service
    const complianceByService = employees.reduce((acc, emp) => {
      const service = emp.service;
      if (!acc[service]) {
        acc[service] = { total: 0, compliant: 0 };
      }
      acc[service].total++;
      // Simuler conformité (dans la vraie app, calculer basé sur formations)
      if (Math.random() > 0.2) {
        acc[service].compliant++;
      }
      return acc;
    }, {} as Record<string, { total: number; compliant: number }>);

    // Tendances
    const currentMonthIncidents = incidents.filter(i => i.occurredAt >= lastMonth).length;
    const previousMonthIncidents = incidents.filter(i => 
      i.occurredAt >= new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()) &&
      i.occurredAt < lastMonth
    ).length;
    
    const incidentTrend = currentMonthIncidents - previousMonthIncidents;

    return {
      incidentsBySeverity,
      incidentsByMonth,
      trainingsByStatus,
      complianceByService,
      incidentTrend,
      totalIncidents: incidents.length,
      totalTrainingSessions: Object.values(trainingsByStatus).reduce((a, b) => a + b, 0)
    };
  }, [incidents, trainings, employees, timeRange]);

  const exportAnalytics = () => {
    // Simuler l'export des analytics
    console.log('Export analytics...');
    alert('Export des analyses HSE en cours de développement');
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <Card className="industrial-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Analyses et Rapports HSE</h2>
              <p className="text-muted-foreground">
                Tableaux de bord analytiques et indicateurs de performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-month">Dernier mois</SelectItem>
                  <SelectItem value="last-3-months">3 derniers mois</SelectItem>
                  <SelectItem value="last-6-months">6 derniers mois</SelectItem>
                  <SelectItem value="last-12-months">12 derniers mois</SelectItem>
                  <SelectItem value="current-year">Année en cours</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportAnalytics} className="gap-2">
                <Download className="w-4 h-4" />
                Exporter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents Total</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalIncidents}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {analytics.incidentTrend >= 0 ? (
                <TrendingUp className="w-3 h-3 text-red-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-green-500" />
              )}
              <span className={analytics.incidentTrend >= 0 ? 'text-red-500' : 'text-green-500'}>
                {Math.abs(analytics.incidentTrend)} ce mois
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Formation</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTrainingSessions}</div>
            <p className="text-xs text-muted-foreground">
              Toutes sessions confondues
            </p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employés Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              Personnel suivi
            </p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformité Moyenne</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                Object.values(analytics.complianceByService)
                  .reduce((sum, service) => sum + (service.compliant / service.total), 0) /
                Math.max(Object.keys(analytics.complianceByService).length, 1) * 100
              )}%
            </div>
            <p className="text-xs text-muted-foreground">
              Tous services
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents par sévérité */}
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Incidents par Sévérité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Faible</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{analytics.incidentsBySeverity.low}</span>
                  <Badge variant="outline">
                    {Math.round((analytics.incidentsBySeverity.low / Math.max(analytics.totalIncidents, 1)) * 100)}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Moyen</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{analytics.incidentsBySeverity.medium}</span>
                  <Badge variant="outline">
                    {Math.round((analytics.incidentsBySeverity.medium / Math.max(analytics.totalIncidents, 1)) * 100)}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Élevé</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{analytics.incidentsBySeverity.high}</span>
                  <Badge variant="outline">
                    {Math.round((analytics.incidentsBySeverity.high / Math.max(analytics.totalIncidents, 1)) * 100)}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conformité par service */}
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Conformité par Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.complianceByService).map(([service, data]) => {
                const rate = Math.round((data.compliant / data.total) * 100);
                return (
                  <div key={service}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{service}</span>
                      <span className="text-sm text-muted-foreground">
                        {data.compliant}/{data.total} ({rate}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          rate >= 90 ? 'bg-green-500' : 
                          rate >= 70 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Évolution des incidents */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Évolution des Incidents (12 derniers mois)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2 border-b border-l pl-4 pb-4">
            {analytics.incidentsByMonth.map((month, index) => {
              const maxHeight = Math.max(...analytics.incidentsByMonth.map(m => m.count), 1);
              const height = (month.count / maxHeight) * 200;
              
              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="text-xs font-medium">{month.count}</div>
                  <div 
                    className="bg-blue-500 rounded-t min-h-[4px] w-8"
                    style={{ height: `${height}px` }}
                  />
                  <div className="text-xs text-muted-foreground rotate-45 origin-bottom-left">
                    {month.month}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Nombre d'incidents déclarés par mois
          </div>
        </CardContent>
      </Card>

      {/* Rapports disponibles */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle>Rapports Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Rapport Mensuel HSE',
                description: 'Synthèse complète du mois',
                type: 'monthly',
                icon: <Calendar className="w-5 h-5" />
              },
              {
                title: 'Analyse des Incidents',
                description: 'Tendances et causes principales',
                type: 'incidents',
                icon: <AlertTriangle className="w-5 h-5" />
              },
              {
                title: 'Suivi des Formations',
                description: 'Progression et certifications',
                type: 'trainings',
                icon: <Award className="w-5 h-5" />
              },
              {
                title: 'Conformité Réglementaire',
                description: 'État de conformité global',
                type: 'compliance',
                icon: <BarChart3 className="w-5 h-5" />
              }
            ].map((report) => (
              <Card key={report.type} className="border hover:bg-muted/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {report.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{report.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download className="w-4 h-4" />
                          PDF
                        </Button>
                        <Button size="sm" variant="ghost" className="gap-2">
                          <Filter className="w-4 h-4" />
                          Personnaliser
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Indicateurs de performance */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle>Indicateurs de Performance HSE</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {Math.max(0, 365 - analytics.totalIncidents * 10)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Jours sans accident grave
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {analytics.totalTrainingSessions}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Sessions de formation réalisées
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(
                  Object.values(analytics.complianceByService)
                    .reduce((sum, service) => sum + (service.compliant / service.total), 0) /
                  Math.max(Object.keys(analytics.complianceByService).length, 1) * 100
                )}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Taux de conformité global
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Tableaux de Bord Personnalisés</h3>
              <p className="text-sm text-blue-700">
                Créez des rapports sur mesure selon vos besoins d'analyse
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Créer rapport
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
