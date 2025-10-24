import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface MigrationStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress?: number
}

interface MigrationDialogProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function MigrationDialog({ isOpen, onClose, onComplete }: MigrationDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState<MigrationStep[]>([
    {
      id: 'validation',
      name: 'Validation des données',
      description: 'Vérification de l\'intégrité des données existantes',
      status: 'pending',
    },
    {
      id: 'backup',
      name: 'Sauvegarde',
      description: 'Création d\'une sauvegarde de sécurité',
      status: 'pending',
    },
    {
      id: 'migration',
      name: 'Migration des composants',
      description: 'Mise à jour des composants non fonctionnels',
      status: 'pending',
    },
    {
      id: 'validation_final',
      name: 'Validation finale',
      description: 'Vérification du bon fonctionnement',
      status: 'pending',
    },
  ])

  const totalSteps = steps.length
  const completedSteps = steps.filter(step => step.status === 'completed').length
  const progress = (completedSteps / totalSteps) * 100

  const runMigration = async () => {
    setIsRunning(true)
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      
      // Marquer l'étape comme en cours
      setSteps(prev => prev.map((step, index) => 
        index === i 
          ? { ...step, status: 'running', progress: 0 }
          : step
      ))

      // Simuler le processus de migration
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        
        setSteps(prev => prev.map((step, index) => 
          index === i 
            ? { ...step, progress }
            : step
        ))
      }

      // Marquer l'étape comme terminée
      setSteps(prev => prev.map((step, index) => 
        index === i 
          ? { ...step, status: 'completed', progress: 100 }
          : step
      ))
    }

    setIsRunning(false)
    onComplete()
  }

  const getStepIcon = (step: MigrationStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStepStatus = (step: MigrationStep) => {
    switch (step.status) {
      case 'completed':
        return 'Terminé'
      case 'running':
        return 'En cours...'
      case 'error':
        return 'Erreur'
      default:
        return 'En attente'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Migration des Composants</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progression globale */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression globale</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Étapes de migration */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Card key={step.id} className={`transition-all ${
                step.status === 'running' ? 'ring-2 ring-blue-500' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {getStepIcon(step)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{step.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          {getStepStatus(step)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                      {step.status === 'running' && step.progress !== undefined && (
                        <div className="mt-2">
                          <Progress value={step.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isRunning}
            >
              Annuler
            </Button>
            <Button 
              onClick={runMigration}
              disabled={isRunning}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Migration en cours...
                </>
              ) : (
                'Démarrer la migration'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}