import { useState, useEffect } from 'react';
import { Download, Calendar, Users, AlertTriangle, CheckCircle, BarChart3, PlayCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusBadge } from '@/components/ui/status-badge';
import { useHSETrainingImporter } from '@/hooks/useHSETrainingImporter';
import { useAuth } from '@/contexts/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HSETrainingImporterProps {
  onImportComplete?: () => void;
}

export function HSETrainingImporter({ onImportComplete }: HSETrainingImporterProps) {
  const { hasAnyRole } = useAuth();
  const {
    isImporting,
    importProgress,
    lastImportResult,
    initializeCompleteHSESystem,
    generateComplianceReport,
    getImportStats,
    needsImport,
    resetProgress
  } = useHSETrainingImporter();

  const [complianceReport, setComplianceReport] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const canManageHSE = hasAnyRole(['ADMIN', 'HSE']);
  const importStats = getImportStats();
  const requiresImport = needsImport();

  useEffect(() => {
    if (lastImportResult?.complianceReport) {
      setComplianceReport(lastImportResult.complianceReport);
    }
  }, [lastImportResult]);

  const handleCompleteImport = async () => {
    try {
      resetProgress();
      const result = await initializeCompleteHSESystem();
      
      if (result?.complianceReport) {
        setComplianceReport(result.complianceReport);
      }
      
      onImportComplete?.();
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const report = await generateComplianceReport();
      setComplianceReport(report);
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress > 50) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'importing': return <Download className="w-4 h-4 animate-pulse" />;
      case 'analyzing': return <BarChart3 className="w-4 h-4 animate-pulse" />;
      case 'planning': return <Calendar className="w-4 h-4 animate-pulse" />;
      case 'simulating': return <PlayCircle className="w-4 h-4 animate-pulse" />;
      case 'reporting': return <Users className="w-4 h-4 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <RefreshCw className="w-4 h-4" />;
    }
  };

  if (!canManageHSE) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Seuls les administrateurs et responsables HSE peuvent accéder à la gestion des formations.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête et statut */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Système de Formation HSE SOGARA
          </CardTitle>
          <p className="text-muted-foreground">
            Importation et gestion intelligente du catalogue de formations HSE
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statut de l'importation */}
          {importStats && !requiresImport && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-900">Système initialisé</h3>
                  <p className="text-sm text-green-700">
                    Dernière importation: {formatDistanceToNow(importStats.lastImport, { addSuffix: true, locale: fr })}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-green-900">{importStats.modulesImported}</div>
                    <div className="text-green-700">Modules</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-900">{importStats.sessionsPlanned}</div>
                    <div className="text-green-700">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-900">{importStats.overallCompliance}%</div>
                    <div className="text-green-700">Conformité</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Besoin d'importation */}
          {requiresImport && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Le système de formation HSE n'est pas encore initialisé ou nécessite une mise à jour.
                Cliquez sur "Initialiser le système" pour importer les modules de formation.
              </AlertDescription>
            </Alert>
          )}

          {/* Progress de l'importation */}
          {isImporting && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {getStepIcon(importProgress.step)}
                <span className="text-sm font-medium">{importProgress.message}</span>
              </div>
              <Progress 
                value={importProgress.progress} 
                className="h-2"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleCompleteImport}
              disabled={isImporting}
              className="gap-2"
              variant={requiresImport ? "default" : "outline"}
            >
              <Download className="w-4 h-4" />
              {requiresImport ? 'Initialiser le système' : 'Réinitialiser'}
            </Button>
            
            {!requiresImport && (
              <Button 
                variant="outline" 
                onClick={handleGenerateReport}
                disabled={isImporting}
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Actualiser le rapport
              </Button>
            )}
            
            {complianceReport && (
              <Button 
                variant="ghost" 
                onClick={() => setShowDetails(!showDetails)}
                className="gap-2"
              >
                {showDetails ? 'Masquer' : 'Voir'} les détails
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rapport de conformité */}
      {complianceReport && showDetails && (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Résumé</TabsTrigger>
            <TabsTrigger value="categories">Par catégorie</TabsTrigger>
            <TabsTrigger value="roles">Par rôle</TabsTrigger>
            <TabsTrigger value="actions">Actions urgentes</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Employés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{complianceReport.summary.totalEmployees}</div>
                  <p className="text-xs text-muted-foreground">Total dans le système</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Conformité globale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {complianceReport.summary.overallCompliance}%
                  </div>
                  <StatusBadge 
                    status={complianceReport.summary.overallCompliance >= 90 ? 'Excellent' : 'À améliorer'}
                    variant={complianceReport.summary.overallCompliance >= 90 ? 'success' : 'warning'}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Sessions programmées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{complianceReport.summary.upcomingSessions}</div>
                  <p className="text-xs text-muted-foreground">Dans les prochains mois</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Formations critiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {complianceReport.summary.criticalTrainings}
                  </div>
                  <p className="text-xs text-muted-foreground">Modules obligatoires</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Conformité par catégorie de formation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceReport.byCategory.map((category: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{category.category}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.trainingsCount} formation(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{category.averageCompliance}%</div>
                        <Progress value={category.averageCompliance} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Conformité par rôle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceReport.byRole.map((role: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{role.role}</h3>
                        <p className="text-sm text-muted-foreground">
                          {role.employeesCount} employé(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {role.criticalIssues > 0 && (
                          <Badge variant="destructive">
                            {role.criticalIssues} problème(s)
                          </Badge>
                        )}
                        <div className="text-right">
                          <div className="text-lg font-bold">{role.averageCompliance}%</div>
                          <Progress value={role.averageCompliance} className="w-20 h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Actions urgentes à mener
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {complianceReport.urgentActions.map((action: any, index: number) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg border-l-4 ${
                          action.type === 'expired' 
                            ? 'bg-red-50 border-l-red-500' 
                            : 'bg-yellow-50 border-l-yellow-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{action.employeeName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {action.trainingTitle}
                            </p>
                          </div>
                          <div className="text-right">
                            <StatusBadge 
                              status={action.type === 'expired' ? 'Expirée' : 'Manquante'}
                              variant={action.type === 'expired' ? 'urgent' : 'warning'}
                            />
                            {action.daysOverdue && (
                              <p className="text-xs text-red-600 mt-1">
                                Expirée depuis {action.daysOverdue} jour(s)
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {complianceReport.urgentActions.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                        <p>Aucune action urgente requise</p>
                        <p className="text-sm">Tous les employés sont conformes aux exigences HSE</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
