import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Shield, 
  Package, 
  HardHat,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  RefreshCw,
  Download,
  Eye,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AppContext';
import { useEmployees } from '@/hooks/useEmployees';
import { useIncidents } from '@/hooks/useHSE';
import { useVisits } from '@/hooks/useVisits';
import { usePackages } from '@/hooks/usePackages';
import { useEquipment } from '@/hooks/useEquipment';

interface DirectionOverview {
  summary: {
    totalEmployees: number;
    activeIncidents: number;
    monthlyVisits: number;
    equipmentOperational: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'incident' | 'visit' | 'training' | 'maintenance';
    title: string;
    description: string;
    timestamp: Date;
    status: 'completed' | 'pending' | 'urgent';
  }>;
  alerts: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    actionRequired: boolean;
    dueDate?: Date;
  }>;
  kpis: {
    operationalEfficiency: number;
    hseCompliance: number;
    workforceProductivity: number;
    costOptimization: number;
  };
}

export function DirectionPage() {
  const { currentUser } = useAuth();
  const { employees } = useEmployees();
  const { incidents } = useIncidents();
  const { visits } = useVisits();
  const { packages } = usePackages();
  const { equipment } = useEquipment();
  
  const [overview, setOverview] = useState<DirectionOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Génération des données de vue d'ensemble
  const generateOverview = (): DirectionOverview => {
    const now = new Date();
    const activeIncidents = incidents.filter(i => i.status === 'open').length;
    const monthlyVisits = visits.filter(v => {
      const visitDate = new Date(v.checkIn);
      return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
    }).length;
    const operationalEquipment = equipment.filter(e => e.status === 'operational').length;

    return {
      summary: {
        totalEmployees: employees.length,
        activeIncidents,
        monthlyVisits,
        equipmentOperational: operationalEquipment
      },
      recentActivity: [
        {
          id: '1',
          type: 'incident',
          title: 'Incident HSE signalé',
          description: 'Incident mineur dans l\'atelier de maintenance',
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2h ago
          status: 'pending'
        },
        {
          id: '2',
          type: 'visit',
          title: 'Visite client importante',
          description: 'Visite de l\'équipe Qualité de TOTAL',
          timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4h ago
          status: 'completed'
        },
        {
          id: '3',
          type: 'training',
          title: 'Formation HSE programmée',
          description: 'Formation sécurité pour 15 employés',
          timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
          status: 'pending'
        },
        {
          id: '4',
          type: 'maintenance',
          title: 'Maintenance préventive',
          description: 'Maintenance programmée sur équipement critique',
          timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
          status: 'urgent'
        }
      ],
      alerts: [
        {
          id: '1',
          severity: 'high',
          title: 'Formations HSE en retard',
          description: '8 employés ont des formations HSE expirées',
          actionRequired: true,
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
        },
        {
          id: '2',
          severity: 'medium',
          title: 'Audit qualité prévu',
          description: 'Audit ISO 9001 programmé pour le 15 novembre',
          actionRequired: true,
          dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days
        },
        {
          id: '3',
          severity: 'low',
          title: 'Rapport mensuel disponible',
          description: 'Rapport de performance octobre 2024 prêt',
          actionRequired: false
        }
      ],
      kpis: {
        operationalEfficiency: 87.5,
        hseCompliance: 92.3,
        workforceProductivity: 89.1,
        costOptimization: 84.7
      }
    };
  };

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulation d'un délai d'API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const data = generateOverview();
        setOverview(data);
      } catch (err) {
        setError('Erreur lors du chargement des données de direction');
        console.error('Direction overview loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [employees.length, incidents.length, visits.length, equipment.length]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = generateOverview();
      setOverview(data);
    } catch (err) {
      setError('Erreur lors du rafraîchissement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Rapport de direction exporté avec succès');
    } catch (err) {
      alert('Erreur lors de l\'export du rapport');
    } finally {
      setLoading(false);
    }
  };

  const handleViewActivity = (activityId: string) => {
    console.log('Voir activité:', activityId);
    alert(`Ouverture des détails de l'activité ${activityId}`);
  };

  const handleAlertAction = (alertId: string) => {
    console.log('Action pour alerte:', alertId);
    alert(`Ouverture des actions pour l'alerte ${alertId}`);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'incident': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'visit': return <Users className="w-4 h-4 text-blue-600" />;
      case 'training': return <Shield className="w-4 h-4 text-green-600" />;
      case 'maintenance': return <HardHat className="w-4 h-4 text-orange-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="outline" className="text-green-600">Terminé</Badge>;
      case 'pending': return <Badge variant="outline" className="text-yellow-600">En attente</Badge>;
      case 'urgent': return <Badge variant="outline" className="text-red-600">Urgent</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getAlertSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Critique</Badge>;
      case 'high': return <Badge variant="destructive" className="bg-red-600">Élevé</Badge>;
      case 'medium': return <Badge variant="outline" className="text-orange-600">Moyen</Badge>;
      case 'low': return <Badge variant="outline" className="text-blue-600">Faible</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Chargement des données de direction...</span>
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
              🏢 Direction Générale - Vue d'Ensemble
            </h1>
            <p className="text-muted-foreground text-lg">
              {currentUser?.firstName} {currentUser?.lastName} - {currentUser?.matricule}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Tableau de bord consolidé - {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleRefresh} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button onClick={handleExportReport} variant="outline" disabled={loading}>
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(overview.kpis).map(([key, value]) => (
          <Card key={key} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {key === 'operationalEfficiency' && 'Efficacité Opérationnelle'}
                {key === 'hseCompliance' && 'Conformité HSE'}
                {key === 'workforceProductivity' && 'Productivité RH'}
                {key === 'costOptimization' && 'Optimisation Coûts'}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{value}%</div>
              <div className="flex items-center gap-2 text-xs">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-green-600">+2.3% vs mois dernier</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'Ensemble</TabsTrigger>
          <TabsTrigger value="activity">Activité Récente</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="summary">Résumé</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.summary.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">Employés actifs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Incidents Actifs</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.summary.activeIncidents}</div>
                <p className="text-xs text-muted-foreground">Incidents ouverts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visites ce Mois</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.summary.monthlyVisits}</div>
                <p className="text-xs text-muted-foreground">Visites enregistrées</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Équipements Opérationnels</CardTitle>
                <HardHat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.summary.equipmentOperational}</div>
                <p className="text-xs text-muted-foreground">Sur {equipment.length} total</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {overview.recentActivity.map((activity) => (
              <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold">{activity.title}</h3>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleString('fr-FR')}
                        </span>
                        {getActivityStatusBadge(activity.status)}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewActivity(activity.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {overview.alerts.map((alert) => (
              <Card key={alert.id} className={`hover:shadow-lg transition-shadow ${
                alert.severity === 'critical' ? 'border-red-200 bg-red-50/30' :
                alert.severity === 'high' ? 'border-orange-200 bg-orange-50/30' :
                'border-blue-200 bg-blue-50/30'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className={`w-5 h-5 ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'high' ? 'text-orange-600' :
                        'text-blue-600'
                      }`} />
                      <div>
                        <h3 className="font-semibold">{alert.title}</h3>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          {getAlertSeverityBadge(alert.severity)}
                          {alert.dueDate && (
                            <span className="text-xs text-muted-foreground">
                              Échéance: {alert.dueDate.toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.actionRequired && (
                        <Button variant="outline" size="sm" onClick={() => handleAlertAction(alert.id)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Action
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleViewActivity(alert.id)}>
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

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Points Positifs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Conformité HSE en amélioration constante</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Réduction des incidents critiques</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Productivité équipe en hausse</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Points d'Attention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Formations HSE à planifier</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Audit qualité prévu ce mois</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Renouvellement équipements</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
