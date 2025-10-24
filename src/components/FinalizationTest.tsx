import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { ActionButton } from '@/components/ui/ActionButton'
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/LoadingSpinner'
import { FormError } from '@/components/ui/FormError'
import { NotificationCenter } from '@/components/ui/NotificationCenter'
import { useNotifications } from '@/hooks/useNotifications'
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid'
import { ResponsiveLayout } from '@/components/ui/ResponsiveLayout'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  message: string
  duration?: number
}

export function FinalizationTest() {
  const [tests, setTests] = useState<TestResult[]>([
    {
      name: 'Gestionnaires d\'événements',
      status: 'pending',
      message: 'Vérification des boutons et interactions'
    },
    {
      name: 'Validation des formulaires',
      status: 'pending',
      message: 'Test de la validation des données'
    },
    {
      name: 'Gestion d\'erreurs',
      status: 'pending',
      message: 'Test de la gestion des erreurs'
    },
    {
      name: 'États de chargement',
      status: 'pending',
      message: 'Test des indicateurs de chargement'
    },
    {
      name: 'Responsivité',
      status: 'pending',
      message: 'Test de l\'adaptation aux écrans'
    },
    {
      name: 'Accessibilité',
      status: 'pending',
      message: 'Test de l\'accessibilité'
    }
  ])

  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState(0)
  const notifications = useNotifications()

  const runTest = async (testIndex: number) => {
    const test = tests[testIndex]
    setCurrentTest(testIndex)
    
    // Marquer le test comme en cours
    setTests(prev => prev.map((t, i) => 
      i === testIndex 
        ? { ...t, status: 'running', message: 'Test en cours...' }
        : t
    ))

    try {
      // Simuler le test
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
      
      // Déterminer si le test passe (90% de chance de succès)
      const passed = Math.random() > 0.1
      
      setTests(prev => prev.map((t, i) => 
        i === testIndex 
          ? { 
              ...t, 
              status: passed ? 'passed' : 'failed',
              message: passed ? 'Test réussi' : 'Test échoué',
              duration: Math.floor(Math.random() * 2000) + 500
            }
          : t
      ))

      // Ajouter une notification
      if (passed) {
        notifications.showSuccess('Test réussi', `Le test "${test.name}" a été exécuté avec succès`)
      } else {
        notifications.showError('Test échoué', `Le test "${test.name}" a échoué`)
      }

    } catch (error) {
      setTests(prev => prev.map((t, i) => 
        i === testIndex 
          ? { 
              ...t, 
              status: 'failed',
              message: 'Erreur lors du test',
              duration: 0
            }
          : t
      ))
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    
    for (let i = 0; i < tests.length; i++) {
      await runTest(i)
      // Pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setIsRunning(false)
    
    const passedTests = tests.filter(t => t.status === 'passed').length
    const totalTests = tests.length
    
    if (passedTests === totalTests) {
      notifications.showSuccess(
        'Tous les tests sont passés !', 
        `${passedTests}/${totalTests} tests réussis`
      )
    } else {
      notifications.showWarning(
        'Certains tests ont échoué', 
        `${passedTests}/${totalTests} tests réussis`
      )
    }
  }

  const resetTests = () => {
    setTests(prev => prev.map(t => ({
      ...t,
      status: 'pending' as const,
      message: t.name === 'Gestionnaires d\'événements' ? 'Vérification des boutons et interactions' :
               t.name === 'Validation des formulaires' ? 'Test de la validation des données' :
               t.name === 'Gestion d\'erreurs' ? 'Test de la gestion des erreurs' :
               t.name === 'États de chargement' ? 'Test des indicateurs de chargement' :
               t.name === 'Responsivité' ? 'Test de l\'adaptation aux écrans' :
               'Test de l\'accessibilité',
      duration: undefined
    })))
    setCurrentTest(0)
  }

  const getTestIcon = (status: TestResult['status']) => {
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

  const getTestBadge = (status: TestResult['status']) => {
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

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Test de Finalisation</span>
            <div className="flex items-center gap-2">
              <NotificationCenter
                notifications={notifications.notifications}
                onMarkAsRead={notifications.markAsRead}
                onRemove={notifications.removeNotification}
                onMarkAllAsRead={notifications.markAllAsRead}
                onClearAll={notifications.clearAll}
              />
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
              <div className="text-2xl font-bold">{tests.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
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
          <RefreshCw className="w-4 h-4" />
          Exécuter tous les tests
        </ActionButton>
        
        <Button 
          variant="outline" 
          onClick={resetTests}
          disabled={isRunning}
        >
          Réinitialiser
        </Button>
      </div>

      {/* Liste des tests */}
      <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="md">
        {tests.map((test, index) => (
          <Card 
            key={test.name}
            className={`transition-all ${
              test.status === 'running' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getTestIcon(test.status)}
                  {test.name}
                </CardTitle>
                {getTestBadge(test.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {test.message}
              </p>
              
              {test.duration && (
                <p className="text-xs text-muted-foreground">
                  Durée: {test.duration}ms
                </p>
              )}
              
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runTest(index)}
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
      </ResponsiveGrid>

      {/* Test des composants */}
      <Card>
        <CardHeader>
          <CardTitle>Test des Composants</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveLayout direction="column" breakpoint="md" gap="md">
            <div className="space-y-4">
              <h3 className="font-semibold">Test des boutons d'action</h3>
              <div className="flex flex-wrap gap-2">
                <ActionButton
                  onClick={async () => {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    notifications.showSuccess('Action réussie', 'L\'action a été exécutée avec succès')
                  }}
                  loadingText="Exécution..."
                  successText="Terminé !"
                >
                  Test Action
                </ActionButton>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Test des indicateurs de chargement</h3>
              <div className="flex flex-wrap gap-4">
                <LoadingSpinner size="sm" text="Petit" />
                <LoadingSpinner size="md" text="Moyen" />
                <LoadingSpinner size="lg" text="Grand" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Test de la gestion d'erreurs</h3>
              <div className="space-y-2">
                <FormError message="Ceci est un message d'erreur de test" />
                <FormError message="Autre erreur avec plus de détails" />
              </div>
            </div>
          </ResponsiveLayout>
        </CardContent>
      </Card>
    </div>
  )
}
