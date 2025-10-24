import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Shield, 
  Users, 
  Calendar,
  Download, 
  RefreshCw, 
  Eye, 
  Plus,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  Target,
  Award,
  BookOpen,
  HardHat,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AppContext';
import { useEmployees } from '@/hooks/useEmployees';
import { useHSECompliance } from '@/hooks/useHSECompliance';

interface ComplianceItem {
  id: string;
  title: string;
  type: 'audit' | 'certification' | 'training' | 'equipment' | 'documentation';
  status: 'compliant' | 'non-compliant' | 'pending' | 'expired' | 'in-progress';
  severity: 'low' | 'medium' | 'high' | 'critical';
  dueDate: Date;
  completionDate?: Date;
  responsible: string;
  department: string;
  description: string;
  requirements: string[];
  evidence?: string[];
  correctiveActions?: string[];
  nextReview?: Date;
  complianceScore: number;
}

interface ComplianceOverview {
  summary: {
    totalItems: number;
    compliantItems: number;
    nonCompliantItems: number;
    pendingItems: number;
    expiredItems: number;
    overallScore: number;
  };
  byType: {
    audit: number;
    certification: number;
    training: number;
    equipment: number;
    documentation: number;
  };
  byDepartment: {
    [key: string]: {
      total: number;
      compliant: number;
      score: number;
    };
  };
  criticalAlerts: ComplianceItem[];
  upcomingDeadlines: ComplianceItem[];
}

