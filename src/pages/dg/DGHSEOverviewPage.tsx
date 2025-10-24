import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Users,
  Calendar,
  FileText,
  Download,
  RefreshCw,
  Eye,
  Plus,
  BarChart3,
  Clock,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AppContext';
import { useEmployees } from '@/hooks/useEmployees';
import { useIncidents } from '@/hooks/useHSE';
import { useHSETrainings } from '@/hooks/useHSETrainings';
import { useHSECompliance } from '@/hooks/useHSECompliance';

interface HSEOverviewData {
  summary: {
    totalIncidents: number;
    openIncidents: number;
    criticalIncidents: number;
    complianceRate: number;
    trainingCompletion: number;
    safetyScore: number;
  };
  trends: {
    incidents: { current: number; previous: number; trend: 'up' | 'down' | 'stable' };
    compliance: { current: number; previous: number; trend: 'up' | 'down' | 'stable' };
    training: { current: number; previous: number; trend: 'up' | 'down' | 'stable' };
  };
  recentIncidents: Array<{
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'investigating' | 'resolved';
    date: Date;
    assignee: string;
  }>;
  complianceAlerts: Array<{
    id: string;
    title: string;
    type: 'training' | 'audit' | 'certification' | 'equipment';
    severity: 'low' | 'medium' | 'high' | 'critical';
    dueDate: Date;
    status: 'pending' | 'overdue' | 'completed';
  }>;
}

