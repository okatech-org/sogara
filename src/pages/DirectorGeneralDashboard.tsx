import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Users, 
  Shield, 
  Package, 
  HardHat,
  Download,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AppContext';
import { useEmployees } from '@/hooks/useEmployees';
import { useIncidents } from '@/hooks/useHSE';
import { useVisits } from '@/hooks/useVisits';
import { usePackages } from '@/hooks/usePackages';
import { useEquipment } from '@/hooks/useEquipment';
import { QuickActionsDG } from '@/components/dg/QuickActionsDG';
import { StrategicKPIs } from '@/components/dg/StrategicKPIs';

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

interface CriticalAlert {
  id: string;
  title: string;
  description: string;
  category: 'audit' | 'training' | 'incident' | 'compliance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  dueDate: Date;
  actionRequired: boolean;
  action?: { label: string; route: string };
}

export function DirectorGeneralDashboard() {
  const { currentUser } = useAuth();
  const { employees } = useEmployees();
  const { incidents } = useIncidents();
  const { visits } = useVisits();
  const { packages } = usePackages();
  const { equipment } = useEquipment();
  const [activeTab, setActiveTab] = useState('overview');

  // Calcul des KPIs stratégiques
  const strategicKPIs: StrategicKPI[] = useMemo(() => {
    const totalEmployees = employees.length;
    const activeIncidents = incidents.filter(i => i.status === 'open').length;
    const highSeverityIncidents = incidents.filter(i => i.severity === 'high' || i.severity === 'critical').length;
    const completedTrainings = employees.reduce((acc, emp) => acc + (emp.stats?.hseTrainingsCompleted || 0), 0);
    const totalTrainings = employees.length * 3; // Estimation 3 formations par employé
    const complianceRate = totalTrainings > 0 ? Math.round((completedTrainings / totalTrainings) * 100) : 0;
    
    return [
      {
        title: "Performance Opérationnelle",
        value: "87.5%",
        trend: { direction: 'up', percentage: 3.2, period: '30j' },
        status: 'healthy',
        action: '/app/operations',
        icon: Activity,
        color: 'text-green-600'
      },
      {
        title: "Conformité HSE",
        value: `${complianceRate}%`,
        trend: { direction: complianceRate >= 90 ? 'up' : 'down', percentage: 1.8, period: '30j' },
        status: complianceRate >= 90 ? 'healthy' : complianceRate >= 70 ? 'warning' : 'critical',
        action: '/app/hse',
        icon: Shield,
        color: complianceRate >= 90 ? 'text-green-600' : complianceRate >= 70 ? 'text-yellow-600' : 'text-red-600'
      },
      {
        title: "Effectifs Actifs",
        value: totalEmployees.toString(),
        trend: { direction: 'stable', percentage: 0, period: '30j' },
        status: 'healthy',
        action: '/app/personnel',
        icon: Users,
        color: 'text-blue-600'
      },
      {
        title: "Risques Critiques",
        value: highSeverityIncidents.toString(),
        trend: { direction: highSeverityIncidents > 0 ? 'down' : 'stable', percentage: 50, period: '30j' },
        status: highSeverityIncidents === 0 ? 'healthy' : highSeverityIncidents <= 2 ? 'warning' : 'critical',
        action: '/app/incidents',
        icon: AlertTriangle,
        color: highSeverityIncidents === 0 ? 'text-green-600' : highSeverityIncidents <= 2 ? 'text-yellow-600' : 'text-red-600'
      }
    ];
  }, [employees, incidents]);

  // Génération des alertes critiques
  const criticalAlerts: CriticalAlert[] = useMemo(() => {
    const alerts: CriticalAlert[] = [];
    
    // Alertes basées sur les données réelles
    const expiringTrainings = employees.filter(emp => {
      const lastTraining = emp.stats?.hseTrainingsCompleted || 0;
      return lastTraining < 2; // Moins de 2 formations complétées
    });

    if (expiringTrainings.length > 0) {
      alerts.push({
        id: 'training-1',
        title: 'Formations obligatoires en retard',
        description: `${expiringTrainings.length} employés ont des formations HSE en retard`,
        category: 'training',
        severity: 'high',
        owner: 'HSE001',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        actionRequired: true,
        action: { label: 'Programmer formations', route: '/app/hse/trainings' }
      });
    }

    const openIncidents = incidents.filter(i => i.status === 'open');
    if (openIncidents.length > 3) {
      alerts.push({
        id: 'incidents-1',
        title: 'Incidents HSE en attente',
        description: `${openIncidents.length} incidents ouverts nécessitent une attention`,
        category: 'incident',
        severity: 'medium',
        owner: 'HSE001',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 jours
        actionRequired: true,
        action: { label: 'Voir incidents', route: '/app/incidents' }
      });
    }

    // Alerte de rapport mensuel
    alerts.push({
      id: 'report-1',
      title: 'Rapport mensuel disponible',
      description: 'Rapport de performance octobre 2024 prêt à télécharger',
      category: 'compliance',
      severity: 'low',
      owner: 'Système',
      dueDate: new Date(),
      actionRequired: false,
      action: { label: 'Télécharger PDF', route: '/app/reports' }
    });

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [employees, incidents]);


  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleGenerateReport = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Rapport de direction générale généré avec succès');
    } catch (err) {
      alert('Erreur lors de la génération du rapport');
    }
  };

  const handleOpenSettings = () => {
    alert('Ouverture des paramètres de direction générale');
  };

  const handleViewDetails = (section: string) => {
    console.log('Voir détails:', section);
    alert(`Ouverture des détails pour ${section}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Exécutif */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              📊 Tableau de Bord Direction Générale
            </h1>
            <p className="text-muted-foreground text-lg">
              {currentUser?.firstName} {currentUser?.lastName} - {currentUser?.matricule}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Dernière mise à jour: {new Date().toLocaleString('fr-FR')} | Mode: PRODUCTION
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleGenerateReport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Générer Rapport
            </Button>
            <Button onClick={handleOpenSettings} variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Paramètres
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs Stratégiques */}
      <StrategicKPIs kpis={strategicKPIs} />

      {/* Zone Alertes Critiques */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Alertes Critiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {criticalAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-red-200">
                <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                  {alert.severity === 'critical' ? <XCircle className="w-5 h-5" /> :
                   alert.severity === 'high' ? <AlertTriangle className="w-5 h-5" /> :
                   <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{alert.title}</h4>
                    <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Responsable: {alert.owner}</span>
                    <span>Échéance: {alert.dueDate.toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                {alert.action && (
                  <Button size="sm" variant="outline">
                    {alert.action.label}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Grille de Pilotage par Domaine */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* RH */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Ressources Humaines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Effectif:</span>
              <span className="font-semibold">{employees.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Turnover:</span>
              <span className="font-semibold text-green-600">3%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Paie:</span>
              <span className="font-semibold text-green-600">À jour</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Formations:</span>
              <span className="font-semibold text-blue-600">92% compliance</span>
            </div>
            <Button onClick={() => handleViewDetails('RH')} variant="outline" size="sm" className="w-full mt-3">
              Détails RH
            </Button>
          </CardContent>
        </Card>

        {/* HSE */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Sécurité HSE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Incidents:</span>
              <span className="font-semibold">{incidents.filter(i => i.status === 'open').length} (3 ouvs)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Trainings:</span>
              <span className="font-semibold text-green-600">45 complétées</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Audit:</span>
              <span className="font-semibold text-yellow-600">1 nc</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Action:</span>
              <span className="font-semibold text-orange-600">7j</span>
            </div>
            <Button onClick={() => handleViewDetails('HSE')} variant="outline" size="sm" className="w-full mt-3">
              Détails HSE
            </Button>
          </CardContent>
        </Card>

        {/* Opérations */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Opérations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Visiteurs:</span>
              <span className="font-semibold">1,247/an</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Colis:</span>
              <span className="font-semibold">2,345/an</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">EPI:</span>
              <span className="font-semibold">156</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Maint:</span>
              <span className="font-semibold text-blue-600">12</span>
            </div>
            <Button onClick={() => handleViewDetails('Opérations')} variant="outline" size="sm" className="w-full mt-3">
              Détails Op
            </Button>
          </CardContent>
        </Card>

        {/* Communication */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Communication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Articles:</span>
              <span className="font-semibold">147</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Audience:</span>
              <span className="font-semibold">15.2k</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Engagement:</span>
              <span className="font-semibold text-green-600">87%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Partages:</span>
              <span className="font-semibold">2.3k</span>
            </div>
            <Button onClick={() => handleViewDetails('Communication')} variant="outline" size="sm" className="w-full mt-3">
              Détails
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Zone Actions Rapides */}
      <QuickActionsDG />
    </div>
  );
}
