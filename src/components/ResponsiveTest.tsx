import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid'
import { ResponsiveLayout } from '@/components/ui/ResponsiveLayout'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'
import { Monitor, Smartphone, Tablet } from 'lucide-react'

interface BreakpointInfo {
  name: string
  minWidth: number
  maxWidth?: number
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const breakpoints: BreakpointInfo[] = [
  {
    name: 'Mobile',
    minWidth: 0,
    maxWidth: 767,
    icon: Smartphone,
    description: 'Téléphones portables'
  },
  {
    name: 'Tablet',
    minWidth: 768,
    maxWidth: 1023,
    icon: Tablet,
    description: 'Tablettes'
  },
  {
    name: 'Desktop',
    minWidth: 1024,
    icon: Monitor,
    description: 'Ordinateurs de bureau'
  }
]

export function ResponsiveTest() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('')
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })

      // Déterminer le breakpoint actuel
      const width = window.innerWidth
      const breakpoint = breakpoints.find(bp => 
        width >= bp.minWidth && 
        (bp.maxWidth === undefined || width <= bp.maxWidth)
      )
      
      setCurrentBreakpoint(breakpoint?.name || 'Unknown')
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const currentBreakpointInfo = breakpoints.find(bp => bp.name === currentBreakpoint)

  return (
    <ResponsiveContainer maxWidth="full" padding="lg">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Test de Responsivité</h1>
          <p className="text-muted-foreground">
            Redimensionnez votre fenêtre pour voir les changements en temps réel
          </p>
        </div>

        {/* Informations sur le breakpoint actuel */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentBreakpointInfo?.icon && (
                <currentBreakpointInfo.icon className="w-5 h-5" />
              )}
              Breakpoint Actuel: {currentBreakpoint}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Taille de l'écran</p>
                <p className="text-2xl font-bold">{windowSize.width} × {windowSize.height}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Breakpoint</p>
                <p className="text-lg">{currentBreakpointInfo?.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Définition</p>
                <p className="text-sm">
                  {currentBreakpointInfo?.minWidth}px - {currentBreakpointInfo?.maxWidth || '∞'}px
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test de grille responsive */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Grille Responsive</h2>
          <ResponsiveGrid 
            cols={{ default: 1, sm: 2, md: 3, lg: 4 }}
            gap="md"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Card {i + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Cette carte s'adapte automatiquement à la taille de l'écran
                  </p>
                  <Badge variant="outline" className="mt-2">
                    Responsive
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        </section>

        {/* Test de layout responsive */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Layout Responsive</h2>
          <ResponsiveLayout 
            direction="column" 
            breakpoint="md" 
            gap="lg"
            align="center"
          >
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Layout Test 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Colonne sur mobile, ligne sur desktop</p>
              </CardContent>
            </Card>
            
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Layout Test 2</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Le layout change automatiquement selon la taille</p>
              </CardContent>
            </Card>
          </ResponsiveLayout>
        </section>

        {/* Test de conteneurs responsive */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Conteneurs Responsive</h2>
          <div className="space-y-4">
            <ResponsiveContainer maxWidth="sm" padding="sm">
              <Card>
                <CardContent className="p-4">
                  <p className="text-center">Conteneur petit (max-w-sm)</p>
                </CardContent>
              </Card>
            </ResponsiveContainer>
            
            <ResponsiveContainer maxWidth="md" padding="md">
              <Card>
                <CardContent className="p-4">
                  <p className="text-center">Conteneur moyen (max-w-md)</p>
                </CardContent>
              </Card>
            </ResponsiveContainer>
            
            <ResponsiveContainer maxWidth="lg" padding="lg">
              <Card>
                <CardContent className="p-4">
                  <p className="text-center">Conteneur large (max-w-lg)</p>
                </CardContent>
              </Card>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Instructions de test</h3>
            <ul className="text-sm space-y-1 text-blue-800">
              <li>• Redimensionnez votre fenêtre de navigateur</li>
              <li>• Testez sur différentes tailles d'écran</li>
              <li>• Vérifiez que les composants s'adaptent correctement</li>
              <li>• Testez sur mobile, tablette et desktop</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  )
}