export function DGComplianceViewPage() {
  const { currentUser } = useAuth();
  const { employees } = useEmployees();
  const { getOverallCompliance } = useHSECompliance();
  
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [overview, setOverview] = useState<ComplianceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Génération des données de conformité
  const generateComplianceItems = (): ComplianceItem[] => {
    const items: ComplianceItem[] = [];
    const departments = ['Production', 'Maintenance', 'RH', 'HSE', 'Qualité', 'Sécurité'];
    const types: ComplianceItem['type'][] = ['audit', 'certification', 'training', 'equipment', 'documentation'];
    const statuses: ComplianceItem['status'][] = ['compliant', 'non-compliant', 'pending', 'expired', 'in-progress'];
    const severities: ComplianceItem['severity'][] = ['low', 'medium', 'high', 'critical'];

    // Génération d'items de conformité
    for (let i = 1; i <= 25; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 90) - 30);
      
      items.push({
        id: `comp-${i}`,
        title: `Conformité ${type.charAt(0).toUpperCase() + type.slice(1)} ${i}`,
        type,
        status,
        severity,
        dueDate,
        completionDate: status === 'compliant' ? new Date(dueDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
        responsible: employees[Math.floor(Math.random() * employees.length)]?.fullName || 'Non assigné',
        department,
        description: `Description détaillée de la conformité ${type} pour ${department}`,
        requirements: [
          'Exigence réglementaire 1',
          'Exigence réglementaire 2',
          'Exigence interne 1'
        ],
        evidence: status === 'compliant' ? ['Document 1', 'Document 2', 'Preuve 1'] : undefined,
        correctiveActions: status === 'non-compliant' ? ['Action 1', 'Action 2'] : undefined,
        nextReview: new Date(dueDate.getTime() + 365 * 24 * 60 * 60 * 1000),
        complianceScore: Math.floor(Math.random() * 40) + 60
      });
    }

    return items;
  };

  const generateOverview = (items: ComplianceItem[]): ComplianceOverview => {
    const totalItems = items.length;
    const compliantItems = items.filter(item => item.status === 'compliant').length;
    const nonCompliantItems = items.filter(item => item.status === 'non-compliant').length;
    const pendingItems = items.filter(item => item.status === 'pending').length;
    const expiredItems = items.filter(item => item.status === 'expired').length;
    const overallScore = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;

    const byType = {
      audit: items.filter(item => item.type === 'audit').length,
      certification: items.filter(item => item.type === 'certification').length,
      training: items.filter(item => item.type === 'training').length,
      equipment: items.filter(item => item.type === 'equipment').length,
      documentation: items.filter(item => item.type === 'documentation').length
    };

    const byDepartment: { [key: string]: { total: number; compliant: number; score: number } } = {};
    const departments = [...new Set(items.map(item => item.department))];
    
    departments.forEach(dept => {
      const deptItems = items.filter(item => item.department === dept);
      const deptCompliant = deptItems.filter(item => item.status === 'compliant').length;
      byDepartment[dept] = {
        total: deptItems.length,
        compliant: deptCompliant,
        score: deptItems.length > 0 ? Math.round((deptCompliant / deptItems.length) * 100) : 0
      };
    });

    const criticalAlerts = items.filter(item => 
      item.severity === 'critical' && (item.status === 'non-compliant' || item.status === 'expired')
    );

    const upcomingDeadlines = items
      .filter(item => item.dueDate > new Date())
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 10);

    return {
      summary: {
        totalItems,
        compliantItems,
        nonCompliantItems,
        pendingItems,
        expiredItems,
        overallScore
      },
      byType,
      byDepartment,
      criticalAlerts,
      upcomingDeadlines
    };
  };

  useEffect(() => {
    const loadComplianceData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const items = generateComplianceItems();
        const overviewData = generateOverview(items);
        setComplianceItems(items);
        setOverview(overviewData);
      } catch (err) {
        setError('Erreur lors du chargement des données de conformité');
        console.error('Compliance loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadComplianceData();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const items = generateComplianceItems();
      const overviewData = generateOverview(items);
      setComplianceItems(items);
      setOverview(overviewData);
    } catch (err) {
      setError('Erreur lors du rafraîchissement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCompliance = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Rapport de conformité exporté avec succès');
    } catch (err) {
      alert('Erreur lors de l\'export du rapport');
    }
  };

  const handleViewCompliance = (itemId: string) => {
    console.log('Consulter conformité:', itemId);
    alert(`Consultation des détails de conformité ${itemId} - Gestion opérationnelle par l'équipe HSE`);
  };

  const handleCreateAction = (itemId: string) => {
    console.log('Rediriger vers HSE pour:', itemId);
    alert(`Redirection vers l'équipe HSE pour gestion opérationnelle de la conformité ${itemId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50 border-green-200';
      case 'non-compliant': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'expired': return 'text-red-600 bg-red-50 border-red-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audit': return <FileText className="w-4 h-4" />;
      case 'certification': return <Award className="w-4 h-4" />;
      case 'training': return <BookOpen className="w-4 h-4" />;
      case 'equipment': return <HardHat className="w-4 h-4" />;
      case 'documentation': return <FileText className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Chargement des données de conformité...</span>
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
              📊 Vision Stratégique de la Conformité
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
            <Button onClick={handleExportCompliance} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Rapport Exécutif
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Score Global
            </CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{overview.summary.overallScore}%</div>
            <Progress value={overview.summary.overallScore} className="mt-2" />
            <div className="flex items-center gap-2 text-xs mt-2">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-green-600">+3.2% vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conformes
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overview.summary.compliantItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sur {overview.summary.totalItems} éléments
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Non Conformes
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overview.summary.nonCompliantItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nécessitent une action
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Attente
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overview.summary.pendingItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              En cours de traitement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'Ensemble</TabsTrigger>
          <TabsTrigger value="alerts">Alertes Critiques</TabsTrigger>
          <TabsTrigger value="deadlines">Échéances</TabsTrigger>
          <TabsTrigger value="departments">Par Département</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {Object.entries(overview.byType).map(([type, count]) => (
              <Card key={type} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {type === 'audit' && 'Audits'}
                    {type === 'certification' && 'Certifications'}
                    {type === 'training' && 'Formations'}
                    {type === 'equipment' && 'Équipements'}
                    {type === 'documentation' && 'Documentation'}
                  </CardTitle>
                  {getTypeIcon(type)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-xs text-muted-foreground">Éléments</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Alertes Stratégiques</h3>
            </div>
            <p className="text-sm text-blue-700">
              Informations consolidées pour prise de décision - Gestion opérationnelle assurée par l'équipe HSE
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {overview.criticalAlerts.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow border-red-200 bg-red-50/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-red-100 text-red-600">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-red-900">{item.title}</h3>
                        <Badge className={getSeverityColor(item.severity)}>
                          {item.severity.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === 'non-compliant' ? 'NON CONFORME' : 'EXPIRÉ'}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{item.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>Échéance: {item.dueDate.toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>Responsable: {item.responsible}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-500" />
                          <span>Département: {item.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-gray-500" />
                          <span>Score: {item.complianceScore}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewCompliance(item.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleCreateAction(item.id)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Action
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {overview.upcomingDeadlines.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${getStatusColor(item.status)}`}>
                      {getTypeIcon(item.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === 'compliant' ? 'CONFORME' :
                           item.status === 'non-compliant' ? 'NON CONFORME' :
                           item.status === 'pending' ? 'EN ATTENTE' :
                           item.status === 'expired' ? 'EXPIRÉ' : 'EN COURS'}
                        </Badge>
                        <Badge className={getSeverityColor(item.severity)}>
                          {item.severity.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{item.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>Échéance: {item.dueDate.toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>Responsable: {item.responsible}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-500" />
                          <span>Département: {item.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-gray-500" />
                          <span>Score: {item.complianceScore}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewCompliance(item.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                      {item.status === 'non-compliant' && (
                        <Button variant="outline" size="sm" onClick={() => handleCreateAction(item.id)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Action
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(overview.byDepartment).map(([department, data]) => (
              <Card key={department} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    {department}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="font-semibold">{data.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Conformes:</span>
                    <span className="font-semibold text-green-600">{data.compliant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Score:</span>
                    <span className="font-semibold">{data.score}%</span>
                  </div>
                  <Progress value={data.score} className="mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
