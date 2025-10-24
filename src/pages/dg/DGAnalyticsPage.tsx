import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Users,
  Shield,
  Package,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AppContext';
import { useEmployees } from '@/hooks/useEmployees';
import { useIncidents } from '@/hooks/useHSE';
import { useVisits } from '@/hooks/useVisits';
import { usePackages } from '@/hooks/usePackages';
import { useEquipment } from '@/hooks/useEquipment';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  trends: {
    incidents: Array<{ month: string; count: number; forecast: number }>;
    workforce: Array<{ month: string; headcount: number; projection: number }>;
    compliance: Array<{ month: string; rate: number; target: number }>;
  };
  predictions: {
    incidents: { nextMonth: number; confidence: number; recommendation: string };
    workforce: { nextMonth: number; confidence: number; recommendation: string };
    compliance: { nextMonth: number; confidence: number; recommendation: string };
  };
  kpis: {
    operationalEfficiency: number;
    hseCompliance: number;
    workforceProductivity: number;
    costOptimization: number;
  };
}

export function DGAnalyticsPage() {
  const { currentUser } = useAuth();
  const { employees } = useEmployees();
  const { incidents } = useIncidents();
  const { visits } = useVisits();
  const { packages } = usePackages();
  const { equipment } = useEquipment();
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('trends');

  // Simulation de données analytics
  const generateAnalyticsData = (): AnalyticsData => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      trends: {
        incidents: months.map((month, index) => ({
          month,
          count: Math.max(0, Math.floor(Math.random() * 10) + 2 - index),
          forecast: Math.max(0, Math.floor(Math.random() * 8) + 1)
        })),
        workforce: months.map((month, index) => ({
          month,
          headcount: employees.length + Math.floor(Math.random() * 5) - 2,
          projection: employees.length + Math.floor(Math.random() * 3)
        })),
        compliance: months.map((month, index) => ({
          month,
          rate: Math.min(100, Math.max(70, 85 + Math.floor(Math.random() * 20) - 10)),
          target: 90
        }))
      },
      predictions: {
        incidents: {
          nextMonth: Math.floor(Math.random() * 5) + 1,
          confidence: 78,
          recommendation: 'Maintenir les efforts de prévention actuels'
        },
        workforce: {
          nextMonth: employees.length + Math.floor(Math.random() * 3),
          confidence: 85,
          recommendation: 'Planifier le recrutement de 2-3 personnes'
        },
        compliance: {
          nextMonth: Math.min(100, Math.max(85, 92 + Math.floor(Math.random() * 10) - 5)),
          confidence: 82,
          recommendation: 'Renforcer les formations HSE'
        }
      },
      kpis: {
        operationalEfficiency: 87.5,
        hseCompliance: 92.3,
        workforceProductivity: 89.1,
        costOptimization: 84.7
      }
    };
  };

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulation d'un délai d'API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const data = generateAnalyticsData();
        setAnalyticsData(data);
      } catch (err) {
        setError('Erreur lors du chargement des données analytics');
        console.error('Analytics loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [employees.length]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = generateAnalyticsData();
      setAnalyticsData(data);
    } catch (err) {
      setError('Erreur lors du rafraîchissement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    if (!analyticsData) return;
    
    // Simulation d'export de données
    const csvData = [
      ['Métrique', 'Valeur', 'Prédiction', 'Confiance'],
      ['Incidents', analyticsData.predictions.incidents.nextMonth, 'Tendance stable', '78%'],
      ['Effectif', analyticsData.predictions.workforce.nextMonth, 'Croissance modérée', '85%'],
      ['Conformité', analyticsData.predictions.compliance.nextMonth, 'Amélioration', '82%']
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-dg.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Chargement des analytics...</span>
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

  if (!analyticsData) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              📈 Analytics & Prévisions Direction
            </h1>
            <p className="text-muted-foreground text-lg">
              {currentUser?.firstName} {currentUser?.lastName} - {currentUser?.matricule}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleRefresh} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button onClick={handleExportData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(analyticsData.kpis).map(([key, value]) => (
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
              <div className="flex items-center gap-2 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>+2.3% vs mois dernier</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Onglets Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique Incidents */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.trends.incidents}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="forecast" stroke="#82ca9d" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Graphique Effectifs */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des Effectifs</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.trends.workforce}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="headcount" fill="#8884d8" />
                    <Bar dataKey="projection" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Graphique Conformité */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution de la Conformité</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.trends.compliance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" stroke="#ffc658" strokeWidth={2} />
                  <Line type="monotone" dataKey="target" stroke="#ff7300" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(analyticsData.predictions).map(([key, prediction]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {key === 'incidents' && 'Prédiction Incidents'}
                    {key === 'workforce' && 'Prédiction Effectifs'}
                    {key === 'compliance' && 'Prédiction Conformité'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{prediction.nextMonth}</div>
                    <div className="text-sm text-muted-foreground">Prochaine période</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Confiance:</span>
                    <Badge variant="outline">{prediction.confidence}%</Badge>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">{prediction.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
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
