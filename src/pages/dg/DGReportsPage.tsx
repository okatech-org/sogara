import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Calendar,
  Users,
  Shield,
  Package,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Trash2,
  Plus,
  Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/AppContext';
import { useEmployees } from '@/hooks/useEmployees';
import { useIncidents } from '@/hooks/useHSE';
import { useVisits } from '@/hooks/useVisits';
import { usePackages } from '@/hooks/usePackages';
import { useEquipment } from '@/hooks/useEquipment';

interface Report {
  id: string;
  title: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  status: 'generating' | 'ready' | 'error';
  createdAt: Date;
  generatedAt?: Date;
  size: string;
  format: 'pdf' | 'excel' | 'csv';
  description: string;
  sections: string[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  isDefault: boolean;
}

export function DGReportsPage() {
  const { currentUser } = useAuth();
  const { employees } = useEmployees();
  const { incidents } = useIncidents();
  const { visits } = useVisits();
  const { packages } = usePackages();
  const { equipment } = useEquipment();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('reports');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  // Templates de rapports prédéfinis
  const defaultTemplates: ReportTemplate[] = [
    {
      id: 'monthly-executive',
      name: 'Rapport Mensuel Direction',
      description: 'Rapport consolidé mensuel avec KPIs, incidents, et recommandations',
      sections: ['KPIs Stratégiques', 'Incidents HSE', 'Ressources Humaines', 'Opérations', 'Recommandations'],
      isDefault: true
    },
    {
      id: 'quarterly-review',
      name: 'Bilan Trimestriel',
      description: 'Analyse complète trimestrielle avec tendances et projections',
      sections: ['Analyse Tendances', 'Performance Financière', 'Conformité', 'Objectifs', 'Plan d\'Action'],
      isDefault: true
    },
    {
      id: 'annual-summary',
      name: 'Rapport Annuel',
      description: 'Synthèse annuelle avec bilan complet et perspectives',
      sections: ['Bilan Annuel', 'Réalisations', 'Défis', 'Perspectives', 'Objectifs Futurs'],
      isDefault: true
    }
  ];

  // Génération de rapports existants
  const generateExistingReports = (): Report[] => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    return [
      {
        id: 'report-1',
        title: 'Rapport Mensuel - Octobre 2024',
        type: 'monthly',
        status: 'ready',
        createdAt: lastMonth,
        generatedAt: lastMonth,
        size: '2.4 MB',
        format: 'pdf',
        description: 'Rapport mensuel consolidé avec KPIs et analyses',
        sections: ['KPIs Stratégiques', 'Incidents HSE', 'Ressources Humaines']
      },
      {
        id: 'report-2',
        title: 'Bilan Trimestriel Q3 2024',
        type: 'quarterly',
        status: 'ready',
        createdAt: new Date(now.getFullYear(), now.getMonth() - 3, 1),
        generatedAt: new Date(now.getFullYear(), now.getMonth() - 3, 2),
        size: '4.1 MB',
        format: 'pdf',
        description: 'Analyse trimestrielle complète',
        sections: ['Analyse Tendances', 'Performance Financière', 'Conformité']
      },
      {
        id: 'report-3',
        title: 'Rapport Personnalisé - Audit HSE',
        type: 'custom',
        status: 'ready',
        createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 15),
        generatedAt: new Date(now.getFullYear(), now.getMonth() - 1, 16),
        size: '1.8 MB',
        format: 'excel',
        description: 'Rapport spécialisé pour audit HSE',
        sections: ['Incidents HSE', 'Formations', 'Conformité']
      }
    ];
  };

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulation d'un délai d'API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const existingReports = generateExistingReports();
        setReports(existingReports);
        setTemplates(defaultTemplates);
      } catch (err) {
        setError('Erreur lors du chargement des rapports');
        console.error('Reports loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const handleGenerateReport = async (template: ReportTemplate) => {
    setGeneratingReport(template.id);
    setError(null);
    
    try {
      // Simulation de génération de rapport
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newReport: Report = {
        id: `report-${Date.now()}`,
        title: `${template.name} - ${new Date().toLocaleDateString('fr-FR')}`,
        type: template.id.includes('monthly') ? 'monthly' : template.id.includes('quarterly') ? 'quarterly' : 'custom',
        status: 'ready',
        createdAt: new Date(),
        generatedAt: new Date(),
        size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
        format: 'pdf',
        description: template.description,
        sections: template.sections
      };
      
      setReports(prev => [newReport, ...prev]);
    } catch (err) {
      setError('Erreur lors de la génération du rapport');
      console.error('Report generation error:', err);
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadReport = (report: Report) => {
    // Simulation de téléchargement
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${report.title}.${report.format}`;
    link.click();
  };

  const handleViewReport = (report: Report) => {
    // Simulation d'ouverture du rapport
    console.log('Opening report:', report.id);
  };

  const handleDeleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'generating': return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: Report['status']) => {
    switch (status) {
      case 'generating': return <Badge variant="outline" className="text-blue-600">Génération...</Badge>;
      case 'ready': return <Badge variant="outline" className="text-green-600">Prêt</Badge>;
      case 'error': return <Badge variant="outline" className="text-red-600">Erreur</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Chargement des rapports...</span>
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
              📋 Rapports Consolidés Direction
            </h1>
            <p className="text-muted-foreground text-lg">
              {currentUser?.firstName} {currentUser?.lastName} - {currentUser?.matricule}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Génération et gestion des rapports exécutifs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtrer
            </Button>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Rapport
            </Button>
          </div>
        </div>
      </div>

      {/* Statistiques Rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rapports Générés</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">+2 ce mois</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates Disponibles</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">Templates prédéfinis</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernier Rapport</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.length > 0 ? reports[0].createdAt.toLocaleDateString('fr-FR') : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Date de génération</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taille Moyenne</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.length > 0 ? 
                (reports.reduce((acc, r) => acc + parseFloat(r.size), 0) / reports.length).toFixed(1) + ' MB' : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">Taille moyenne</p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">Rapports Générés</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(report.status)}
                      <div>
                        <h3 className="font-semibold text-lg">{report.title}</h3>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            Créé: {report.createdAt.toLocaleDateString('fr-FR')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Taille: {report.size}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Format: {report.format.toUpperCase()}
                          </span>
                          {getStatusBadge(report.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReport(report)}
                        disabled={report.status === 'generating'}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report)}
                        disabled={report.status !== 'ready'}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteReport(report.id)}
                        disabled={report.status === 'generating'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {template.name}
                    {template.isDefault && (
                      <Badge variant="outline" className="text-xs">Par défaut</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Sections incluses:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {template.sections.map((section, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          {section}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleGenerateReport(template)}
                    disabled={generatingReport === template.id}
                  >
                    {generatingReport === template.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Générer
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
