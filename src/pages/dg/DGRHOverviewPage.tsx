import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AppContext';
import { useEmployees } from '@/hooks/useEmployees';
import { useVisits } from '@/hooks/useVisits';
import { usePackages } from '@/hooks/usePackages';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface RHOverview {
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    newHires: number;
    departures: number;
    averageAge: number;
    genderDistribution: { male: number; female: number };
    departmentDistribution: Record<string, number>;
  };
  trends: {
    headcountEvolution: Array<{ month: string; count: number }>;
    turnoverRate: number;
    retentionRate: number;
    averageTenure: number;
  };
  alerts: Array<{
    id: string;
    type: 'contract_expiry' | 'training_expiry' | 'performance_review' | 'birthday';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    dueDate: Date;
    employeeId: string;
  }>;
  performance: {
    averagePerformance: number;
    topPerformers: Array<{ id: string; name: string; score: number }>;
    underPerformers: Array<{ id: string; name: string; score: number }>;
    trainingCompletion: number;
  };
}

export function DGRHOverviewPage() {
  const { currentUser } = useAuth();
  const { employees } = useEmployees();
  const { visits } = useVisits();
  const { packages } = usePackages();
  
  const [overview, setOverview] = useState<RHOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // Génération des données RH
  const generateRHOverview = (): RHOverview => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'active').length;
    
    // Simulation de données
    const newHires = Math.floor(Math.random() * 5) + 2;
    const departures = Math.floor(Math.random() * 3) + 1;
    const averageAge = 35 + Math.floor(Math.random() * 10);
    
    const genderDistribution = {
      male: Math.floor(totalEmployees * 0.65),
      female: totalEmployees - Math.floor(totalEmployees * 0.65)
    };

    const departmentDistribution = employees.reduce((acc, emp) => {
      acc[emp.service] = (acc[emp.service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const headcountEvolution = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ].map(month => ({
      month,
      count: totalEmployees + Math.floor(Math.random() * 5) - 2
    }));

    const turnoverRate = (departures / totalEmployees) * 100;
    const retentionRate = 100 - turnoverRate;
    const averageTenure = 3.5 + Math.random() * 2;

    const alerts = [
      {
        id: '1',
        type: 'contract_expiry' as const,
        title: 'Contrats arrivant à expiration',
        description: '3 contrats arrivent à expiration dans les 30 jours',
        severity: 'high' as const,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        employeeId: 'EMP001'
      },
      {
        id: '2',
        type: 'training_expiry' as const,
        title: 'Formations expirées',
        description: '8 employés ont des formations HSE expirées',
        severity: 'critical' as const,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        employeeId: 'EMP002'
      },
      {
        id: '3',
        type: 'performance_review' as const,
        title: 'Évaluations en retard',
        description: '5 évaluations de performance sont en retard',
        severity: 'medium' as const,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        employeeId: 'EMP003'
      }
    ];

    const performance = {
      averagePerformance: 85 + Math.random() * 10,
      topPerformers: employees.slice(0, 3).map(emp => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        score: 90 + Math.random() * 10
      })),
      underPerformers: employees.slice(-2).map(emp => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        score: 60 + Math.random() * 15
      })),
      trainingCompletion: 78 + Math.random() * 15
    };

    return {
      summary: {
        totalEmployees,
        activeEmployees,
        newHires,
        departures,
        averageAge,
        genderDistribution,
        departmentDistribution
      },
      trends: {
        headcountEvolution,
        turnoverRate,
        retentionRate,
        averageTenure
      },
      alerts,
      performance
    };
  };

  useEffect(() => {
    const loadRHOverview = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data = generateRHOverview();
        setOverview(data);
      } catch (err) {
        setError('Erreur lors du chargement des données RH');
        console.error('RH overview loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRHOverview();
  }, [employees.length]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = generateRHOverview();
      setOverview(data);
    } catch (err) {
      setError('Erreur lors du rafraîchissement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    if (!overview) return;
    
    const csvData = [
      ['Métrique', 'Valeur'],
      ['Total Employés', overview.summary.totalEmployees],
      ['Employés Actifs', overview.summary.activeEmployees],
      ['Nouveaux Recrutements', overview.summary.newHires],
      ['Départs', overview.summary.departures],
      ['Âge Moyen', overview.summary.averageAge],
      ['Taux de Turnover', `${overview.trends.turnoverRate.toFixed(1)}%`],
      ['Taux de Rétention', `${overview.trends.retentionRate.toFixed(1)}%`]
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rh-overview-dg.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    return employees.filter(emp => 
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.service.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Chargement des données RH...</span>
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
              👥 Vue d'Ensemble RH - Direction
            </h1>
            <p className="text-muted-foreground text-lg">
              {currentUser?.firstName} {currentUser?.lastName} - {currentUser?.matricule}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Analyse consolidée des ressources humaines
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

      {/* KPIs RH */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.summary.totalEmployees}</div>
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-green-600">+{overview.summary.newHires} ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Turnover</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.trends.turnoverRate.toFixed(1)}%</div>
            <div className="flex items-center gap-2 text-xs">
              <TrendingDown className="w-3 h-3 text-red-600" />
              <span className="text-red-600">-{overview.summary.departures} départs</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Moyenne</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.performance.averagePerformance.toFixed(1)}%</div>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span className="text-green-600">Au-dessus de l'objectif</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formations Complétées</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.performance.trainingCompletion.toFixed(1)}%</div>
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3 h-3 text-orange-600" />
              <span className="text-orange-600">En cours d'amélioration</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'Ensemble</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="employees">Employés</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Répartition par Département */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Département</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(overview.summary.departmentDistribution).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(overview.summary.departmentDistribution).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Répartition par Genre */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Genre</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Hommes', value: overview.summary.genderDistribution.male },
                    { name: 'Femmes', value: overview.summary.genderDistribution.female }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Effectifs</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={overview.trends.headcountEvolution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
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
                          <Badge variant="outline" className={
                            alert.severity === 'critical' ? 'text-red-600' :
                            alert.severity === 'high' ? 'text-orange-600' :
                            'text-blue-600'
                          }>
                            {alert.severity === 'critical' ? 'Critique' :
                             alert.severity === 'high' ? 'Élevé' :
                             alert.severity === 'medium' ? 'Moyen' : 'Faible'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Échéance: {alert.dueDate.toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold">{employee.firstName} {employee.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{employee.matricule} - {employee.service}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {employee.roles[0]}
                          </Badge>
                          <StatusBadge status={employee.status} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
