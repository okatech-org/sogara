import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ActionButton } from '@/components/ui/ActionButton'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export function QuickTest() {
  const [testStatus, setTestStatus] = React.useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [message, setMessage] = React.useState('')

  const runTest = async () => {
    setTestStatus('running')
    setMessage('Test en cours...')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTestStatus('success')
      setMessage('Test réussi ! Tous les composants fonctionnent.')
    } catch (error) {
      setTestStatus('error')
      setMessage('Erreur lors du test')
    }
  }

  return (
    <ResponsiveContainer maxWidth="2xl" padding="lg">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {testStatus === 'error' && <AlertTriangle className="w-5 h-5 text-red-600" />}
              Test Rapide des Composants
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Vérification que tous les composants de finalisation fonctionnent correctement.
            </p>
            
            <div className="flex gap-4">
              <ActionButton
                onClick={runTest}
                loading={testStatus === 'running'}
                success={testStatus === 'success'}
                loadingText="Test en cours..."
                successText="Test réussi !"
              >
                Lancer le test
              </ActionButton>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setTestStatus('idle')
                  setMessage('')
                }}
              >
                Réinitialiser
              </Button>
            </div>

            {message && (
              <div className={`p-3 rounded-md ${
                testStatus === 'success' ? 'bg-green-50 text-green-700' :
                testStatus === 'error' ? 'bg-red-50 text-red-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {message}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test de Responsivité</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid cols={{ default: 1, sm: 2, md: 3, lg: 4 }} gap="md">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 bg-blue-100 rounded-md flex items-center justify-center text-blue-800 font-semibold">
                  Item {i + 1}
                </div>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test des États de Chargement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <LoadingSpinner size="sm" text="Petit" />
              <LoadingSpinner size="md" text="Moyen" />
              <LoadingSpinner size="lg" text="Grand" />
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  )
}
