import { CheckCircle, AlertTriangle, Clock, Database, Users, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { useHSEIncidents } from '@/hooks/useHSEIncidents';
import { useHSETrainings } from '@/hooks/useHSETrainings';
import { useHSECompliance } from '@/hooks/useHSECompliance';
import { useHSETrainingImporter } from '@/hooks/useHSETrainingImporter';

interface HSESystemStatusProps {
  onAction?: (action: string) => void;
}

export function HSESystemStatus({ onAction }: HSESystemStatusProps) {
  const { state } = useApp();
  const { incidents, loading: incidentsLoading, initialized: incidentsInit } = useHSEIncidents();
  const { trainings, loading: trainingsLoading, initialized: trainingsInit } = useHSETrainings();
  const { getOverallCompliance } = useHSECompliance();
  const { needsImport, getImportStats } = useHSETrainingImporter();

  const systemHealth = {
    employees: state.employees.length,
    incidents: incidents.length,
    trainings: trainings.length,
    notifications: state.notifications.length,
    compliance: getOverallCompliance(),
    dataInitialized: incidentsInit && trainingsInit,
    trainingSystemReady: !needsImport(),
    importStats: getImportStats()
  };

  const getStatusIcon = (status: boolean) => {
    return status ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const getStatusVariant = (status: boolean) => {
    return status ? 'success' : 'destructive';
  };

  return (
    <Card className="industrial-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          État du Système HSE
        </CardTitle>
        <p className="text-muted-foreground">
          Diagnostic des composants et données du module HSE
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statut général */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(systemHealth.dataInitialized)}
              <span className="font-medium">Données initialisées</span>
            </div>
            <Badge variant={getStatusVariant(systemHealth.dataInitialized)}>
              {systemHealth.dataInitialized ? 'OK' : 'Erreur'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(systemHealth.trainingSystemReady)}
              <span className="font-medium">Système de formation</span>
            </div>
            <Badge variant={getStatusVariant(systemHealth.trainingSystemReady)}>
              {systemHealth.trainingSystemReady ? 'Prêt' : 'À configurer'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(systemHealth.compliance >= 90)}
              <span className="font-medium">Conformité globale</span>
            </div>
            <Badge variant={systemHealth.compliance >= 90 ? 'success' : 'warning'}>
              {systemHealth.compliance}%
            </Badge>
          </div>
        </div>

        {/* Compteurs de données */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{systemHealth.employees}</div>
            <div className="text-sm text-muted-foreground">Employés</div>
          </div>

          <div className="text-center p-4 border rounded-lg">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{systemHealth.incidents}</div>
            <div className="text-sm text-muted-foreground">Incidents</div>
          </div>

          <div className="text-center p-4 border rounded-lg">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{systemHealth.trainings}</div>
            <div className="text-sm text-muted-foreground">Formations</div>
          </div>

          <div className="text-center p-4 border rounded-lg">
            <Clock className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{systemHealth.notifications}</div>
            <div className="text-sm text-muted-foreground">Notifications</div>
          </div>
        </div>

        {/* Actions recommandées */}
        <div className="space-y-3">
          <h4 className="font-medium">Actions recommandées</h4>
          
          {!systemHealth.trainingSystemReady && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <h5 className="font-medium text-yellow-800">Initialiser le système de formation</h5>
                <p className="text-sm text-yellow-700">
                  Importez les modules de formation pour activer toutes les fonctionnalités.
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => onAction?.('init-training-system')}
              >
                Initialiser
              </Button>
            </div>
          )}

          {systemHealth.compliance < 90 && (
            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div>
                <h5 className="font-medium text-orange-800">Améliorer la conformité</h5>
                <p className="text-sm text-orange-700">
                  Le taux de conformité est de {systemHealth.compliance}%. Objectif: ≥90%.
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onAction?.('view-compliance')}
              >
                Voir détails
              </Button>
            </div>
          )}

          {systemHealth.incidents === 0 && (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <h5 className="font-medium text-green-800">Excellent travail !</h5>
                <p className="text-sm text-green-700">
                  Aucun incident récent. Continuez sur cette voie !
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          )}
        </div>

        {/* Informations système avancées */}
        {systemHealth.importStats && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Dernière importation</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">Date:</span> {systemHealth.importStats.lastImport.toLocaleDateString('fr-FR')}
              </p>
              <p>
                <span className="font-medium">Modules:</span> {systemHealth.importStats.modulesImported}
              </p>
              <p>
                <span className="font-medium">Sessions:</span> {systemHealth.importStats.sessionsPlanned}
              </p>
              <p>
                <span className="font-medium">Conformité:</span> {systemHealth.importStats.overallCompliance}%
              </p>
            </div>
          </div>
        )}

        {/* Indicateur de charge */}
        {(incidentsLoading || trainingsLoading) && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Chargement en cours...</p>
            <Progress value={75} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
