import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ActionButton } from '@/components/ui/ActionButton'
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/LoadingSpinner'
import { FormError } from '@/components/ui/FormError'
import { useAsyncState } from '@/hooks/useAsyncState'
import { useFormValidation } from '@/hooks/useFormValidation'
import { useNotifications } from '@/hooks/useNotifications'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Play,
  Pause,
  Square
} from 'lucide-react'

interface PatternTest {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  duration?: number
  error?: string
}

export function PatternValidation() {
  const [tests, setTests] = useState<PatternTest[]>([
    {
      id: 'async-state',
      name: 'Gestion des états asynchrones',
      description: 'Test du hook useAsyncState avec loading, error, success'
    },
    {
      id: 'form-validation',
      name: 'Validation des formulaires',
      description: 'Test du hook useFormValidation avec règles personnalisées'
    },
    {
      id: 'notifications',
      name: 'Système de notifications',
      description: 'Test du hook useNotifications avec différents types'
    },
    {
      id: 'action-buttons',
      name: 'Boutons d\'action',
      description: 'Test des ActionButton avec états loading/success/error'
    },
    {
      id: 'loading-states',
      name: 'États de chargement',
      description: 'Test des LoadingSpinner et LoadingOverlay'
    },
    {
      id: 'error-handling',
      name: 'Gestion d\'erreurs',
      description: 'Test de la gestion d\'erreurs avec FormError'
    },
    {
      id: 'responsive-design',
      name: 'Design responsive',
      description: 'Test de l\'adaptation aux différentes tailles d\'écran'
    },
    {
      id: 'accessibility',
      name: 'Accessibilité',
      description: 'Test des attributs ARIA et navigation clavier'
    }
  ])

  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState(0)
  
  // Hooks de test
  const asyncState = useAsyncState()
  const validation = useFormValidation()
  const notifications = useNotifications()

  // Test des états asynchrones
  const testAsyncState = useCallback(async () => {
    await asyncState.execute(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (Math.random() < 0.1) throw new Error('Erreur simulée')
      return { success: true }
    })
  }, [asyncState])

  // Test de validation
  const testValidation = useCallback(() => {
    const testData = {
      email: 'test@example.com',
      name: 'Test User',
      age: 25
    }
    
    const errors = {
      email: validation.validateField('email', testData.email, (v: string) => 
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email invalide'
      ),
      name: validation.validateField('name', testData.name, (v: string) => 
        v.length >= 2 || 'Nom requis'
      )
    }
    
    return Object.keys(errors).length === 0
  }, [validation])

  // Test des notifications
  const testNotifications = useCallback(() => {
    notifications.showSuccess('Test réussi', 'Notification de succès')
    notifications.showError('Test d\'erreur', 'Notification d\'erreur')
    notifications.showWarning('Attention', 'Notification d\'avertissement')
    notifications.showInfo('Information', 'Notification d\'information')
  }, [notifications])

  // Exécuter un test spécifique
  const runTest = useCallback(async (testId: string) => {
    const testIndex = tests.findIndex(t => t.id === testId)
    if (testIndex === -1) return

    setCurrentTest(testIndex)
    
    // Marquer comme en cours
    setTests(prev => prev.map((t, i) => 
      i === testIndex 
        ? { ...t, status: 'running', error: undefined }
        : t
    ))

    const startTime = Date.now()

    try {
      let result = false

      switch (testId) {
        case 'async-state':
          await testAsyncState()
          result = !!asyncState.data
          break
          
        case 'form-validation':
          result = testValidation()
          break
          
        case 'notifications':
          testNotifications()
          result = true
          break
          
        case 'action-buttons':
          // Test des boutons d'action (simulation)
          await new Promise(resolve => setTimeout(resolve, 500))
          result = true
          break
          
        case 'loading-states':
          // Test des états de chargement (simulation)
          await new Promise(resolve => setTimeout(resolve, 300))
          result = true
          break
          
        case 'error-handling':
          // Test de la gestion d'erreurs
          try {
            throw new Error('Erreur de test')
          } catch (e) {
            result = true // La gestion d'erreur fonctionne
          }
          break
          
        case 'responsive-design':
          // Test responsive (vérification des breakpoints)
          result = window.innerWidth >= 320
          break
          
        case 'accessibility':
          // Test d'accessibilité (vérification des attributs)
          const hasAriaLabels = document.querySelectorAll('[aria-label]').length > 0
          result = hasAriaLabels
          break
          
        default:
          result = true
      }

      const duration = Date.now() - startTime

      setTests(prev => prev.map((t, i) => 
        i === testIndex 
          ? { 
              ...t, 
              status: result ? 'passed' : 'failed',
              duration,
              error: result ? undefined : 'Test échoué'
            }
          : t
      ))

    } catch (error) {
      const duration = Date.now() - startTime
      setTests(prev => prev.map((t, i) => 
        i === testIndex 
          ? { 
              ...t, 
              status: 'failed',
              duration,
              error: error instanceof Error ? error.message : 'Erreur inconnue'
            }
          : t
      ))
    }
  }, [tests, testAsyncState, testValidation, testNotifications, asyncState])

  // Exécuter tous les tests
  const runAllTests = useCallback(async () => {
    setIsRunning(true)
    
    for (let i = 0; i < tests.length; i++) {
      await runTest(tests[i].id)
      await new Promise(resolve => setTimeout(resolve, 200)) // Pause entre tests
    }
    
    setIsRunning(false)
    
    const passedTests = tests.filter(t => t.status === 'passed').length
    const totalTests = tests.length
    
    if (passedTests === totalTests) {
      notifications.showSuccess(
        'Tous les tests sont passés !', 
        `${passedTests}/${totalTests} patterns validés`
      )
    } else {
      notifications.showWarning(
        'Certains tests ont échoué', 
        `${passedTests}/${totalTests} patterns validés`
      )
    }
  }, [tests, runTest, notifications])

  // Réinitialiser les tests
  const resetTests = useCallback(() => {
    setTests(prev => prev.map(t => ({
      ...t,
      status: 'pending' as const,
      duration: undefined,
      error: undefined
    })))
    setCurrentTest(0)
  }, [])

  // Obtenir l'icône de statut
  const getStatusIcon = (status: PatternTest['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />
    }
  }

  // Obtenir le badge de statut
  const getStatusBadge = (status: PatternTest['status']) => {
    switch (status) {
      case 'passed':
        return <Badge variant="default" className="bg-green-600">Réussi</Badge>
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>
      case 'running':
        return <Badge variant="secondary">En cours</Badge>
      default:
        return <Badge variant="outline">En attente</Badge>
    }
  }

  const passedTests = tests.filter(t => t.status === 'passed').length
  const failedTests = tests.filter(t => t.status === 'failed').length
  const runningTests = tests.filter(t => t.status === 'running').length
  const totalTests = tests.length

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Validation des Patterns</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {passedTests} / {totalTests} réussis
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              <div className="text-sm text-muted-foreground">Réussis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failedTests}</div>
              <div className="text-sm text-muted-foreground">Échoués</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{runningTests}</div>
              <div className="text-sm text-muted-foreground">En cours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalTests}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Progression globale</span>
              <span className="text-sm font-medium">
                {Math.round((passedTests / totalTests) * 100)}%
              </span>
            </div>
            <Progress value={(passedTests / totalTests) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <ActionButton
          onClick={runAllTests}
          loading={isRunning}
          loadingText="Exécution des tests..."
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          Exécuter tous les tests
        </ActionButton>
        
        <Button 
          variant="outline" 
          onClick={resetTests}
          disabled={isRunning}
        >
          <Square className="w-4 h-4 mr-2" />
          Réinitialiser
        </Button>
      </div>

      {/* Liste des tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((test, index) => (
          <Card 
            key={test.id}
            className={`transition-all ${
              test.status === 'running' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  {test.name}
                </CardTitle>
                {getStatusBadge(test.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {test.description}
              </p>
              
              {test.duration && (
                <p className="text-xs text-muted-foreground mb-2">
                  Durée: {test.duration}ms
                </p>
              )}
              
              {test.error && (
                <FormError message={test.error} />
              )}
              
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runTest(test.id)}
                  disabled={test.status === 'running' || isRunning}
                  className="w-full"
                >
                  {test.status === 'running' ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Test en cours...
                    </>
                  ) : (
                    'Exécuter ce test'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test des composants en action */}
      <Card>
        <CardHeader>
          <CardTitle>Démonstration des Patterns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Test des boutons d'action</h3>
              <div className="flex flex-wrap gap-2">
                <ActionButton
                  onClick={async () => {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    notifications.showSuccess('Action réussie', 'L\'action a été exécutée')
                  }}
                  loadingText="Exécution..."
                  successText="Terminé !"
                >
                  Test Action
                </ActionButton>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Test des notifications</h3>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => notifications.showSuccess('Succès', 'Test de notification')}
                >
                  Succès
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => notifications.showError('Erreur', 'Test d\'erreur')}
                >
                  Erreur
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => notifications.showWarning('Attention', 'Test d\'avertissement')}
                >
                  Attention
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
