import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  Table, 
  BarChart3,
  Calendar,
  Users,
  Shield,
  Package,
  HardHat,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AppContext';
import { useEmployees } from '@/hooks/useEmployees';
import { useIncidents } from '@/hooks/useHSE';
import { useVisits } from '@/hooks/useVisits';
import { usePackages } from '@/hooks/usePackages';
import { useEquipment } from '@/hooks/useEquipment';

interface ExportConfig {
  id: string;
  name: string;
  description: string;
  dataSource: string;
  format: 'csv' | 'excel' | 'json' | 'pdf';
  fields: string[];
  filters: Record<string, any>;
  lastExported?: Date;
  recordCount?: number;
}

interface ExportJob {
  id: string;
  configId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  error?: string;
  recordCount?: number;
}

export function DGExportPage() {
  const { currentUser } = useAuth();
  const { employees } = useEmployees();
  const { incidents } = useIncidents();
  const { visits } = useVisits();
  const { packages } = usePackages();
  const { equipment } = useEquipment();
  
  const [exportConfigs, setExportConfigs] = useState<ExportConfig[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('configs');
  const [processingJob, setProcessingJob] = useState<string | null>(null);

  // Configurations d'export prédéfinies
  const defaultConfigs: ExportConfig[] = [
    {
      id: 'employees-full',
      name: 'Données Employés Complètes',
      description: 'Export complet des données employés avec historique',
      dataSource: 'employees',
      format: 'excel',
      fields: ['matricule', 'firstName', 'lastName', 'email', 'department', 'position', 'hireDate', 'status'],
      filters: {},
      recordCount: employees.length
    },
    {
      id: 'incidents-analysis',
      name: 'Analyse Incidents HSE',
      description: 'Export des incidents avec analyse et tendances',
      dataSource: 'incidents',
      format: 'csv',
      fields: ['id', 'title', 'severity', 'status', 'createdAt', 'resolvedAt', 'description'],
      filters: {},
      recordCount: incidents.length
    },
    {
      id: 'visits-summary',
      name: 'Résumé Visites',
      description: 'Export des données de visites et statistiques',
      dataSource: 'visits',
      format: 'excel',
      fields: ['id', 'visitorName', 'company', 'purpose', 'checkIn', 'checkOut', 'status'],
      filters: {},
      recordCount: visits.length
    },
    {
      id: 'packages-tracking',
      name: 'Suivi Colis et Courriers',
      description: 'Export du suivi des colis et courriers',
      dataSource: 'packages',
      format: 'csv',
      fields: ['id', 'trackingNumber', 'recipient', 'sender', 'status', 'receivedAt', 'deliveredAt'],
      filters: {},
      recordCount: packages.length
    },
    {
      id: 'equipment-status',
      name: 'État des Équipements',
      description: 'Export de l\'état et maintenance des équipements',
      dataSource: 'equipment',
      format: 'excel',
      fields: ['id', 'name', 'type', 'status', 'lastMaintenance', 'nextMaintenance', 'location'],
      filters: {},
      recordCount: equipment.length
    }
  ];

  useEffect(() => {
    const loadExportData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulation d'un délai d'API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mettre à jour les compteurs
        const updatedConfigs = defaultConfigs.map(config => ({
          ...config,
          recordCount: config.dataSource === 'employees' ? employees.length :
                      config.dataSource === 'incidents' ? incidents.length :
                      config.dataSource === 'visits' ? visits.length :
                      config.dataSource === 'packages' ? packages.length :
                      config.dataSource === 'equipment' ? equipment.length : 0
        }));
        
        setExportConfigs(updatedConfigs);
        
        // Générer quelques jobs d'export existants
        const existingJobs: ExportJob[] = [
          {
            id: 'job-1',
            configId: 'employees-full',
            status: 'completed',
            createdAt: new Date(Date.now() - 86400000), // 1 jour
            completedAt: new Date(Date.now() - 86300000),
            downloadUrl: '#',
            recordCount: employees.length
          },
          {
            id: 'job-2',
            configId: 'incidents-analysis',
            status: 'completed',
            createdAt: new Date(Date.now() - 172800000), // 2 jours
            completedAt: new Date(Date.now() - 172700000),
            downloadUrl: '#',
            recordCount: incidents.length
          }
        ];
        
        setExportJobs(existingJobs);
      } catch (err) {
        setError('Erreur lors du chargement des configurations d\'export');
        console.error('Export data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadExportData();
  }, [employees.length, incidents.length, visits.length, packages.length, equipment.length]);

  const handleExportData = async (config: ExportConfig) => {
    setProcessingJob(config.id);
    setError(null);
    
    try {
      // Créer un nouveau job d'export
      const newJob: ExportJob = {
        id: `job-${Date.now()}`,
        configId: config.id,
        status: 'processing',
        createdAt: new Date(),
        recordCount: config.recordCount
      };
      
      setExportJobs(prev => [newJob, ...prev]);
      
      // Simulation de traitement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mettre à jour le job comme terminé
      setExportJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, status: 'completed' as const, completedAt: new Date(), downloadUrl: '#' }
          : job
      ));
      
      // Mettre à jour la config avec la date d'export
      setExportConfigs(prev => prev.map(cfg => 
        cfg.id === config.id 
          ? { ...cfg, lastExported: new Date() }
          : cfg
      ));
      
    } catch (err) {
      setError('Erreur lors de l\'export des données');
      setExportJobs(prev => prev.map(job => 
        job.id === `job-${Date.now()}` 
          ? { ...job, status: 'error' as const, error: 'Erreur de traitement' }
          : job
      ));
      console.error('Export error:', err);
    } finally {
      setProcessingJob(null);
    }
  };

  const handleDownloadExport = (job: ExportJob) => {
    if (job.downloadUrl) {
      // Simulation de téléchargement
      const link = document.createElement('a');
      link.href = job.downloadUrl;
      link.download = `export-${job.configId}-${job.createdAt.toISOString().split('T')[0]}.csv`;
      link.click();
    }
  };

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing': return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: ExportJob['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-yellow-600">En attente</Badge>;
      case 'processing': return <Badge variant="outline" className="text-blue-600">Traitement...</Badge>;
      case 'completed': return <Badge variant="outline" className="text-green-600">Terminé</Badge>;
      case 'error': return <Badge variant="outline" className="text-red-600">Erreur</Badge>;
    }
  };

  const getFormatIcon = (format: ExportConfig['format']) => {
    switch (format) {
      case 'csv': return <Table className="w-4 h-4" />;
      case 'excel': return <BarChart3 className="w-4 h-4" />;
      case 'json': return <FileText className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Chargement des configurations d'export...</span>
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
          <Button onClick={() => window.location.reload()} variant="outline">
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
              📊 Données & Export Direction
            </h1>
            <p className="text-muted-foreground text-lg">
              {currentUser?.firstName} {currentUser?.lastName} - {currentUser?.matricule}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Export et téléchargement des données consolidées
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtrer
            </Button>
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </div>
      </div>

      {/* Statistiques Rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configurations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exportConfigs.length}</div>
            <p className="text-xs text-muted-foreground">Configurations disponibles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exports Réalisés</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exportJobs.filter(j => j.status === 'completed').length}</div>
            <p className="text-xs text-muted-foreground">Exports terminés</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exportJobs.filter(j => j.status === 'processing').length}</div>
            <p className="text-xs text-muted-foreground">Exports en traitement</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernier Export</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exportJobs.length > 0 ? 
                exportJobs[0].createdAt.toLocaleDateString('fr-FR') : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">Date du dernier export</p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configs">Configurations</TabsTrigger>
          <TabsTrigger value="jobs">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="configs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exportConfigs.map((config) => (
              <Card key={config.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getFormatIcon(config.format)}
                    {config.name}
                    <Badge variant="outline" className="text-xs">
                      {config.format.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Enregistrements:</span>
                    <Badge variant="outline">{config.recordCount}</Badge>
                  </div>
                  
                  {config.lastExported && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Dernier export:</span>
                      <span className="text-muted-foreground">
                        {config.lastExported.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Champs inclus:</h4>
                    <div className="flex flex-wrap gap-1">
                      {config.fields.slice(0, 3).map((field, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                      {config.fields.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{config.fields.length - 3} autres
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={() => handleExportData(config)}
                    disabled={processingJob === config.id || config.recordCount === 0}
                  >
                    {processingJob === config.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Export...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Exporter
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {exportJobs.map((job) => {
              const config = exportConfigs.find(c => c.id === job.configId);
              return (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(job.status)}
                        <div>
                          <h3 className="font-semibold text-lg">
                            {config?.name || 'Export inconnu'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {config?.description || 'Configuration non trouvée'}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground">
                              Créé: {job.createdAt.toLocaleString('fr-FR')}
                            </span>
                            {job.completedAt && (
                              <span className="text-xs text-muted-foreground">
                                Terminé: {job.completedAt.toLocaleString('fr-FR')}
                              </span>
                            )}
                            {job.recordCount && (
                              <span className="text-xs text-muted-foreground">
                                {job.recordCount} enregistrements
                              </span>
                            )}
                            {getStatusBadge(job.status)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.status === 'completed' && job.downloadUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadExport(job)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </Button>
                        )}
                        {job.status === 'error' && job.error && (
                          <Badge variant="destructive" className="text-xs">
                            {job.error}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
