import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Edit, 
  Plus,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AppContext';
import { useIncidents } from '@/hooks/useHSE';
import { useToast } from '@/hooks/use-toast';

interface IncidentView {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  category: 'safety' | 'environment' | 'health' | 'security';
  location: string;
  reportedBy: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  impact: string;
  rootCause?: string;
  correctiveActions?: string[];
  preventiveActions?: string[];
}

export function DGHSEIncidentsViewPage() {
  const { currentUser } = useAuth();
  const { incidents } = useIncidents();
  const { toast } = useToast();
  
  const [incidentViews, setIncidentViews] = useState<IncidentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);

  // Génération des vues d'incidents enrichies
  const generateIncidentViews = (): IncidentView[] => {
    return incidents.map(incident => ({
      id: incident.id,
      title: incident.title,
      description: incident.description || 'Aucune description disponible',
      severity: incident.severity as 'low' | 'medium' | 'high' | 'critical',
      status: incident.status as 'open' | 'investigating' | 'resolved' | 'closed',
      category: ['safety', 'environment', 'health', 'security'][Math.floor(Math.random() * 4)] as 'safety' | 'environment' | 'health' | 'security',
      location: incident.location || 'Non spécifié',
      reportedBy: incident.reportedBy || 'Système',
      assignedTo: incident.assignedTo || 'Non assigné',
      createdAt: new Date(incident.createdAt),
      updatedAt: new Date(incident.updatedAt || incident.createdAt),
      dueDate: incident.dueDate ? new Date(incident.dueDate) : undefined,
      priority: incident.priority as 'low' | 'medium' | 'high' | 'urgent' || 'medium',
      impact: incident.impact || 'Impact non évalué',
      rootCause: incident.rootCause,
      correctiveActions: incident.correctiveActions || [],
      preventiveActions: incident.preventiveActions || []
    }));
  };

  useEffect(() => {
    const loadIncidentViews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data = generateIncidentViews();
        setIncidentViews(data);
      } catch (err) {
        const errorMessage = 'Erreur lors du chargement des incidents';
        setError(errorMessage);
        console.error('Incidents loading error:', err);
        toast({
          title: 'Erreur de chargement',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadIncidentViews();
  }, [incidents.length]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = generateIncidentViews();
      setIncidentViews(data);
      toast({
        title: 'Actualisation réussie',
        description: 'Les données ont été mises à jour',
      });
    } catch (err) {
      const errorMessage = 'Erreur lors du rafraîchissement des incidents';
      setError(errorMessage);
      toast({
        title: 'Erreur de rafraîchissement',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportIncidents = async () => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Créer un rapport exécutif
      const reportData = {
        title: 'Rapport Exécutif - Incidents HSE',
        date: new Date().toLocaleDateString('fr-FR'),
        period: 'Mois en cours',
        summary: {
          total: stats.total,
          open: stats.open,
          investigating: stats.investigating,
          resolved: stats.resolved,
          critical: stats.critical,
          high: stats.high
        },
        incidents: filteredIncidents.map(incident => ({
          id: incident.id,
          title: incident.title,
          severity: incident.severity,
          status: incident.status,
          category: incident.category,
          location: incident.location,
          reportedBy: incident.reportedBy,
          assignedTo: incident.assignedTo,
          createdAt: incident.createdAt.toLocaleDateString('fr-FR'),
          impact: incident.impact
        })),
        trends: {
          monthlyTrend: '+12%',
          criticalTrend: '-2',
          resolutionRate: stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0
        }
      };
      
      // Créer et télécharger le fichier JSON
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-incidents-hse-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export réussi',
        description: 'Rapport exécutif exporté avec succès',
      });
    } catch (err) {
      console.error('Export error:', err);
      toast({
        title: 'Erreur d\'export',
        description: 'Erreur lors de l\'export du rapport',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const [selectedIncident, setSelectedIncident] = useState<IncidentView | null>(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handleViewIncident = (incidentId: string) => {
    const incident = incidentViews.find(i => i.id === incidentId);
    if (incident) {
      setSelectedIncident(incident);
      setShowIncidentModal(true);
    }
  };

  const handleEditIncident = (incidentId: string) => {
    const incident = incidentViews.find(i => i.id === incidentId);
    if (incident) {
      // Redirection vers l'équipe HSE pour gestion opérationnelle
      console.log('Rediriger vers HSE:', incidentId);
      alert(`Redirection vers l'équipe HSE pour gestion opérationnelle de l'incident ${incident.title}`);
    }
  };

  const handleCloseIncidentModal = () => {
    setShowIncidentModal(false);
    setSelectedIncident(null);
  };

  // Validation des formulaires
  const validateSearchTerm = (term: string): boolean => {
    if (term.length > 100) {
      setSearchError('Le terme de recherche ne peut pas dépasser 100 caractères');
      return false;
    }
    if (term.includes('<') || term.includes('>') || term.includes('&')) {
      setSearchError('Le terme de recherche contient des caractères non autorisés');
      return false;
    }
    setSearchError(null);
    return true;
  };

  const validateFilters = (severity: string, status: string, sort: string): boolean => {
    const validSeverities = ['all', 'low', 'medium', 'high', 'critical'];
    const validStatuses = ['all', 'open', 'investigating', 'resolved', 'closed'];
    const validSorts = ['date', 'severity', 'status', 'title'];

    if (!validSeverities.includes(severity)) {
      setFilterError('Sévérité invalide');
      return false;
    }
    if (!validStatuses.includes(status)) {
      setFilterError('Statut invalide');
      return false;
    }
    if (!validSorts.includes(sort)) {
      setFilterError('Critère de tri invalide');
      return false;
    }
    setFilterError(null);
    return true;
  };

  // Gestion des changements avec validation
  const handleSearchChange = (value: string) => {
    if (validateSearchTerm(value)) {
      setSearchTerm(value);
    }
  };

  const handleSeverityChange = (value: string) => {
    if (validateFilters(value, statusFilter, sortBy)) {
      setSeverityFilter(value);
    }
  };

  const handleStatusChange = (value: string) => {
    if (validateFilters(severityFilter, value, sortBy)) {
      setStatusFilter(value);
    }
  };

  const handleSortChange = (value: string) => {
    if (validateFilters(severityFilter, statusFilter, value)) {
      setSortBy(value);
    }
  };

  // Filtrage et tri des incidents
  const filteredIncidents = useMemo(() => {
    // Gestion des cas limites
    if (!incidentViews || incidentViews.length === 0) {
      return [];
    }
    
    let filtered = incidentViews;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(incident =>
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par sévérité
    if (severityFilter !== 'all') {
      filtered = filtered.filter(incident => incident.severity === severityFilter);
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(incident => incident.status === statusFilter);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        case 'status':
          return a.status.localeCompare(b.status);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [incidentViews, searchTerm, severityFilter, statusFilter, sortBy]);

  // Statistiques
  const stats = useMemo(() => {
    // Gestion des cas limites
    if (!incidentViews || incidentViews.length === 0) {
      return { total: 0, open: 0, investigating: 0, resolved: 0, critical: 0, high: 0 };
    }
    
    const total = incidentViews.length;
    const open = incidentViews.filter(i => i.status === 'open').length;
    const investigating = incidentViews.filter(i => i.status === 'investigating').length;
    const resolved = incidentViews.filter(i => i.status === 'resolved').length;
    const critical = incidentViews.filter(i => i.severity === 'critical').length;
    const high = incidentViews.filter(i => i.severity === 'high').length;
    
    return { total, open, investigating, resolved, critical, high };
  }, [incidentViews]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600';
      case 'investigating': return 'text-yellow-600';
      case 'resolved': return 'text-green-600';
      case 'closed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'investigating': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Chargement des incidents...</span>
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              📊 Analyse Stratégique des Incidents HSE
            </h1>
            <p className="text-muted-foreground text-lg">
              {currentUser?.firstName} {currentUser?.lastName} - {currentUser?.matricule}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Tableau de bord décisionnel pour pilotage stratégique - {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              disabled={loading}
              aria-label="Actualiser les données des incidents"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button 
              onClick={handleExportIncidents} 
              variant="outline" 
              disabled={exportLoading}
              aria-label="Exporter le rapport exécutif des incidents"
            >
              <Download className={`w-4 h-4 mr-2 ${exportLoading ? 'animate-spin' : ''}`} />
              {exportLoading ? 'Export en cours...' : 'Rapport Exécutif'}
            </Button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ouverts</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.open}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.investigating}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolus</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critiques</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Élevés</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres et Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                aria-label="Rechercher dans les incidents"
                aria-describedby={searchError ? "search-error" : undefined}
              />
              {searchError && (
                <div id="search-error" className="text-red-600 text-xs mt-1">
                  {searchError}
                </div>
              )}
            </div>
            
            <Select value={severityFilter} onValueChange={handleSeverityChange}>
              <SelectTrigger aria-label="Filtrer par sévérité">
                <SelectValue placeholder="Sévérité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sévérités</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="high">Élevé</SelectItem>
                <SelectItem value="medium">Moyen</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger aria-label="Filtrer par statut">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="open">Ouvert</SelectItem>
                <SelectItem value="investigating">En cours</SelectItem>
                <SelectItem value="resolved">Résolu</SelectItem>
                <SelectItem value="closed">Fermé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger aria-label="Trier par critère">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="severity">Sévérité</SelectItem>
                <SelectItem value="status">Statut</SelectItem>
                <SelectItem value="title">Titre</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSeverityFilter('all');
                setStatusFilter('all');
                setSortBy('date');
                setSearchError(null);
                setFilterError(null);
              }}
              aria-label="Réinitialiser tous les filtres"
            >
              Réinitialiser
            </Button>
          </div>
          {filterError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-red-600 text-sm">{filterError}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tous les Incidents</TabsTrigger>
          <TabsTrigger value="critical">Critiques</TabsTrigger>
          <TabsTrigger value="open">Ouverts</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredIncidents.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <AlertTriangle className="w-12 h-12 text-gray-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      {incidentViews.length === 0 ? 'Aucun incident trouvé' : 'Aucun incident ne correspond aux filtres'}
                    </h3>
                    <p className="text-gray-500">
                      {incidentViews.length === 0 
                        ? 'Il n\'y a actuellement aucun incident enregistré dans le système.'
                        : 'Essayez de modifier vos critères de recherche ou de filtrage.'
                      }
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              filteredIncidents.map((incident) => (
              <Card key={incident.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${getSeverityColor(incident.severity)}`}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{incident.title}</h3>
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity.toUpperCase()}
                        </Badge>
                        <div className={`flex items-center gap-1 ${getStatusColor(incident.status)}`}>
                          {getStatusIcon(incident.status)}
                          <span className="text-sm font-medium">
                            {incident.status === 'open' ? 'Ouvert' : 
                             incident.status === 'investigating' ? 'En cours' : 
                             incident.status === 'resolved' ? 'Résolu' : 'Fermé'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{incident.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>Créé: {incident.createdAt.toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>Assigné: {incident.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-500" />
                          <span>Catégorie: {incident.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-gray-500" />
                          <span>Impact: {incident.impact}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewIncident(incident.id)} 
                        className="flex-1"
                        aria-label={`Voir les détails de l'incident ${incident.title}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditIncident(incident.id)} 
                        className="flex-1"
                        aria-label={`Éditer l'incident ${incident.title}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Éditer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredIncidents.filter(i => i.severity === 'critical' || i.severity === 'high').map((incident) => (
              <Card key={incident.id} className="hover:shadow-lg transition-shadow border-red-200 bg-red-50/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-red-100 text-red-600">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-red-900">{incident.title}</h3>
                        <Badge className="bg-red-600 text-white">
                          {incident.severity.toUpperCase()}
                        </Badge>
                        <div className={`flex items-center gap-1 ${getStatusColor(incident.status)}`}>
                          {getStatusIcon(incident.status)}
                          <span className="text-sm font-medium">
                            {incident.status === 'open' ? 'Ouvert' : 
                             incident.status === 'investigating' ? 'En cours' : 
                             incident.status === 'resolved' ? 'Résolu' : 'Fermé'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{incident.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>Créé: {incident.createdAt.toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>Assigné: {incident.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-500" />
                          <span>Catégorie: {incident.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-gray-500" />
                          <span>Impact: {incident.impact}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewIncident(incident.id)} 
                        className="flex-1"
                        aria-label={`Voir les détails de l'incident ${incident.title}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditIncident(incident.id)} 
                        className="flex-1"
                        aria-label={`Éditer l'incident ${incident.title}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Éditer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="open" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredIncidents.filter(i => i.status === 'open' || i.status === 'investigating').map((incident) => (
              <Card key={incident.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${getSeverityColor(incident.severity)}`}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{incident.title}</h3>
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity.toUpperCase()}
                        </Badge>
                        <div className={`flex items-center gap-1 ${getStatusColor(incident.status)}`}>
                          {getStatusIcon(incident.status)}
                          <span className="text-sm font-medium">
                            {incident.status === 'open' ? 'Ouvert' : 'En cours'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{incident.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>Créé: {incident.createdAt.toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>Assigné: {incident.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-500" />
                          <span>Catégorie: {incident.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-gray-500" />
                          <span>Impact: {incident.impact}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewIncident(incident.id)} 
                        className="flex-1"
                        aria-label={`Voir les détails de l'incident ${incident.title}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditIncident(incident.id)} 
                        className="flex-1"
                        aria-label={`Éditer l'incident ${incident.title}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Éditer
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
                  Tendance Mensuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">+12% vs mois dernier</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Sévérité Critique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">-2 vs mois dernier</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Taux de Résolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">+5% vs mois dernier</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de détails d'incident */}
      <Dialog open={showIncidentModal} onOpenChange={setShowIncidentModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Détails de l'Incident
            </DialogTitle>
          </DialogHeader>
          
          {selectedIncident && (
            <div className="space-y-6">
              {/* En-tête de l'incident */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{selectedIncident.title}</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={getSeverityColor(selectedIncident.severity)}>
                      {selectedIncident.severity.toUpperCase()}
                    </Badge>
                    <div className={`flex items-center gap-1 ${getStatusColor(selectedIncident.status)}`}>
                      {getStatusIcon(selectedIncident.status)}
                      <span className="text-sm font-medium">
                        {selectedIncident.status === 'open' ? 'Ouvert' : 
                         selectedIncident.status === 'investigating' ? 'En cours' : 
                         selectedIncident.status === 'resolved' ? 'Résolu' : 'Fermé'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedIncident.description}</p>
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations Générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span><strong>Créé:</strong> {selectedIncident.createdAt.toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span><strong>Signalé par:</strong> {selectedIncident.reportedBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span><strong>Assigné à:</strong> {selectedIncident.assignedTo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-500" />
                      <span><strong>Catégorie:</strong> {selectedIncident.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-gray-500" />
                      <span><strong>Impact:</strong> {selectedIncident.impact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span><strong>Priorité:</strong> {selectedIncident.priority}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Localisation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedIncident.location}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Actions correctives et préventives */}
              {(selectedIncident.correctiveActions?.length > 0 || selectedIncident.preventiveActions?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedIncident.correctiveActions?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Actions Correctives</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedIncident.correctiveActions.map((action, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                              <span className="text-sm">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {selectedIncident.preventiveActions?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Actions Préventives</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedIncident.preventiveActions.map((action, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Shield className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                              <span className="text-sm">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Cause racine */}
              {selectedIncident.rootCause && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cause Racine</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedIncident.rootCause}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseIncidentModal}>
              Fermer
            </Button>
            <Button onClick={() => selectedIncident && handleEditIncident(selectedIncident.id)}>
              <Edit className="w-4 h-4 mr-2" />
              Rediriger vers HSE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
