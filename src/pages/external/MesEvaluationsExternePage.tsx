import { useState } from 'react';
import { FileCheck, Play, Clock, Lock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AppContext';
import { useCertificationPaths } from '@/hooks/useCertificationPaths';

export function MesEvaluationsExternePage() {
  const { currentUser } = useAuth();
  const { getMyProgress } = useCertificationPaths();

  const myProgress = getMyProgress(currentUser?.id || '');

  const getEvaluationStatus = (progress: any) => {
    if (progress.evaluationPassed === true) return 'passed';
    if (progress.evaluationPassed === false) return 'failed';
    if (progress.evaluationSubmittedAt) return 'submitted';
    if (progress.evaluationStartedAt) return 'in_progress';
    if (progress.evaluationAvailableDate) {
      const now = new Date();
      const availableDate = new Date(progress.evaluationAvailableDate);
      return now >= availableDate ? 'available' : 'locked';
    }
    return 'locked';
  };

  const getDaysUntilAvailable = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <FileCheck className="w-6 h-6 text-purple-600" />
          </div>
          Mes Évaluations
        </h1>
        <p className="text-muted-foreground mt-2">
          Tests de validation pour obtenir vos habilitations
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">À venir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {myProgress.filter(p => getEvaluationStatus(p) === 'locked').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {myProgress.filter(p => getEvaluationStatus(p) === 'available').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En correction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {myProgress.filter(p => getEvaluationStatus(p) === 'submitted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Réussies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {myProgress.filter(p => getEvaluationStatus(p) === 'passed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des évaluations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Évaluations de Certification</h2>
        
        {myProgress.length === 0 ? (
          <Card className="industrial-card">
            <CardContent className="text-center py-16">
              <FileCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Aucune évaluation</h3>
              <p className="text-muted-foreground">
                Les tests de certification apparaîtront ici.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myProgress.map((progress) => {
              const evalStatus = getEvaluationStatus(progress);
              const daysUntil = progress.evaluationAvailableDate 
                ? getDaysUntilAvailable(progress.evaluationAvailableDate)
                : 0;

              return (
                <Card key={progress.id} className="industrial-card">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        {/* Status Badge */}
                        <div className="flex items-center gap-2 mb-2">
                          {evalStatus === 'locked' && (
                            <Badge variant="secondary">
                              <Lock className="w-3 h-3 mr-1" />
                              Verrouillée
                            </Badge>
                          )}
                          {evalStatus === 'available' && (
                            <Badge className="bg-blue-500 animate-pulse">
                              ✨ Disponible maintenant
                            </Badge>
                          )}
                          {evalStatus === 'in_progress' && (
                            <Badge className="bg-yellow-500">
                              <Clock className="w-3 h-3 mr-1" />
                              En cours
                            </Badge>
                          )}
                          {evalStatus === 'submitted' && (
                            <Badge className="bg-purple-500">
                              En correction
                            </Badge>
                          )}
                          {evalStatus === 'passed' && (
                            <Badge className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Réussie
                            </Badge>
                          )}
                          {evalStatus === 'failed' && (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Échouée
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-semibold text-lg mb-1">
                          Test Qualification H2S
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Durée: 30 minutes • Score minimum: 85%
                        </p>

                        {/* Formation prerequisite */}
                        {!progress.trainingCompletedAt && (
                          <div className="p-3 bg-yellow-50 rounded text-sm text-yellow-800">
                            <Lock className="w-4 h-4 inline mr-1" />
                            Complétez d'abord la formation "Sensibilisation H2S"
                          </div>
                        )}

                        {/* Délai attente */}
                        {progress.trainingCompletedAt && evalStatus === 'locked' && daysUntil > 0 && (
                          <div className="p-3 bg-blue-50 rounded text-sm text-blue-800">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Disponible dans {daysUntil} jour{daysUntil > 1 ? 's' : ''} 
                            (le {progress.evaluationAvailableDate?.toLocaleDateString('fr-FR')})
                          </div>
                        )}

                        {/* En correction */}
                        {evalStatus === 'submitted' && (
                          <div className="p-3 bg-purple-50 rounded text-sm text-purple-800">
                            Soumis le {progress.evaluationSubmittedAt?.toLocaleDateString('fr-FR')}
                            - En attente de correction par le Responsable HSE
                          </div>
                        )}

                        {/* Résultat */}
                        {(evalStatus === 'passed' || evalStatus === 'failed') && (
                          <div className={`p-3 rounded ${
                            evalStatus === 'passed' ? 'bg-green-50' : 'bg-red-50'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className={`font-medium ${
                                evalStatus === 'passed' ? 'text-green-900' : 'text-red-900'
                              }`}>
                                Score: {progress.evaluationScore?.toFixed(1)}%
                              </span>
                              {evalStatus === 'passed' ? (
                                <Badge className="bg-green-600">✅ ADMIS</Badge>
                              ) : (
                                <Badge variant="destructive">❌ AJOURNÉ</Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div>
                        {evalStatus === 'available' && (
                          <Button className="gap-2">
                            <Play className="w-4 h-4" />
                            Passer le test
                          </Button>
                        )}
                        {evalStatus === 'in_progress' && (
                          <Button variant="outline" className="gap-2">
                            <Play className="w-4 h-4" />
                            Continuer
                          </Button>
                        )}
                        {evalStatus === 'locked' && (
                          <Button disabled className="gap-2">
                            <Lock className="w-4 h-4" />
                            Verrouillé
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

      {/* Informations */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="p-4 space-y-2 text-sm text-blue-800">
          <p>• <strong>Prérequis:</strong> Complétez la formation avant de passer l'évaluation</p>
          <p>• <strong>Délai:</strong> L'évaluation est disponible 7 jours après la formation</p>
          <p>• <strong>Score:</strong> Minimum 85% requis pour valider</p>
          <p>• <strong>Correction:</strong> Les réponses libres sont corrigées par le HSE (24-48h)</p>
        </CardContent>
      </Card>
    </div>
  );
}

