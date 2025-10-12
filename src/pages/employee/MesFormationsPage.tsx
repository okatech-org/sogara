import { useState } from 'react';
import { BookOpen, Trophy, Clock, CheckCircle, AlertTriangle, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AppContext';
import { useEmployeeHSEInbox } from '@/hooks/useEmployeeHSEInbox';
import { HSETrainingModulePlayer } from '@/components/employee/HSETrainingModulePlayer';
import { HSEAssignment } from '@/types';

export function MesFormationsPage() {
  const { currentUser } = useAuth();
  const {
    myTrainings,
    pendingTrainings,
    completedTrainings,
    complianceRate,
    startTraining,
    markAsRead,
    getContentForAssignment
  } = useEmployeeHSEInbox(currentUser?.id || '');

  const [activeTraining, setActiveTraining] = useState<HSEAssignment | null>(null);

  const inProgressTrainings = myTrainings.filter(t => t.status === 'in_progress');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'CRITIQUE';
      case 'high': return 'HAUTE';
      case 'medium': return 'MOYENNE';
      default: return 'BASSE';
    }
  };

  const renderTrainingCard = (assignment: HSEAssignment) => {
    const content = getContentForAssignment(assignment);
    if (!content) return null;

    const isOverdue = assignment.dueDate && assignment.dueDate < new Date() && assignment.status !== 'completed';
    const priority = assignment.metadata?.priority as string || 'medium';

    return (
      <Card key={assignment.id} className={`industrial-card ${isOverdue ? 'border-red-300' : ''}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getPriorityColor(priority)}>
                  {getPriorityLabel(priority)}
                </Badge>
                {assignment.status === 'completed' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Complétée
                  </Badge>
                )}
                {assignment.status === 'in_progress' && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Clock className="w-3 h-3 mr-1" />
                    En cours
                  </Badge>
                )}
                {isOverdue && (
                  <Badge variant="destructive">
                    Retard
                  </Badge>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">{content.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{content.description}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                {assignment.dueDate && (
                  <div>
                    <span className="font-medium">Échéance:</span>{' '}
                    {assignment.dueDate.toLocaleDateString('fr-FR')}
                  </div>
                )}
                <div>
                  <span className="font-medium">Assignée le:</span>{' '}
                  {assignment.assignedAt.toLocaleDateString('fr-FR')}
                </div>
              </div>

              {assignment.status === 'in_progress' && assignment.progress !== undefined && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Progression</span>
                    <span>{assignment.progress}%</span>
                  </div>
                  <Progress value={assignment.progress} className="h-2" />
                </div>
              )}

              {assignment.status === 'completed' && (
                <div className="grid grid-cols-2 gap-2 text-xs bg-green-50 p-3 rounded">
                  <div>
                    <span className="font-medium">Score:</span> {assignment.score}%
                  </div>
                  <div>
                    <span className="font-medium">Complétée le:</span>{' '}
                    {assignment.completedAt?.toLocaleDateString('fr-FR')}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {(assignment.status === 'sent' || assignment.status === 'received') && (
              <Button
                onClick={() => {
                  markAsRead(assignment.id);
                  startTraining(assignment.id);
                  setActiveTraining(assignment);
                }}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Démarrer la formation
              </Button>
            )}
            {assignment.status === 'in_progress' && (
              <Button
                onClick={() => setActiveTraining(assignment)}
                variant="outline"
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Continuer la formation
              </Button>
            )}
            {assignment.status === 'completed' && assignment.certificate && (
              <Button variant="outline" className="gap-2">
                <Trophy className="w-4 h-4" />
                Télécharger le certificat
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            Mes Formations HSE
          </h1>
          <p className="text-muted-foreground mt-2">
            Suivi de mes formations et certifications sécurité
          </p>
        </div>
        
        <div className="text-center md:text-right">
          <div className={`text-4xl font-bold mb-1 ${
            complianceRate >= 90 ? 'text-green-600' :
            complianceRate >= 70 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {complianceRate}%
          </div>
          <p className="text-sm text-muted-foreground">Ma conformité HSE</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total formations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myTrainings.length}</div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingTrainings.length}</div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{inProgressTrainings.length}</div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Complétées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedTrainings.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets par statut */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            <AlertTriangle className="w-4 h-4 mr-2" />
            À faire ({pendingTrainings.length})
          </TabsTrigger>
          <TabsTrigger value="inprogress">
            <Clock className="w-4 h-4 mr-2" />
            En cours ({inProgressTrainings.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="w-4 h-4 mr-2" />
            Complétées ({completedTrainings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingTrainings.length === 0 ? (
            <Card className="industrial-card">
              <CardContent className="text-center py-16">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-semibold mb-2">Toutes vos formations sont à jour !</h3>
                <p className="text-muted-foreground">
                  Vous n'avez aucune formation en attente. Excellent travail !
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingTrainings.map(renderTrainingCard)
          )}
        </TabsContent>

        <TabsContent value="inprogress" className="space-y-4">
          {inProgressTrainings.length === 0 ? (
            <Card className="industrial-card">
              <CardContent className="text-center py-16">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Aucune formation en cours</h3>
                <p className="text-muted-foreground">
                  Les formations que vous avez commencées apparaîtront ici.
                </p>
              </CardContent>
            </Card>
          ) : (
            inProgressTrainings.map(renderTrainingCard)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTrainings.length === 0 ? (
            <Card className="industrial-card">
              <CardContent className="text-center py-16">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Aucune formation complétée</h3>
                <p className="text-muted-foreground">
                  Vos certifications et formations complétées apparaîtront ici.
                </p>
              </CardContent>
            </Card>
          ) : (
            completedTrainings.map(renderTrainingCard)
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Module Formation */}
      <Dialog open={!!activeTraining} onOpenChange={() => setActiveTraining(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Module de Formation Interactive</DialogTitle>
          </DialogHeader>
          {activeTraining && (
            <HSETrainingModulePlayer
              assignment={activeTraining}
              employeeId={currentUser?.id || ''}
              onComplete={() => setActiveTraining(null)}
              onCancel={() => setActiveTraining(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

