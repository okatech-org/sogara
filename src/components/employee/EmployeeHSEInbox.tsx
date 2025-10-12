import { useState } from 'react';
import { Shield, BookOpen, AlertTriangle, FileText, CheckCircle, Clock, Download, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEmployeeHSEInbox } from '@/hooks/useEmployeeHSEInbox';
import { useHSEContent } from '@/hooks/useHSEContent';
import { HSEAssignment } from '@/types';
import { HSETrainingModulePlayer } from './HSETrainingModulePlayer';

interface EmployeeHSEInboxProps {
  employeeId: string;
  compact?: boolean;
}

export function EmployeeHSEInbox({ employeeId, compact = false }: EmployeeHSEInboxProps) {
  const {
    myTrainings,
    myAlerts,
    myDocuments,
    unreadCount,
    pendingTrainings,
    completedTrainings,
    complianceRate,
    acknowledgeItem,
    markAsRead,
    startTraining,
    getContentForAssignment
  } = useEmployeeHSEInbox(employeeId);

  const { assignments } = useHSEContent();
  const [activeTraining, setActiveTraining] = useState<HSEAssignment | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusColor = (status: HSEAssignment['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'expired': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const renderTrainingCard = (assignment: HSEAssignment) => {
    const content = getContentForAssignment(assignment);
    if (!content) return null;

    const isOverdue = assignment.dueDate && assignment.dueDate < new Date() && assignment.status !== 'completed';

    return (
      <Card 
        key={assignment.id} 
        className={`${compact ? '' : 'industrial-card'} ${isOverdue ? 'border-red-200' : ''}`}
      >
        <CardContent className={compact ? 'p-4' : 'p-5'}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getPriorityColor(content.priority)}>
                  {content.priority === 'critical' ? 'CRITIQUE' : content.priority}
                </Badge>
                {assignment.status === 'completed' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Complétée
                  </Badge>
                )}
                {isOverdue && (
                  <Badge variant="destructive">
                    <Clock className="w-3 h-3 mr-1" />
                    Retard
                  </Badge>
                )}
              </div>
              <h4 className="font-semibold text-foreground mb-1">{content.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">{content.description}</p>
              
              {assignment.dueDate && (
                <p className="text-xs text-muted-foreground">
                  Échéance: {assignment.dueDate.toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>

          {assignment.status === 'in_progress' && assignment.progress !== undefined && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Progression</span>
                <span>{assignment.progress}%</span>
              </div>
              <Progress value={assignment.progress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2">
            {assignment.status === 'sent' || assignment.status === 'received' ? (
              <Button 
                size="sm" 
                onClick={() => {
                  markAsRead(assignment.id);
                  startTraining(assignment.id);
                  setActiveTraining(assignment);
                }}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Démarrer
              </Button>
            ) : assignment.status === 'in_progress' ? (
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2"
                onClick={() => setActiveTraining(assignment)}
              >
                <Play className="w-4 h-4" />
                Continuer
              </Button>
            ) : assignment.status === 'completed' && assignment.certificate ? (
              <Button size="sm" variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Certificat
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAlertCard = (assignment: HSEAssignment) => {
    const content = getContentForAssignment(assignment);
    if (!content) return null;

    const isUnread = assignment.status === 'sent' || assignment.status === 'received';

    return (
      <Card 
        key={assignment.id} 
        className={`${compact ? '' : 'industrial-card'} ${isUnread ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
      >
        <CardContent className={compact ? 'p-4' : 'p-5'}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              content.priority === 'critical' || content.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-foreground">{content.title}</h4>
                {isUnread && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">{content.alertMessage || content.description}</p>
              <p className="text-xs text-muted-foreground">
                Envoyée le {assignment.assignedAt.toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {isUnread && (
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => acknowledgeItem(assignment.id)}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Accusé de réception
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDocumentCard = (assignment: HSEAssignment) => {
    const content = getContentForAssignment(assignment);
    if (!content) return null;

    return (
      <Card key={assignment.id} className={compact ? '' : 'industrial-card'}>
        <CardContent className={compact ? 'p-4' : 'p-5'}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">{content.documentName || content.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">{content.description}</p>
              <p className="text-xs text-muted-foreground">
                Partagé le {assignment.assignedAt.toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                markAsRead(assignment.id);
                window.open(content.documentUrl, '_blank');
              }}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (compact) {
    return (
      <>
        <div className="space-y-3">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary">
            {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
          </Badge>
          <Badge className={complianceRate >= 90 ? 'bg-green-500' : complianceRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}>
            Conformité: {complianceRate}%
          </Badge>
        </div>

        <Tabs defaultValue="trainings" className="space-y-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trainings">
              Formations ({myTrainings.length})
            </TabsTrigger>
            <TabsTrigger value="alerts">
              Alertes ({myAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="documents">
              Documents ({myDocuments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trainings" className="space-y-2">
            {pendingTrainings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Aucune formation en attente
              </p>
            ) : (
              pendingTrainings.slice(0, 3).map(renderTrainingCard)
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-2">
            {myAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Aucune alerte
              </p>
            ) : (
              myAlerts.slice(0, 3).map(renderAlertCard)
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-2">
            {myDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Aucun document
              </p>
            ) : (
              myDocuments.slice(0, 3).map(renderDocumentCard)
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog Module de Formation (mode compact) */}
      <Dialog open={!!activeTraining} onOpenChange={() => setActiveTraining(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Module de Formation Interactive</DialogTitle>
          </DialogHeader>
          {activeTraining && (
            <HSETrainingModulePlayer
              assignment={activeTraining}
              employeeId={employeeId}
              onComplete={() => setActiveTraining(null)}
              onCancel={() => setActiveTraining(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* En-tête avec statut conformité */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Mon Espace HSE
          </h2>
          <p className="text-muted-foreground">
            Formations, alertes et documents personnels
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${
            complianceRate >= 90 ? 'text-green-600' : 
            complianceRate >= 70 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {complianceRate}%
          </div>
          <p className="text-sm text-muted-foreground">Conformité HSE</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Formations en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingTrainings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Complétées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTrainings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alertes non lues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {myAlerts.filter(a => a.status === 'sent' || a.status === 'received').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Documents disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{myDocuments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu */}
      <Tabs defaultValue="trainings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trainings">
            <BookOpen className="w-4 h-4 mr-2" />
            Mes Formations ({myTrainings.length})
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Alertes & Infos ({myAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" />
            Documents ({myDocuments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trainings" className="space-y-4">
          {myTrainings.length === 0 ? (
            <Card className="industrial-card">
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Aucune formation assignée</h3>
                <p className="text-sm text-muted-foreground">
                  Les formations HSE qui vous sont attribuées apparaîtront ici.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myTrainings.map(renderTrainingCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {myAlerts.length === 0 ? (
            <Card className="industrial-card">
              <CardContent className="text-center py-12">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Aucune alerte</h3>
                <p className="text-sm text-muted-foreground">
                  Les alertes et informations HSE apparaîtront ici.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myAlerts.map(renderAlertCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {myDocuments.length === 0 ? (
            <Card className="industrial-card">
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Aucun document</h3>
                <p className="text-sm text-muted-foreground">
                  Les documents et procédures HSE partagés avec vous apparaîtront ici.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myDocuments.map(renderDocumentCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>

    {/* Dialog Module de Formation */}
    <Dialog open={!!activeTraining} onOpenChange={() => setActiveTraining(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Module de Formation Interactive</DialogTitle>
        </DialogHeader>
        {activeTraining && (
          <HSETrainingModulePlayer
            assignment={activeTraining}
            employeeId={employeeId}
            onComplete={() => {
              setActiveTraining(null);
            }}
            onCancel={() => setActiveTraining(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  </>
  );
}

