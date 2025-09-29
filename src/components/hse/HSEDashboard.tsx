import { useState, useEffect } from 'react';
import { AlertTriangle, BookOpen, Shield, Plus, Calendar, FileText, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { HSEIncidentForm } from './HSEIncidentForm';
import { HSEIncidentTimeline } from './HSEIncidentTimeline';
import { HSETrainingCalendar } from './HSETrainingCalendar';
import { HSEComplianceDashboard } from './HSEComplianceDashboard';
import { HSETrainingImporter } from './HSETrainingImporter';
import { HSETrainingCatalog } from './HSETrainingCatalog';
import { HSESessionScheduler } from './HSESessionScheduler';
import { useAuth } from '@/contexts/AppContext';
import { useHSEIncidents } from '@/hooks/useHSEIncidents';
import { useHSETrainings } from '@/hooks/useHSETrainings';
import { useHSECompliance } from '@/hooks/useHSECompliance';
import { useHSEData } from '@/hooks/useHSEData';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { HSEIncident, HSETraining, HSETrainingSession } from '@/types';

export function HSEDashboard() {
  const { hasAnyRole } = useAuth();
  const { 
    incidents, 
    addIncident, 
    getStats: getIncidentStats, 
    initializeIncidents,
    getIncidentsByStatus,
    getRecentIncidents 
  } = useHSEIncidents();
  
  const { 
    trainings, 
    getStats: getTrainingStats, 
    initializeTrainings,
    getUpcomingSessions 
  } = useHSETrainings();
  
  const { getOverallCompliance } = useHSECompliance();
  
  // Initialiser les données de démonstration
  useHSEData();

  // États des dialogs
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [showIncidentDetails, setShowIncidentDetails] = useState<HSEIncident | null>(null);
  const [showTrainingSession, setShowTrainingSession] = useState<{training: HSETraining, session: HSETrainingSession} | null>(null);
  const [showSessionScheduler, setShowSessionScheduler] = useState<HSETraining | null>(null);
  
  const canManageHSE = hasAnyRole(['ADMIN', 'HSE', 'SUPERVISEUR']);
  const canViewHSE = hasAnyRole(['ADMIN', 'HSE', 'SUPERVISEUR', 'EMPLOYE']);

  // Initialiser les données
  useEffect(() => {
    initializeIncidents();
    initializeTrainings();
  }, [initializeIncidents, initializeTrainings]);

  // Récupérer les statistiques
  const incidentStats = getIncidentStats();
  const trainingStats = getTrainingStats();
  const complianceRate = getOverallCompliance();
  const upcomingSessions = getUpcomingSessions(7);
  const recentIncidents = getRecentIncidents(30);
  const openIncidents = getIncidentsByStatus('reported').concat(getIncidentsByStatus('investigating'));

  const handleIncidentSubmit = async (incidentData: Partial<HSEIncident>) => {
    await addIncident(incidentData as Omit<HSEIncident, 'id' | 'createdAt' | 'updatedAt' | 'status'>);
    setShowIncidentForm(false);
  };

  const handleSessionClick = (training: HSETraining, session: HSETrainingSession) => {
    setShowTrainingSession({ training, session });
  };

  const handleScheduleSession = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    if (training) {
      setShowSessionScheduler(training);
    }
  };

  const renderKPIs = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="industrial-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Incidents ouverts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{incidentStats.open}</div>
          <div className="flex items-center gap-2 mt-1">
            {incidentStats.highSeverity > 0 && (
              <Badge variant="destructive" className="text-xs">
                {incidentStats.highSeverity} sévérité élevée
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {incidentStats.thisMonth} ce mois
          </p>
        </CardContent>
      </Card>

      <Card className="industrial-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Formations cette semaine</CardTitle>
          <BookOpen className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingSessions.length}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Sessions programmées
          </p>
        </CardContent>
      </Card>

      <Card className="industrial-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taux de conformité</CardTitle>
          <Shield className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{complianceRate}%</div>
          <StatusBadge 
            status={complianceRate >= 90 ? 'Conforme' : 'À améliorer'}
            variant={complianceRate >= 90 ? 'success' : 'warning'}
            className="mt-2"
          />
        </CardContent>
      </Card>

      <Card className="industrial-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Actions requises</CardTitle>
          <TrendingUp className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {incidents.filter(i => i.status === 'investigating').length}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Enquêtes en cours
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderRecentIncidents = () => (
    <Card className="industrial-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Incidents récents
          </CardTitle>
          {canManageHSE && (
            <Button 
              size="sm" 
              onClick={() => setShowIncidentForm(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Déclarer un incident
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {recentIncidents.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium mb-2">Aucun incident récent</h3>
            <p className="text-muted-foreground">
              Excellente nouvelle ! Aucun incident n'a été signalé récemment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentIncidents.slice(0, 5).map((incident) => (
              <div 
                key={incident.id} 
                className="p-4 rounded-lg border border-border bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setShowIncidentDetails(incident)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">{incident.type}</h3>
                  <div className="flex items-center gap-2">
                    <StatusBadge 
                      status={incident.severity === 'low' ? 'Faible' : 
                             incident.severity === 'medium' ? 'Moyen' : 'Élevé'}
                      variant={incident.severity === 'low' ? 'info' : 
                              incident.severity === 'medium' ? 'warning' : 'urgent'}
                    />
                    <StatusBadge 
                      status={incident.status === 'reported' ? 'Signalé' : 
                             incident.status === 'investigating' ? 'En cours' : 'Résolu'}
                      variant={incident.status === 'reported' ? 'info' : 
                              incident.status === 'investigating' ? 'warning' : 'success'}
                    />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Lieu: {incident.location}</p>
                  <p>Date: {incident.occurredAt.toLocaleDateString('fr-FR')}</p>
                  <p>Déclaré par: {incident.reportedBy}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderUpcomingTrainings = () => (
    <Card className="industrial-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Formations à venir
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingSessions.length === 0 ? (
          <div className="text-center py-6">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune formation programmée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.slice(0, 3).map(({ training, session }) => (
              <div 
                key={session.id}
                className="p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSessionClick(training, session)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{training.title}</h4>
                  <StatusBadge 
                    status={session.status === 'scheduled' ? 'Programmé' : 'En cours'}
                    variant={session.status === 'scheduled' ? 'info' : 'warning'}
                  />
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>📅 {session.date.toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                  <p>👨‍🏫 {session.instructor}</p>
                  <p>👥 {session.attendance.length}/{session.maxParticipants} participants</p>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all" 
                      style={{ width: `${(session.attendance.length / session.maxParticipants) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!canViewHSE) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder au module HSE.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">HSE - Hygiène, Sécurité et Environnement</h1>
          <p className="text-muted-foreground">
            Gestion des incidents, formations et conformité réglementaire
          </p>
        </div>
        {canManageHSE && (
          <div className="flex gap-2">
            <Button onClick={() => setShowIncidentForm(true)} className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Déclarer un incident
            </Button>
          </div>
        )}
      </div>

      {/* KPIs */}
      {renderKPIs()}

      {/* Contenu principal par onglets */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="formations">Formations</TabsTrigger>
          <TabsTrigger value="compliance">Conformité</TabsTrigger>
          <TabsTrigger value="catalog">Catalogue</TabsTrigger>
          <TabsTrigger value="equipment">EPI</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderRecentIncidents()}
            {renderUpcomingTrainings()}
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          {renderRecentIncidents()}
          {openIncidents.length > 0 && (
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Incidents nécessitant une attention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {openIncidents.map(incident => (
                    <div 
                      key={incident.id}
                      className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                      onClick={() => setShowIncidentDetails(incident)}
                    >
                      <div>
                        <h4 className="font-medium">{incident.type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {incident.location} • {incident.occurredAt.toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <StatusBadge 
                        status={incident.status === 'reported' ? 'À traiter' : 'En cours'}
                        variant="warning"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="formations">
          <HSETrainingCalendar 
            trainings={trainings}
            onSessionClick={handleSessionClick}
            canEdit={canManageHSE}
          />
        </TabsContent>

        <TabsContent value="compliance">
          <HSEComplianceDashboard />
        </TabsContent>

        <TabsContent value="catalog" className="space-y-6">
          {/* Système d'importation */}
          <HSETrainingImporter onImportComplete={() => {
            // Recharger les données après importation
            initializeIncidents();
            initializeTrainings();
          }} />
          
          {/* Catalogue détaillé */}
          <HSETrainingCatalog 
            trainings={trainings}
            onScheduleSession={handleScheduleSession}
            canManage={canManageHSE}
          />
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle>Gestion des EPI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Module EPI</h3>
                <p className="text-muted-foreground">
                  La gestion des équipements de protection individuelle sera bientôt disponible.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showIncidentForm} onOpenChange={setShowIncidentForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <HSEIncidentForm 
            onSubmit={handleIncidentSubmit}
            onCancel={() => setShowIncidentForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!showIncidentDetails} onOpenChange={() => setShowIncidentDetails(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {showIncidentDetails && (
            <HSEIncidentTimeline 
              incident={showIncidentDetails}
              canEdit={canManageHSE}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!showTrainingSession} onOpenChange={() => setShowTrainingSession(null)}>
        <DialogContent className="max-w-2xl">
          {showTrainingSession && (
            <Card>
              <CardHeader>
                <CardTitle>{showTrainingSession.training.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {showTrainingSession.training.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Date:</span> {showTrainingSession.session.date.toLocaleDateString('fr-FR')}
                    </div>
                    <div>
                      <span className="font-medium">Formateur:</span> {showTrainingSession.session.instructor}
                    </div>
                    <div>
                      <span className="font-medium">Lieu:</span> {showTrainingSession.session.location}
                    </div>
                    <div>
                      <span className="font-medium">Durée:</span> {showTrainingSession.training.duration} min
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Participants inscrits</span>
                      <span>{showTrainingSession.session.attendance.length}/{showTrainingSession.session.maxParticipants}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(showTrainingSession.session.attendance.length / showTrainingSession.session.maxParticipants) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!showSessionScheduler} onOpenChange={() => setShowSessionScheduler(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {showSessionScheduler && (
            <HSESessionScheduler
              training={showSessionScheduler}
              onScheduled={(session) => {
                console.log('Session programmée:', session);
                setShowSessionScheduler(null);
                // Recharger les formations
                initializeTrainings();
              }}
              onCancel={() => setShowSessionScheduler(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}