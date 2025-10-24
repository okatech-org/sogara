import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Users, 
  Award, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  BarChart3,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Calendar,
  UserCheck,
  UserX
} from 'lucide-react';
import { useAuth } from '@/contexts/AppContext';
import { useEmployees } from '@/hooks/useEmployees';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Formation {
  id: string;
  title: string;
  type: 'hse' | 'technical' | 'management' | 'compliance';
  duration: number; // en heures
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  participants: string[];
  completedParticipants: string[];
  instructor: string;
  location: string;
  description: string;
  required: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface FormationsOverview {
  summary: {
    totalFormations: number;
    activeFormations: number;
    completedFormations: number;
    totalParticipants: number;
    completionRate: number;
  };
  formations: Formation[];
  upcomingFormations: Formation[];
  completedFormations: Formation[];
  criticalFormations: Formation[];
  statistics: {
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    completionTrends: Array<{ month: string; rate: number }>;
  };
}

export function DGFormationsPage() {
  const { currentUser } = useAuth();
  const { employees } = useEmployees();
  
  const [overview, setOverview] = useState<FormationsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

  // Génération des données de formations
  const generateFormationsData = (): FormationsOverview => {
    const now = new Date();
    const formations: Formation[] = [
      {
        id: '1',
        title: 'Formation HSE Obligatoire',
        type: 'hse',
        duration: 8,
        status: 'scheduled',
        startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
        participants: employees.slice(0, 15).map(e => e.id),
        completedParticipants: [],
        instructor: 'HSE001',
        location: 'Salle de formation',
        description: 'Formation sécurité obligatoire pour tous les employés',
        required: true,
        priority: 'critical'
      },
      {
        id: '2',
        title: 'Formation Management',
        type: 'management',
        duration: 16,
        status: 'in_progress',
        startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        participants: employees.filter(e => e.roles.includes('SUPERVISEUR')).map(e => e.id),
        completedParticipants: employees.filter(e => e.roles.includes('SUPERVISEUR')).slice(0, 2).map(e => e.id),
        instructor: 'RH001',
        location: 'Salle de réunion B',
        description: 'Formation en management pour les superviseurs',
        required: false,
        priority: 'high'
      },
      {
        id: '3',
        title: 'Formation Technique',
        type: 'technical',
        duration: 12,
        status: 'completed',
        startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        participants: employees.filter(e => e.service === 'Production').map(e => e.id),
        completedParticipants: employees.filter(e => e.service === 'Production').map(e => e.id),
        instructor: 'TECH001',
        location: 'Atelier',
        description: 'Formation technique sur les nouveaux équipements',
        required: true,
        priority: 'medium'
      },
      {
        id: '4',
        title: 'Formation Conformité',
        type: 'compliance',
        duration: 4,
        status: 'scheduled',
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        participants: employees.filter(e => e.roles.includes('ADMIN')).map(e => e.id),
        completedParticipants: [],
        instructor: 'COMP001',
        location: 'Bureaux administratifs',
        description: 'Formation conformité réglementaire',
        required: true,
        priority: 'high'
      }
    ];

    const upcomingFormations = formations.filter(f => f.status === 'scheduled');
    const completedFormations = formations.filter(f => f.status === 'completed');
    const criticalFormations = formations.filter(f => f.priority === 'critical');

    const totalParticipants = formations.reduce((acc, f) => acc + f.participants.length, 0);
    const totalCompleted = formations.reduce((acc, f) => acc + f.completedParticipants.length, 0);
    const completionRate = totalParticipants > 0 ? (totalCompleted / totalParticipants) * 100 : 0;

    const byType = formations.reduce((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = formations.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const completionTrends = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ].map(month => ({
      month,
      rate: 70 + Math.random() * 20
    }));

    return {
      summary: {
        totalFormations: formations.length,
        activeFormations: formations.filter(f => f.status === 'in_progress').length,
        completedFormations: completedFormations.length,
        totalParticipants,
        completionRate
      },
      formations,
      upcomingFormations,
      completedFormations,
      criticalFormations,
      statistics: {
        byType,
        byStatus,
        completionTrends
      }
    };
  };

  useEffect(() => {
    const loadFormationsData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data = generateFormationsData();
        setOverview(data);
      } catch (err) {
        setError('Erreur lors du chargement des données de formations');
        console.error('Formations loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFormationsData();
  }, [employees.length]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = generateFormationsData();
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
      ['Formation', 'Type', 'Statut', 'Date Début', 'Date Fin', 'Participants', 'Taux de Réussite']
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formations-dg.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getFormationTypeIcon = (type: string) => {
    switch (type) {
      case 'hse': return '🛡️';
      case 'technical': return '🔧';
      case 'management': return '👥';
      case 'compliance': return '📋';
      default: return '📚';
    }
  };

  const getFormationTypeLabel = (type: string) => {
    switch (type) {
      case 'hse': return 'HSE';
      case 'technical': return 'Technique';
      case 'management': return 'Management';
      case 'compliance': return 'Conformité';
      default: return 'Autre';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return <Badge variant="destructive">Critique</Badge>;
      case 'high': return <Badge variant="destructive" className="bg-orange-600">Élevé</Badge>;
      case 'medium': return <Badge variant="outline" className="text-orange-600">Moyen</Badge>;
      case 'low': return <Badge variant="outline" className="text-blue-600">Faible</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return <Badge variant="outline" className="text-blue-600">Programmée</Badge>;
      case 'in_progress': return <Badge variant="outline" className="text-orange-600">En cours</Badge>;
      case 'completed': return <Badge variant="outline" className="text-green-600">Terminée</Badge>;
      case 'cancelled': return <Badge variant="outline" className="text-red-600">Annulée</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const COLORS = ['#0088FE', '#00C49F Leistung', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Chargement des formations...</span>
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
              📚 Formations & Habilitations - Direction
            </h1>
            <p className="text-muted-foreground text-lg">
              {currentUser?.firstName} {currentUser?.lastName} - {currentUser?.matricule}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Gestion des formations et suivi des habilitations
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
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Formation
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs Formations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Formations</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.summary.totalFormations}</div>
            <p className="text-xs text-muted-foreground">Formations planifiées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.summary.activeFormations}</div>
            <p className="text-xs text-muted-foreground">Formations actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.summary.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Formations complétées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.summary.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Total participants</p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'Ensemble</TabsTrigger>
          <TabsTrigger value="upcoming">À Venir</TabsTrigger>
          <TabsTrigger value="critical">Critiques</TabsTrigger>
          <TabsTrigger value="statistics">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Répartition par Type */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(overview.statistics.byType).map(([name, value]) => ({ 
                        name: getFormationTypeLabel(name), 
                        value 
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(overview.statistics.byType).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Répartition par Statut */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Statut</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(overview.statistics.byStatus).map(([name, value]) => ({ 
                    name: name === 'scheduled' ? 'Programmées' : 
                          name === 'in_progress' ? 'En cours' : 
                          name === 'completed' ? 'Terminées' : 'Annulées', 
                    value 
                  }))}>
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

        <TabsContent value="upcoming" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une formation..."
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
            {overview.upcomingFormations.map((formation) => (
              <Card key={formation.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{getFormationTypeIcon(formation.type)}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{formation.title}</h3>
                        <p className="text-sm text-muted-foreground">{formation.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            Début: {formation.startDate.toLocaleDateString('fr-FR')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Durée: {formation.duration}h
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Lieu: {formation.location}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Participants: {formation.participants.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {getPriorityBadge(formation.priority)}
                          {getStatusBadge(formation.status)}
                          {formation.required && (
                            <Badge variant="outline" className="text-red-600">Obligatoire</Badge>
                          )}
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

        <TabsContent value="critical" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {overview.criticalFormations.map((formation) => (
              <Card key={formation.id} className="border-red-200 bg-red-50/30 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{getFormationTypeIcon(formation.type)}</div>
                      <div>
                        <h3 className="font-semibold text-lg text-red-800">{formation.title}</h3>
                        <p className="text-sm text-red-600">{formation.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-red-600">
                            Début: {formation.startDate.toLocaleDateString('fr-FR')}
                          </span>
                          <span className="text-xs text-red-600">
                            Durée: {formation.duration}h
                          </span>
                          <span className="text-xs text-red-600">
                            Lieu: {formation.location}
                          </span>
                          <span className="text-xs text-red-600">
                            Participants: {formation.participants.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {getPriorityBadge(formation.priority)}
                          {getStatusBadge(formation.status)}
                          {formation.required && (
                            <Badge variant="outline" className="text-red-600">Obligatoire</Badge>
                          )}
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

        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution du Taux de Réussite</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={overview.statistics.completionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
