import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, CheckCircle, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TourStep {
  id: string
  title: string
  description: string
  tips: string[]
  icon: string
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue dans le Module HSE',
    description:
      'Le module HSE de SOGARA vous permet de gérer tous les aspects de la sécurité, santé et environnement de votre entreprise.',
    tips: [
      'Déclarez et suivez les incidents de sécurité',
      'Gérez les formations obligatoires',
      'Surveillez la conformité réglementaire',
      'Accédez aux analyses et rapports',
    ],
    icon: '🛡️',
  },
  {
    id: 'incidents',
    title: 'Gestion des Incidents',
    description: 'Déclarez rapidement tout incident de sécurité et suivez leur résolution.',
    tips: [
      'Cliquez sur "Déclarer un incident" pour signaler',
      'Classifiez la sévérité (faible, moyen, élevé)',
      'Ajoutez des photos et descriptions détaillées',
      'Suivez le statut en temps réel',
    ],
    icon: '⚠️',
  },
  {
    id: 'trainings',
    title: 'Formations HSE',
    description: '15 modules de formation interactifs disponibles avec certifications.',
    tips: [
      'Consultez le catalogue de formations',
      'Inscrivez-vous aux sessions programmées',
      'Suivez votre progression en temps réel',
      'Obtenez vos certificats au format PDF',
    ],
    icon: '🎓',
  },
  {
    id: 'compliance',
    title: 'Conformité et EPI',
    description: 'Vérifiez votre conformité et gérez les équipements de protection.',
    tips: [
      'Consultez votre taux de conformité',
      'Visualisez les formations à renouveler',
      'Gérez vos équipements EPI',
      'Planifiez les inspections',
    ],
    icon: '✅',
  },
  {
    id: 'analytics',
    title: 'Analyses et Rapports',
    description: 'Accédez à des statistiques détaillées et exportez des rapports.',
    tips: [
      'Visualisez les tendances des incidents',
      'Analysez les taux de participation',
      'Exportez des rapports personnalisés',
      'Identifiez les zones à risque',
    ],
    icon: '📊',
  },
]

interface HSEWelcomeTourProps {
  onComplete: () => void
}

export function HSEWelcomeTour({ onComplete }: HSEWelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showTour, setShowTour] = useState(true)

  const currentStepData = tourSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === tourSteps.length - 1

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu le tour
    const hasSeenTour = localStorage.getItem('sogara_hse_tour_completed')
    if (hasSeenTour) {
      setShowTour(false)
    }
  }, [])

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('sogara_hse_tour_completed', 'true')
    setShowTour(false)
    onComplete()
  }

  const handleComplete = () => {
    localStorage.setItem('sogara_hse_tour_completed', 'true')
    setShowTour(false)
    onComplete()
  }

  if (!showTour) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{currentStepData.icon}</div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  {currentStepData.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">
                    Étape {currentStep + 1} sur {tourSteps.length}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          <p className="text-lg text-muted-foreground leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Tips */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase text-primary">Points clés</h4>
            <div className="space-y-2">
              {currentStepData.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress indicators */}
          <div className="flex items-center justify-center gap-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : index < currentStep
                      ? 'w-2 bg-primary/50'
                      : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>

            <Button onClick={handleSkip} variant="ghost" className="text-muted-foreground">
              Passer le tutoriel
            </Button>

            <Button onClick={handleNext} className="gap-2">
              {isLastStep ? (
                <>
                  Terminer
                  <CheckCircle className="w-4 h-4" />
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook pour réinitialiser le tour (pour les admins)
export function useResetTour() {
  const resetTour = () => {
    localStorage.removeItem('sogara_hse_tour_completed')
    window.location.reload()
  }

  return { resetTour }
}
