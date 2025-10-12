import { useState } from 'react';
import { BookOpen, Play, CheckCircle, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AppContext';
import { useCertificationPaths } from '@/hooks/useCertificationPaths';

export function MesFormationsExternePage() {
  const { currentUser } = useAuth();
  const { getMyProgress } = useCertificationPaths();

  const myProgress = getMyProgress(currentUser?.id || '');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          Mes Formations
        </h1>
        <p className="text-muted-foreground mt-2">
          Modules de formation requis pour vos habilitations
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myProgress.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {myProgress.filter(p => p.status === 'training_in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Complétées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {myProgress.filter(p => p.trainingCompletedAt).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des formations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Formations Assignées</h2>
        
        {myProgress.length === 0 ? (
          <Card className="industrial-card">
            <CardContent className="text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Aucune formation assignée</h3>
              <p className="text-muted-foreground">
                Les formations requises pour vos habilitations apparaîtront ici.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myProgress.map((progress) => (
              <Card key={progress.id} className="industrial-card">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {progress.trainingCompletedAt ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complétée
                          </Badge>
                        ) : progress.trainingStartedAt ? (
                          <Badge className="bg-blue-500">
                            <Clock className="w-3 h-3 mr-1" />
                            En cours
                          </Badge>
                        ) : (
                          <Badge variant="secondary">À faire</Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-1">
                        Formation Sensibilisation H2S
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Durée: 4 heures • Module obligatoire
                      </p>

                      {progress.trainingCompletedAt && (
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Complétée le {progress.trainingCompletedAt.toLocaleDateString('fr-FR')}</span>
                          </div>
                          {progress.trainingScore && (
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4 text-purple-600" />
                              <span>Score: {progress.trainingScore}%</span>
                            </div>
                          )}
                        </div>
                      )}

                      {progress.evaluationAvailableDate && !progress.trainingCompletedAt && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                          Évaluation disponible 7 jours après complétion de cette formation
                        </div>
                      )}
                    </div>

                    <div>
                      {!progress.trainingStartedAt && (
                        <Button className="gap-2">
                          <Play className="w-4 h-4" />
                          Commencer
                        </Button>
                      )}
                      {progress.trainingStartedAt && !progress.trainingCompletedAt && (
                        <Button variant="outline" className="gap-2">
                          <Play className="w-4 h-4" />
                          Continuer
                        </Button>
                      )}
                      {progress.trainingCompletedAt && (
                        <Button variant="ghost" size="sm">
                          Revoir
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

