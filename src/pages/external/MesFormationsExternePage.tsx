import { useState } from 'react'
import { BookOpen, Play, CheckCircle, Clock, Award } from 'lucide-react'
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

export function MesFormationsExternePage() {
  const { currentUser } = useAuth()
  const { getMyProgress, startTraining, completeTraining, paths } = useCertificationPaths()
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

  const handleStartDirectTraining = (assignment: HSEAssignment) => {
    updateAssignmentStatus(assignment.id, 'in_progress', { startedAt: new Date() })
    setActiveTraining(assignment)
  }

  const handleCompleteDirectTraining = () => {
    if (activeTraining) {
      updateAssignmentStatus(activeTraining.id, 'completed', {
        completedAt: new Date(),
        score: 90,
      })
      setActiveTraining(null)
    }
  }

  const handleStartCertifTraining = async (progress: any) => {
    await startTraining(progress.id, `assign_${progress.pathId}_${currentUser?.id}`)
  }

  const handleCompleteCertifTraining = async (progress: any) => {
    await completeTraining(progress.id, 90, 7)
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
                          >
                            <Play className="w-4 h-4" />
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
                          <Button variant="ghost" size="sm">
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

                      <div>
                        {!progress.trainingStartedAt && (
                          <Button
                            className="gap-2"
                            onClick={() => handleStartCertifTraining(progress)}
                          >
                            <Play className="w-4 h-4" />
                            Commencer
                          </Button>
                        )}
                        {progress.trainingStartedAt && !progress.trainingCompletedAt && (
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => handleCompleteCertifTraining(progress)}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Terminer
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
