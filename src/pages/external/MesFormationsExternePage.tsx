import { useState } from 'react'
import { BookOpen, Play, CheckCircle, Clock, Award, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AppContext'
import { useCertificationPaths } from '@/hooks/useCertificationPaths'
import { useHSEContent } from '@/hooks/useHSEContent'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { HSETrainingModulePlayer } from '@/components/employee/HSETrainingModulePlayer'
import { HSEAssignment } from '@/types'
import { toast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function MesFormationsExternePage() {
  const { currentUser } = useAuth()
  const {
    getMyProgress,
    startTraining,
    completeTraining,
    paths,
    loading: pathsLoading,
  } = useCertificationPaths()
  const { getAssignmentsByEmployee, getContentForAssignment, updateAssignmentStatus } =
    useHSEContent()

  const myProgress = getMyProgress(currentUser?.id || '')
  const directAssignments = getAssignmentsByEmployee(currentUser?.id || '').filter(
    a => a.contentType === 'training',
  )

  const getPathData = (pathId: string) => {
    return paths.find(p => p.id === pathId)
  }

  const [activeTraining, setActiveTraining] = useState<HSEAssignment | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const handleStartDirectTraining = (assignment: HSEAssignment) => {
    try {
      setLoadingAction(assignment.id)
      updateAssignmentStatus(assignment.id, 'in_progress', { startedAt: new Date() })
      setActiveTraining(assignment)

      toast({
        title: 'Formation démarrée',
        description: 'Bonne formation !',
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de démarrer la formation',
        variant: 'destructive',
      })
    } finally {
      setLoadingAction(null)
    }
  }

  const handleCompleteDirectTraining = () => {
    if (activeTraining) {
      try {
        updateAssignmentStatus(activeTraining.id, 'completed', {
          completedAt: new Date(),
          score: 90,
        })
        setActiveTraining(null)

        toast({
          title: '✅ Formation complétée',
          description: 'Félicitations pour avoir terminé cette formation !',
        })
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de marquer la formation comme complétée',
          variant: 'destructive',
        })
      }
    }
  }

  const handleReviewTraining = (assignment: HSEAssignment) => {
    try {
      setActiveTraining(assignment)
      toast({
        title: 'Mode révision',
        description: 'Vous pouvez revoir le contenu de cette formation',
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la formation',
        variant: 'destructive',
      })
    }
  }

  const handleStartCertifTraining = async (progress: any) => {
    try {
      setLoadingAction(progress.id)
      await startTraining(progress.id, `assign_${progress.pathId}_${currentUser?.id}`)

      toast({
        title: 'Formation démarrée',
        description: 'Vous pouvez maintenant suivre cette formation',
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de démarrer la formation certifiante',
        variant: 'destructive',
      })
    } finally {
      setLoadingAction(null)
    }
  }

  const handleCompleteCertifTraining = async (progress: any) => {
    try {
      setLoadingAction(progress.id)
      await completeTraining(progress.id, 90, 7)

      toast({
        title: '🎉 Formation complétée !',
        description: "L'évaluation sera disponible dans 7 jours",
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer la formation comme complétée',
        variant: 'destructive',
      })
    } finally {
      setLoadingAction(null)
    }
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous devez être connecté pour accéder à vos formations.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (pathsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement de vos formations...</p>
        </div>
      </div>
    )
  }

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
          Modules de formation requis pour vos habilitations - Compte {currentUser.firstName}{' '}
          {currentUser.lastName}
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myProgress.length + directAssignments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {myProgress.filter(p => p.status === 'training_in_progress').length +
                directAssignments.filter(a => a.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Complétées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {myProgress.filter(p => p.trainingCompletedAt).length +
                directAssignments.filter(a => a.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des formations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Formations Assignées</h2>

        {myProgress.length === 0 && directAssignments.length === 0 ? (
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
            {/* Formations du Centre d'Envoi (assignations directes) */}
            {directAssignments.map(assignment => {
              const content = getContentForAssignment(assignment)
              if (!content) return null

              return (
                <Card key={assignment.id} className="industrial-card border-blue-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-600">📤 Centre d'Envoi</Badge>
                          {assignment.status === 'completed' ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Complétée
                            </Badge>
                          ) : assignment.status === 'in_progress' ? (
                            <Badge className="bg-blue-500">
                              <Clock className="w-3 h-3 mr-1" />
                              En cours
                            </Badge>
                          ) : (
                            <Badge variant="secondary">À faire</Badge>
                          )}
                        </div>

                        <h3 className="font-semibold text-lg mb-1">{content.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{content.description}</p>

                        {assignment.status === 'completed' && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>
                                Complétée le {assignment.completedAt?.toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            {assignment.score && (
                              <div className="flex items-center gap-1">
                                <Award className="w-4 h-4 text-purple-600" />
                                <span>Score: {assignment.score}%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        {assignment.status === 'sent' || assignment.status === 'received' ? (
                          <Button
                            className="gap-2"
                            onClick={() => handleStartDirectTraining(assignment)}
                            disabled={loadingAction === assignment.id}
                          >
                            {loadingAction === assignment.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            Commencer
                          </Button>
                        ) : assignment.status === 'in_progress' ? (
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => setActiveTraining(assignment)}
                          >
                            <Play className="w-4 h-4" />
                            Continuer
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleReviewTraining(assignment)}
                          >
                            <BookOpen className="w-4 h-4" />
                            Revoir
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* Formations des parcours certification */}
            {myProgress.map(progress => {
              const pathData = getPathData(progress.pathId)

              return (
                <Card key={progress.id} className="industrial-card border-purple-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-purple-600">🎓 Parcours Certifiant</Badge>
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
                          {pathData?.trainingTitle || 'Formation de certification'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Durée: {pathData?.trainingDuration || 4} heures • Module{' '}
                          {pathData?.trainingModuleId} • Suivi d'une évaluation
                        </p>

                        {progress.trainingCompletedAt && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>
                                Complétée le{' '}
                                {progress.trainingCompletedAt.toLocaleDateString('fr-FR')}
                              </span>
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
                          <div className="mt-2 p-2 bg-purple-50 rounded text-sm text-purple-800">
                            ⏭️ Évaluation disponible 7 jours après complétion
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {!progress.trainingStartedAt && (
                          <Button
                            className="gap-2"
                            onClick={() => handleStartCertifTraining(progress)}
                            disabled={loadingAction === progress.id}
                          >
                            {loadingAction === progress.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            Commencer
                          </Button>
                        )}
                        {progress.trainingStartedAt && !progress.trainingCompletedAt && (
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => handleCompleteCertifTraining(progress)}
                            disabled={loadingAction === progress.id}
                          >
                            {loadingAction === progress.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Terminer
                          </Button>
                        )}
                        {progress.trainingCompletedAt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              toast({
                                title: 'Révision disponible',
                                description:
                                  'La formation a été complétée. Vous pouvez consulter le certificat dans la section Évaluations.',
                              })
                            }}
                          >
                            <Award className="w-4 h-4" />
                            Certificat
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

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
              onComplete={handleCompleteDirectTraining}
              onCancel={() => setActiveTraining(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
