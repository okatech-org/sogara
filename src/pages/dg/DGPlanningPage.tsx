import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Users, 
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
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AppContext';
import { useEmployees } from '@/hooks/useEmployees';
import { useVisits } from '@/hooks/useVisits';
import { usePackages } from '@/hooks/usePackages';

interface PlanningItem {
  id: string;
  title: string;
  type: 'meeting' | 'training' | 'maintenance' | 'audit' | 'event';
  startDate: Date;
  endDate: Date;
  participants: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;
  organizer: string;
}

interface PlanningOverview {
  summary: {
    totalEvents: number;
    upcomingEvents: number;
    completedEvents: number;
    cancelledEvents: number;
  };
  upcomingEvents: PlanningItem[];
  recentEvents: PlanningItem[];
  criticalEvents: PlanningItem[];
}

export function DGPlanningPage() {
  const { currentUser } = useAuth();
  const { employees } = useEmployees();
  const { visits } = useVisits();
  const { packages } = usePackages();
  
  const [overview, setOverview] = useState<PlanningOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<PlanningItem | null>(null);

  // Génération des données de planning
  const generatePlanningData = (): PlanningOverview => {
    const now = new Date();
    const events: PlanningItem[] = [
      {
        id: '1',
        title: 'Réunion Direction Générale',
        type: 'meeting',
        startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 jours
        endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2h
        participants: ['DG001', 'HSE001', 'RH001'],
        status: 'scheduled',
        priority: 'high',
        description: 'Réunion mensuelle de direction',
        location: 'Salle de réunion A',
        organizer: 'DG001'
      },
      {
        id: '2',
        title: 'Formation HSE Obligatoire',
        type: 'training',
        startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 jours
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // +8h
        participants: employees.slice(0, 10).map(e => e.id),
        status: 'scheduled',
        priority: 'critical',
        description: 'Formation sécurité obligatoire pour tous les employés',
        location: 'Salle de formation',
        organizer: 'HSE001'
      },
      {
        id: '3',
        title: 'Maintenance Équipement Critique',
        type: 'maintenance',
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +4h
        participants: ['MAINT001'],
        status: 'scheduled',
        priority: 'high',
        description: 'Maintenance préventive équipement de production',
        location: 'Atelier principal',
        organizer: 'MAINT001'
      },
      {
        id: '4',
        title: 'Audit Qualité ISO 9001',
        type: 'audit',
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 jours
        endDate: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000), // 2 jours
        participants: ['QUAL001', 'DG001', 'HSE001'],
        status: 'scheduled',
        priority: 'critical',
        description: 'Audit de certification ISO 9001',
        location: 'Bureaux administratifs',
        organizer: 'QUAL001'
      }
    ];

    const upcomingEvents = events.filter(e => e.startDate > now);
    const recentEvents = events.filter(e => e.startDate <= now);
    const criticalEvents = events.filter(e => e.priority === 'critical');

    return {
      summary: {
        totalEvents: events.length,
        upcomingEvents: upcomingEvents.length,
        completedEvents: recentEvents.length,
        cancelledEvents: 0
      },
      upcomingEvents,
      recentEvents,
      criticalEvents
    };
  };

  useEffect(() => {
    const loadPlanningData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data = generatePlanningData();
        setOverview(data);
      } catch (err) {
        setError('Erreur lors du chargement des données de planning');
        console.error('Planning loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlanningData();
  }, [employees.length]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = generatePlanningData();
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
      ['Événement', 'Type', 'Date Début', 'Date Fin', 'Statut', 'Priorité', 'Organisateur'],
      ...overview.upcomingEvents.map(event => [
        event.title,
        event.type,
        event.startDate.toLocaleDateString('fr-FR'),
        event.endDate.toLocaleDateString('fr-FR'),
        event.status,
        event.priority,
        event.organizer
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'planning-dg.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return '👥';
      case 'training': return '📚';
      case 'maintenance': return '🔧';
      case 'audit': return '📋';
      case 'event': return '🎉';
      default: return '📅';
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
      case 'scheduled': return <Badge variant="outline" className="text-blue-600">Programmé</Badge>;
      case 'in_progress': return <Badge variant="outline" className="text-orange-600">En cours</Badge>;
      case 'completed': return <Badge variant="outline" className="text-green-600">Terminé</Badge>;
      case 'cancelled': return <Badge variant="outline" className="text-red-600">Annulé</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Chargement du planning...</span>
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
              📅 Planning Global - Direction
            </h1>
            <p className="text-muted-foreground text-lg">
              {currentUser?.firstName} {currentUser?.lastName} - {currentUser?.matricule}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Planification stratégique et opérationnelle
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
              Nouvel Événement
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs Planning */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Événements</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.summary.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Événements planifiés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">À Venir</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.summary.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">Événements programmés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.summary.completedEvents}</div>
            <p className="text-xs text-muted-foreground">Événements réalisés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.criticalEvents.length}</div>
            <p className="text-xs text-muted-foreground">Priorité critique</p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'Ensemble</TabsTrigger>
          <TabsTrigger value="upcoming">À Venir</TabsTrigger>
          <TabsTrigger value="critical">Critiques</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Événements à venir */}
            <Card>
              <CardHeader>
                <CardTitle>Prochains Événements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {overview.upcomingEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="text-2xl">{getEventTypeIcon(event.type)}</div>
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {event.startDate.toLocaleDateString('fr-FR')} - {event.location}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getPriorityBadge(event.priority)}
                        {getStatusBadge(event.status)}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Événements critiques */}
            <Card>
              <CardHeader>
                <CardTitle>Événements Critiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {overview.criticalEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 border border-red-200 bg-red-50/30 rounded-lg">
                    <div className="text-2xl">{getEventTypeIcon(event.type)}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800">{event.title}</h4>
                      <p className="text-sm text-red-600">
                        {event.startDate.toLocaleDateString('fr-FR')} - {event.location}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getPriorityBadge(event.priority)}
                        {getStatusBadge(event.status)}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
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
                placeholder="Rechercher un événement..."
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
            {overview.upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{getEventTypeIcon(event.type)}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            Début: {event.startDate.toLocaleString('fr-FR')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Fin: {event.endDate.toLocaleString('fr-FR')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Lieu: {event.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {getPriorityBadge(event.priority)}
                          {getStatusBadge(event.status)}
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
            {overview.criticalEvents.map((event) => (
              <Card key={event.id} className="border-red-200 bg-red-50/30 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{getEventTypeIcon(event.type)}</div>
                      <div>
                        <h3 className="font-semibold text-lg text-red-800">{event.title}</h3>
                        <p className="text-sm text-red-600">{event.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-red-600">
                            Début: {event.startDate.toLocaleString('fr-FR')}
                          </span>
                          <span className="text-xs text-red-600">
                            Fin: {event.endDate.toLocaleString('fr-FR')}
                          </span>
                          <span className="text-xs text-red-600">
                            Lieu: {event.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {getPriorityBadge(event.priority)}
                          {getStatusBadge(event.status)}
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
