import { useState } from 'react';
import { FileCheck, Clock, CheckCircle, AlertTriangle, Award, Download, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AppContext';
import { useAssessments } from '@/hooks/useAssessments';
import { AssessmentSubmission } from '@/types';

export function MesEvaluationsPage() {
  const { currentUser } = useAuth();
  const { getMyCandidateSubmissions, loading } = useAssessments();
  const [selectedSubmission, setSelectedSubmission] = useState<AssessmentSubmission | null>(null);

  const mySubmissions = getMyCandidateSubmissions(currentUser?.id || '');

  const pending = mySubmissions.filter(s => s.status === 'assigned');
  const inProgress = mySubmissions.filter(s => s.status === 'in_progress');
  const submitted = mySubmissions.filter(s => s.status === 'submitted');
  const corrected = mySubmissions.filter(s => s.status === 'passed' || s.status === 'failed');

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: any; label: string; color: string }> = {
      'assigned': { variant: 'secondary', label: 'À faire', color: 'bg-yellow-100 text-yellow-800' },
      'in_progress': { variant: 'default', label: 'En cours', color: 'bg-blue-100 text-blue-800' },
      'submitted': { variant: 'secondary', label: 'Soumis', color: 'bg-purple-100 text-purple-800' },
      'passed': { variant: 'default', label: 'Réussi', color: 'bg-green-100 text-green-800' },
      'failed': { variant: 'destructive', label: 'Échoué', color: 'bg-red-100 text-red-800' },
    };
    return configs[status] || configs['assigned'];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 bg-orange-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-orange-600">
                  {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                </span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Bienvenue, {currentUser?.firstName} !
                </h1>
                <p className="text-muted-foreground">
                  {currentUser?.jobTitle}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{currentUser?.matricule}</Badge>
              <Badge className="bg-orange-500">Candidat Externe</Badge>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <div className="text-4xl font-bold text-orange-600">
              {corrected.filter(s => s.isPassed).length}
            </div>
            <p className="text-sm text-muted-foreground">Habilitation(s) obtenue(s)</p>
          </div>
        </div>
      </div>

      {/* Alerte si tests en attente */}
      {pending.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900">
                  {pending.length} test{pending.length > 1 ? 's' : ''} d'habilitation en attente
                </p>
                <p className="text-sm text-yellow-800">
                  Complétez vos tests pour obtenir les autorisations d'accès
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">À faire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pending.length}</div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{inProgress.length}</div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En correction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{submitted.length}</div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Habilitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {corrected.filter(s => s.isPassed).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mes Évaluations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Mes Tests d'Habilitation</h2>
        
        {mySubmissions.length === 0 ? (
          <Card className="industrial-card">
            <CardContent className="text-center py-16">
              <FileCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Aucune évaluation assignée</h3>
              <p className="text-muted-foreground">
                Les tests d'habilitation qui vous sont assignés apparaîtront ici.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {mySubmissions.map((submission) => {
              const statusConfig = getStatusBadge(submission.status);
              const assessment = null; // À récupérer depuis useAssessments
              
              return (
                <Card key={submission.id} className="industrial-card">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                          {submission.isPassed && (
                            <Badge className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Habilitation obtenue
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-1">
                          Test d'Habilitation Raffinerie
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Durée: 45 minutes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            <span>Score minimum: 80%</span>
                          </div>
                        </div>

                        {submission.status === 'assigned' && (
                          <p className="text-sm text-yellow-600">
                            Assigné le {submission.assignedAt.toLocaleDateString('fr-FR')}
                          </p>
                        )}

                        {submission.status === 'in_progress' && submission.startedAt && (
                          <p className="text-sm text-blue-600">
                            Commencé le {submission.startedAt.toLocaleDateString('fr-FR')}
                          </p>
                        )}

                        {submission.status === 'submitted' && submission.submittedAt && (
                          <p className="text-sm text-purple-600">
                            Soumis le {submission.submittedAt.toLocaleDateString('fr-FR')} - En attente de correction
                          </p>
                        )}

                        {(submission.status === 'passed' || submission.status === 'failed') && (
                          <div className="mt-2 p-3 bg-muted/30 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Résultat:</span>
                              <span className={`text-2xl font-bold ${
                                submission.isPassed ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {submission.score?.toFixed(1)}%
                              </span>
                            </div>
                            {submission.isPassed && submission.expiryDate && (
                              <p className="text-xs text-muted-foreground">
                                Habilitation valide jusqu'au {submission.expiryDate.toLocaleDateString('fr-FR')}
                              </p>
                            )}
                            {submission.correctorComments && (
                              <div className="mt-2 pt-2 border-t">
                                <p className="text-xs font-medium mb-1">Commentaire du correcteur:</p>
                                <p className="text-xs text-muted-foreground italic">
                                  "{submission.correctorComments}"
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {submission.status === 'assigned' && (
                          <Button className="gap-2 w-full md:w-auto">
                            <Play className="w-4 h-4" />
                            Commencer le test
                          </Button>
                        )}
                        
                        {submission.status === 'in_progress' && (
                          <Button variant="outline" className="gap-2 w-full md:w-auto">
                            <Play className="w-4 h-4" />
                            Continuer le test
                          </Button>
                        )}

                        {submission.status === 'submitted' && (
                          <Badge className="bg-purple-500 text-white px-4 py-2">
                            <Clock className="w-4 h-4 mr-1" />
                            En correction
                          </Badge>
                        )}

                        {submission.status === 'passed' && submission.certificateUrl && (
                          <>
                            <Button variant="outline" className="gap-2 w-full md:w-auto">
                              <Download className="w-4 h-4" />
                              Certificat
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              Voir détails
                            </Button>
                          </>
                        )}

                        {submission.status === 'failed' && (
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedSubmission(submission)}
                            className="w-full md:w-auto"
                          >
                            Voir résultats
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Informations Importantes */}
      <Card className="industrial-card bg-blue-50/50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Informations Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>• Les tests d'habilitation sont obligatoires pour accéder aux zones de production</p>
          <p>• Un score minimum de 80% est requis pour réussir</p>
          <p>• Les questions à réponse libre seront corrigées par le Responsable HSE</p>
          <p>• Vous recevrez vos résultats par email sous 24-48 heures</p>
          <p>• Les certificats d'habilitation sont valables 12 mois</p>
          <p>• En cas d'échec, vous pourrez repasser le test après 7 jours</p>
        </CardContent>
      </Card>

      {/* Dialog Détails Résultat */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du Résultat</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-5xl font-bold mb-2 ${
                  selectedSubmission.isPassed ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedSubmission.score?.toFixed(1)}%
                </div>
                <Badge className={selectedSubmission.isPassed ? 'bg-green-500' : 'bg-red-500'}>
                  {selectedSubmission.isPassed ? 'ADMIS' : 'AJOURNÉ'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-muted rounded">
                  <div className="font-bold text-2xl">{selectedSubmission.earnedPoints}</div>
                  <div className="text-muted-foreground">Points obtenus</div>
                </div>
                <div className="text-center p-3 bg-muted rounded">
                  <div className="font-bold text-2xl">{selectedSubmission.totalPoints}</div>
                  <div className="text-muted-foreground">Points total</div>
                </div>
              </div>

              {selectedSubmission.correctorComments && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-sm mb-2">Commentaire du correcteur:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubmission.correctorComments}
                  </p>
                </div>
              )}

              {selectedSubmission.isPassed && (
                <>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-900">Habilitation Accordée</span>
                    </div>
                    <p className="text-sm text-green-800 mb-1">
                      Accès Zones Production Autorisé
                    </p>
                    {selectedSubmission.expiryDate && (
                      <p className="text-xs text-green-700">
                        Valide jusqu'au {selectedSubmission.expiryDate.toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>

                  {selectedSubmission.certificateUrl && (
                    <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                      <Download className="w-4 h-4" />
                      Télécharger mon certificat d'habilitation
                    </Button>
                  )}
                </>
              )}

              {!selectedSubmission.isPassed && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">
                    Score insuffisant (minimum requis: 80%). Vous pourrez repasser le test après 7 jours.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

