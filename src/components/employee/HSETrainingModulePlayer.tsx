import { useState, useEffect } from 'react'
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Check,
  Award,
  Download,
  Play,
  Pause,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useEmployeeHSEInbox } from '@/hooks/useEmployeeHSEInbox'
import { HSEAssignment, HSETrainingModule, HSEQuestion } from '@/types'
import { toast } from '@/hooks/use-toast'
import hseModulesData from '@/data/hse-training-modules.json'

interface HSETrainingModulePlayerProps {
  assignment: HSEAssignment
  employeeId: string
  onComplete: () => void
  onCancel: () => void
}

export function HSETrainingModulePlayer({
  assignment,
  employeeId,
  onComplete,
  onCancel,
}: HSETrainingModulePlayerProps) {
  const { updateProgress, completeTraining } = useEmployeeHSEInbox(employeeId)
  const trainingModules = hseModulesData.hseTrainingModules as HSETrainingModule[]

  const trainingModule = trainingModules.find(t => t.id === assignment.metadata?.trainingId)

  const [currentStep, setCurrentStep] = useState(0)
  const [isQuizMode, setIsQuizMode] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [showCertificate, setShowCertificate] = useState(false)

  // Générer des questions de quiz basiques
  const quizQuestions: HSEQuestion[] = [
    {
      id: 'q1',
      text: `Quelle est la durée de validité de la formation "${trainingModule?.title}" ?`,
      type: 'multiple_choice',
      options: ['6 mois', '12 mois', '24 mois', '36 mois'],
      correctAnswer: `${trainingModule?.validityMonths || 12} mois`,
      explanation: `Cette formation est valide pendant ${trainingModule?.validityMonths || 12} mois.`,
    },
    {
      id: 'q2',
      text: 'Le port des EPI est-il obligatoire en permanence sur le site ?',
      type: 'true_false',
      options: ['Vrai', 'Faux'],
      correctAnswer: 'Vrai',
      explanation: 'Le port des EPI est obligatoire en permanence pour votre sécurité.',
    },
    {
      id: 'q3',
      text: `Cette formation est-elle obligatoire pour votre poste ?`,
      type: 'true_false',
      options: ['Vrai', 'Faux'],
      correctAnswer: 'Vrai',
      explanation: 'Cette formation est requise pour votre fonction.',
    },
  ]

  const totalSteps = (trainingModule?.objectives.length || 3) + 1 // +1 pour le quiz
  const progress = Math.round((currentStep / totalSteps) * 100)

  useEffect(() => {
    if (progress > 0 && progress < 100) {
      updateProgress(assignment.id, progress)
    }
  }, [progress, assignment.id, updateProgress])

  const handleNext = () => {
    if (currentStep < (trainingModule?.objectives.length || 3) - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Passer au quiz
      setIsQuizMode(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleQuizAnswer = (questionId: string, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmitQuiz = () => {
    let correct = 0
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        correct++
      }
    })

    const score = Math.round((correct / quizQuestions.length) * 100)
    setQuizScore(score)

    const passingScore = trainingModule?.certification?.passingScore || 80

    if (score >= passingScore) {
      // Générer certificat
      const certificateUrl = `certificate_${assignment.id}_${Date.now()}.pdf`
      completeTraining(assignment.id, score, certificateUrl)

      setShowCertificate(true)

      toast({
        title: '🎉 Formation réussie !',
        description: `Score: ${score}% - Certificat généré`,
      })
    } else {
      toast({
        title: 'Score insuffisant',
        description: `Vous avez obtenu ${score}%. Minimum requis: ${passingScore}%. Vous pouvez réessayer.`,
        variant: 'destructive',
      })
    }
  }

  const handleDownloadCertificate = () => {
    toast({
      title: 'Téléchargement',
      description: 'Le certificat sera disponible dans quelques instants',
    })
    setTimeout(() => {
      onComplete()
    }, 1000)
  }

  if (!trainingModule) {
    return (
      <div className="text-center py-12">
        <Alert>
          <AlertDescription>
            Module de formation non trouvé. Contactez le service HSE.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (showCertificate) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <Award className="w-12 h-12 text-green-600" />
          </div>

          <h2 className="text-3xl font-bold mb-2">🎉 Félicitations !</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Vous avez complété la formation avec succès
          </p>

          <Card className="max-w-2xl mx-auto mb-6">
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-2">{trainingModule.title}</h3>
                  <Badge className="mb-4">{trainingModule.code}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-muted rounded">
                    <div className="text-2xl font-bold text-green-600">{quizScore}%</div>
                    <div className="text-muted-foreground">Score obtenu</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded">
                    <div className="text-2xl font-bold text-primary">
                      {trainingModule.validityMonths}
                    </div>
                    <div className="text-muted-foreground">Mois de validité</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-center text-muted-foreground">
                    Ce certificat est valide jusqu'au{' '}
                    {new Date(
                      Date.now() + trainingModule.validityMonths * 30 * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-center">
            <Button onClick={handleDownloadCertificate} className="gap-2">
              <Download className="w-4 h-4" />
              Télécharger le certificat
            </Button>
            <Button variant="outline" onClick={onComplete}>
              Retour à mon espace HSE
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isQuizMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Évaluation Finale</h2>
            <p className="text-muted-foreground">
              {trainingModule.title} - {quizQuestions.length} questions
            </p>
          </div>
          <Badge>Score minimum: {trainingModule.certification?.passingScore || 80}%</Badge>
        </div>

        {quizScore === null ? (
          <div className="space-y-6">
            {quizQuestions.map((question, index) => (
              <Card key={question.id} className="industrial-card">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {index + 1}/{quizQuestions.length}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="font-medium">{question.text}</p>

                  <RadioGroup
                    value={quizAnswers[question.id] || ''}
                    onValueChange={value => handleQuizAnswer(question.id, value)}
                  >
                    {question.options?.map(option => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                        <Label htmlFor={`${question.id}-${option}`} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsQuizMode(false)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Retour au contenu
              </Button>
              <Button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
              >
                <Check className="w-4 h-4 mr-2" />
                Valider mes réponses
              </Button>
            </div>
          </div>
        ) : (
          <Card className="industrial-card">
            <CardContent className="p-8 text-center">
              <div
                className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  quizScore >= (trainingModule.certification?.passingScore || 80)
                    ? 'bg-green-100'
                    : 'bg-red-100'
                }`}
              >
                {quizScore >= (trainingModule.certification?.passingScore || 80) ? (
                  <Check className="w-10 h-10 text-green-600" />
                ) : (
                  <span className="text-2xl">❌</span>
                )}
              </div>

              <h3 className="text-2xl font-bold mb-2">Score: {quizScore}%</h3>

              <p className="text-muted-foreground mb-6">
                {quizScore >= (trainingModule.certification?.passingScore || 80)
                  ? "Vous avez réussi l'évaluation !"
                  : `Score minimum requis: ${trainingModule.certification?.passingScore || 80}%`}
              </p>

              {quizScore < (trainingModule.certification?.passingScore || 80) && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Réponses correctes:</p>
                  {quizQuestions.map((q, i) => (
                    <div key={q.id} className="text-left p-3 bg-muted rounded">
                      <p className="font-medium text-sm">
                        Q{i + 1}: {q.text}
                      </p>
                      <p className="text-sm text-green-600">✓ {q.correctAnswer}</p>
                      {q.explanation && (
                        <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>
                      )}
                    </div>
                  ))}

                  <Button
                    onClick={() => {
                      setQuizScore(null)
                      setQuizAnswers({})
                    }}
                    className="w-full"
                  >
                    Réessayer l'évaluation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête formation */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              className={
                trainingModule.category === 'Critique'
                  ? 'bg-red-500'
                  : trainingModule.category === 'Obligatoire'
                    ? 'bg-orange-500'
                    : 'bg-blue-500'
              }
            >
              {trainingModule.category}
            </Badge>
            <Badge variant="outline">{trainingModule.code}</Badge>
          </div>
          <h2 className="text-2xl font-bold">{trainingModule.title}</h2>
          <p className="text-muted-foreground mt-1">{trainingModule.description}</p>
        </div>
        <Button variant="ghost" onClick={onCancel}>
          Quitter
        </Button>
      </div>

      {/* Progression */}
      <Card className="industrial-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progression</span>
            <span className="text-sm text-muted-foreground">
              Étape {currentStep + 1}/{trainingModule.objectives.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Contenu du module */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle>
            Objectif {currentStep + 1}: {trainingModule.objectives[currentStep]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed">{trainingModule.description}</p>

            {/* Contenu pédagogique simulé */}
            <div className="bg-muted/30 p-6 rounded-lg my-4">
              <h4 className="font-semibold mb-3">Points clés à retenir:</h4>
              <ul className="space-y-2">
                {trainingModule.objectives.slice(0, currentStep + 1).map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Informations importantes */}
            <Alert>
              <AlertDescription>
                <strong>Important:</strong> Cette formation nécessite un score minimum de{' '}
                {trainingModule.certification?.passingScore || 80}% à l'évaluation finale.
                {trainingModule.certification?.practicalTest && (
                  <span> Un test pratique sera également requis.</span>
                )}
              </AlertDescription>
            </Alert>

            {/* Ressources */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Ressources complémentaires:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>
                    Durée totale: {trainingModule.duration} {trainingModule.durationUnit}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span>Certificat: {trainingModule.certification?.certificateType}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>

        <div className="text-sm text-muted-foreground">
          {currentStep + 1} / {trainingModule.objectives.length}
        </div>

        {currentStep < trainingModule.objectives.length - 1 ? (
          <Button onClick={handleNext}>
            Suivant
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleNext} className="gap-2">
            <Play className="w-4 h-4" />
            Passer à l'évaluation
          </Button>
        )}
      </div>
    </div>
  )
}
