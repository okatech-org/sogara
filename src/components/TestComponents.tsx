import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid'
import { ResponsiveLayout } from '@/components/ui/ResponsiveLayout'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'
import { ActionButton } from '@/components/ui/ActionButton'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { FormError } from '@/components/ui/FormError'
import { useState } from 'react'

export function TestComponents() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  const handleTestAction = async () => {
    setLoading(true)
    setSuccess(false)
    setError(false)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSuccess(true)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ResponsiveContainer maxWidth="2xl" padding="lg">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-center">Test des Composants</h1>
        
        {/* Test ResponsiveGrid */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Grille Responsive</h2>
          <ResponsiveGrid 
            cols={{ default: 1, sm: 2, md: 3, lg: 4 }}
            gap="md"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>Card {i + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Contenu de la carte {i + 1}</p>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        </section>

        {/* Test ResponsiveLayout */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Layout Responsive</h2>
          <ResponsiveLayout 
            direction="column" 
            breakpoint="md" 
            gap="md"
            align="center"
          >
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Layout Test</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Ce layout change de direction selon la taille d'écran</p>
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Layout Test 2</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Colonne sur mobile, ligne sur desktop</p>
              </CardContent>
            </Card>
          </ResponsiveLayout>
        </section>

        {/* Test ActionButton */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Boutons d'Action</h2>
          <div className="flex flex-wrap gap-4">
            <ActionButton
              onClick={handleTestAction}
              loading={loading}
              success={success}
              error={error}
              loadingText="Test en cours..."
              successText="Test réussi !"
              errorText="Test échoué"
            >
              Tester l'Action
            </ActionButton>
            
            <Button 
              onClick={() => {
                setSuccess(false)
                setError(false)
                setLoading(false)
              }}
              variant="outline"
            >
              Reset
            </Button>
          </div>
        </section>

        {/* Test LoadingSpinner */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Indicateurs de Chargement</h2>
          <div className="flex flex-wrap gap-4">
            <LoadingSpinner size="sm" text="Petit" />
            <LoadingSpinner size="md" text="Moyen" />
            <LoadingSpinner size="lg" text="Grand" />
          </div>
        </section>

        {/* Test FormError */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Gestion d'Erreurs</h2>
          <div className="space-y-2">
            <FormError message="Ceci est un message d'erreur" />
            <FormError message="Autre erreur avec plus de détails" />
          </div>
        </section>

        {/* Test Responsive Container */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Conteneurs Responsives</h2>
          <div className="space-y-4">
            <ResponsiveContainer maxWidth="sm" padding="sm">
              <Card>
                <CardContent className="p-4">
                  <p>Conteneur petit (max-w-sm)</p>
                </CardContent>
              </Card>
            </ResponsiveContainer>
            
            <ResponsiveContainer maxWidth="lg" padding="md">
              <Card>
                <CardContent className="p-4">
                  <p>Conteneur large (max-w-lg)</p>
                </CardContent>
              </Card>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </ResponsiveContainer>
  )
}