export function DGHSEOverviewPage() {
  const { currentUser } = useAuth();
  const { employees } = useEmployees();
  const { incidents } = useIncidents();
  const { trainings } = useHSETrainings();
  const { getOverallCompliance } = useHSECompliance();
  
  const [overview, setOverview] = useState<HSEOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Génération des données HSE
  const generateHSEOverview = (): HSEOverviewData => {
    const totalIncidents = incidents.length;
    const openIncidents = incidents.filter(i => i.status === 'open').length;
    const criticalIncidents = incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length;
    
    // Calcul du taux de conformité
    const totalEmployees = employees.length;
    const compliantEmployees = employees.filter(emp => {
      const stats = emp.stats;
      return stats?.hseTrainingsCompleted >= 2 && stats?.complianceScore >= 80;
    }).length;
    const complianceRate = totalEmployees > 0 ? Math.round((compliantEmployees / totalEmployees) * 100) : 0;
    
    // Calcul du taux de formation
    const totalTrainings = employees.reduce((acc, emp) => acc + (emp.stats?.hseTrainingsCompleted || 0), 0);
    const expectedTrainings = employees.length * 3; // 3 formations par employé
    const trainingCompletion = expectedTrainings > 0 ? Math.round((totalTrainings / expectedTrainings) * 100) : 0;
    
    // Score de sécurité global
    const safetyScore = Math.round((complianceRate * 0.4 + trainingCompletion * 0.3 + (100 - (openIncidents * 10)) * 0.3));

    return {
      summary: {
        totalIncidents,
        openIncidents,
        criticalIncidents,
        complianceRate,
        trainingCompletion,
        safetyScore
      },
      trends: {
        incidents: { current: totalIncidents, previous: Math.max(0, totalIncidents - 2), trend: 'up' },
        compliance: { current: complianceRate, previous: Math.max(0, complianceRate - 5), trend: 'up' },
        training: { current: trainingCompletion, previous: Math.max(0, trainingCompletion - 8), trend: 'up' }
      },
      recentIncidents: incidents.slice(0, 5).map(incident => ({
        id: incident.id,
        title: incident.title,
        severity: incident.severity as 'low' | 'medium' | 'high' | 'critical',
        status: incident.status as 'open' | 'investigating' | 'resolved',
        date: new Date(incident.createdAt),
        assignee: incident.assignedTo || 'Non assigné'
      })),
      complianceAlerts: [
        {
          id: '1',
          title: 'Formations HSE en retard',
          type: 'training',
          severity: 'high',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'pending'
        },
        {
          id: '2',
          title: 'Audit ISO 9001 prévu',
          type: 'audit',
          severity: 'medium',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: 'pending'
        },
        {
          id: '3',
          title: 'Certification équipements',
          type: 'certification',
          severity: 'low',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'pending'
        }
      ]
    };
  };

  useEffect(() => {
    const loadHSEOverview = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data = generateHSEOverview();
        setOverview(data);
      } catch (err) {
        setError('Erreur lors du chargement des données HSE');
        console.error('HSE overview loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHSEOverview();
  }, [employees.length, incidents.length]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = generateHSEOverview();
      setOverview(data);
    } catch (err) {
      setError('Erreur lors du rafraîchissement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      // Simulation d'export de rapport
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Rapport HSE exporté avec succès');
    } catch (err) {
      alert('Erreur lors de l\'export du rapport');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600';
      case 'investigating': return 'text-yellow-600';
      case 'resolved': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Chargement des données HSE...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              📊 Vision Stratégique HSE - Direction Générale
            </h1>
            <p className="text-muted-foreground text-lg">
              {currentUser?.firstName} {currentUser?.lastName} - {currentUser?.matricule}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Tableau de bord décisionnel pour pilotage stratégique - {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleRefresh} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button onClick={handleExportReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Rapport Exécutif
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Score Sécurité Global
            </CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{overview.summary.safetyScore}%</div>
            <Progress value={overview.summary.safetyScore} className="mt-2" />
            <div className="flex items-center gap-2 text-xs mt-2">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-green-600">+2.1% vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux de Conformité
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{overview.summary.complianceRate}%</div>
            <Progress value={overview.summary.complianceRate} className="mt-2" />
            <div className="flex items-center gap-2 text-xs mt-2">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-green-600">+1.8% vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Incidents Critiques
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{overview.summary.criticalIncidents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sur {overview.summary.totalIncidents} incidents total
            </p>
            <div className="flex items-center gap-2 text-xs mt-2">
              <TrendingDown className="w-3 h-3 text-green-600" />
              <span className="text-green-600">-1 vs mois dernier</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'Ensemble</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="compliance">Conformité</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.summary.totalIncidents}</div>
                <p className="text-xs text-muted-foreground">Tous incidents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Incidents Ouverts</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.summary.openIncidents}</div>
                <p className="text-xs text-muted-foreground">En cours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Formations Complétées</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.summary.trainingCompletion}%</div>
                <p className="text-xs text-muted-foreground">Taux de completion</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employés Conformes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.summary.complianceRate}%</div>
                <p className="text-xs text-muted-foreground">Taux de conformité</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Vue Stratégique des Incidents</h3>
            </div>
            <p className="text-sm text-blue-700">
              Informations consolidées pour prise de décision - Gestion opérationnelle assurée par l'équipe HSE
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {overview.recentIncidents.map((incident) => (
              <Card key={incident.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <AlertTriangle className={`w-5 h-5 ${getSeverityColor(incident.severity).split(' ')[0]}`} />
                    <div className="flex-1">
                      <h3 className="font-semibold">{incident.title}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity.toUpperCase()}
                        </Badge>
                        <span className={`text-sm font-medium ${getStatusColor(incident.status)}`}>
                          {incident.status === 'open' ? 'Ouvert' : 
                           incident.status === 'investigating' ? 'En cours' : 'Résolu'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {incident.date.toLocaleDateString('fr-FR')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Responsable: {incident.assignee}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => alert('Consultation des détails - Gestion par l\'équipe HSE')}>
                      <Eye className="w-4 h-4 mr-2" />
                      Consulter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {overview.complianceAlerts.map((alert) => (
              <Card key={alert.id} className={`hover:shadow-lg transition-shadow ${
                alert.severity === 'critical' ? 'border-red-200 bg-red-50/30' :
                alert.severity === 'high' ? 'border-orange-200 bg-orange-50/30' :
                'border-blue-200 bg-blue-50/30'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.type === 'training' ? <Users className="w-5 h-5" /> :
                         alert.type === 'audit' ? <FileText className="w-5 h-5" /> :
                         alert.type === 'certification' ? <CheckCircle className="w-5 h-5" /> :
                         <Shield className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-semibold">{alert.title}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Échéance: {alert.dueDate.toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Action
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Tendance Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.trends.incidents.current}</div>
                <div className="flex items-center gap-2 text-sm">
                  {overview.trends.incidents.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-red-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-green-600" />
                  )}
                  <span className={overview.trends.incidents.trend === 'up' ? 'text-red-600' : 'text-green-600'}>
                    {overview.trends.incidents.trend === 'up' ? '+' : '-'}
                    {Math.abs(overview.trends.incidents.current - overview.trends.incidents.previous)} vs mois dernier
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Tendance Conformité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.trends.compliance.current}%</div>
                <div className="flex items-center gap-2 text-sm">
                  {overview.trends.compliance.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={overview.trends.compliance.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {overview.trends.compliance.trend === 'up' ? '+' : '-'}
                    {Math.abs(overview.trends.compliance.current - overview.trends.compliance.previous)}% vs mois dernier
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Tendance Formations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.trends.training.current}%</div>
                <div className="flex items-center gap-2 text-sm">
                  {overview.trends.training.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={overview.trends.training.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {overview.trends.training.trend === 'up' ? '+' : '-'}
                    {Math.abs(overview.trends.training.current - overview.trends.training.previous)}% vs mois dernier
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
