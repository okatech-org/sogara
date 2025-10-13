import { useState } from 'react'
import {
  Settings,
  Database,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  Upload,
  Archive,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AppContext'

export function HSEMaintenanceTools() {
  const { hasAnyRole } = useAuth()
  const [operationInProgress, setOperationInProgress] = useState<string | null>(null)
  const [operationProgress, setOperationProgress] = useState(0)
  const [lastOperation, setLastOperation] = useState<{ type: string; date: Date } | null>(null)

  const canManageMaintenance = hasAnyRole(['ADMIN'])

  const handleMaintenanceOperation = async (operation: string) => {
    if (!canManageMaintenance) return

    if (
      operation === 'clear-all-data' &&
      !confirm(
        '⚠️ ATTENTION : Cette action va supprimer TOUTES les données HSE. Êtes-vous absolument sûr ?',
      )
    ) {
      return
    }

    setOperationInProgress(operation)
    setOperationProgress(0)

    try {
      // Simuler l'opération avec progression
      for (let i = 0; i <= 100; i += 5) {
        setOperationProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      setLastOperation({ type: operation, date: new Date() })

      // Actions spécifiques
      switch (operation) {
        case 'optimize-database':
          console.log('Optimisation base de données terminée')
          break
        case 'clear-cache':
          localStorage.clear()
          console.log('Cache vidé')
          break
        case 'backup-data':
          console.log('Sauvegarde créée')
          break
        case 'clear-all-data':
          localStorage.clear()
          window.location.reload()
          break
      }
    } catch (error) {
      console.error('Erreur opération maintenance:', error)
    } finally {
      setOperationInProgress(null)
      setOperationProgress(0)
    }
  }

  const maintenanceOperations = [
    {
      id: 'optimize-database',
      title: 'Optimiser Base de Données',
      description: 'Nettoyer et optimiser les données HSE',
      icon: <Database className="w-6 h-6" />,
      color: 'bg-blue-500',
      severity: 'safe',
    },
    {
      id: 'clear-cache',
      title: 'Vider le Cache',
      description: 'Nettoyer le cache du navigateur',
      icon: <RefreshCw className="w-6 h-6" />,
      color: 'bg-green-500',
      severity: 'safe',
    },
    {
      id: 'backup-data',
      title: 'Sauvegarder Données',
      description: 'Créer une sauvegarde complète',
      icon: <Archive className="w-6 h-6" />,
      color: 'bg-purple-500',
      severity: 'safe',
    },
    {
      id: 'reset-progress',
      title: 'Reset Progressions',
      description: 'Remettre à zéro toutes les progressions de formation',
      icon: <RefreshCw className="w-6 h-6" />,
      color: 'bg-orange-500',
      severity: 'warning',
    },
    {
      id: 'clear-all-data',
      title: 'Effacer Toutes Données',
      description: 'DANGER: Supprimer toutes les données HSE',
      icon: <Trash2 className="w-6 h-6" />,
      color: 'bg-red-500',
      severity: 'danger',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Avertissement sécurité */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Attention :</strong> Ces outils sont réservés aux administrateurs. Certaines
          opérations sont irréversibles. Procédez avec prudence.
        </AlertDescription>
      </Alert>

      {/* Opération en cours */}
      {operationInProgress && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <div className="space-y-2">
              <div>Opération en cours: {operationInProgress}</div>
              <Progress value={operationProgress} className="w-full" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Dernière opération */}
      {lastOperation && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Dernière opération: {lastOperation.type} - {lastOperation.date.toLocaleString('fr-FR')}
          </AlertDescription>
        </Alert>
      )}

      {/* Informations système */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Informations Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">
                {localStorage.getItem('employees')?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Employés en cache</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{Object.keys(localStorage).length}</div>
              <div className="text-sm text-muted-foreground">Clés de stockage</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {Math.round(JSON.stringify(localStorage).length / 1024)} KB
              </div>
              <div className="text-sm text-muted-foreground">Espace utilisé</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outils de maintenance */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Outils de Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maintenanceOperations.map(operation => (
              <Card
                key={operation.id}
                className={`border ${
                  operation.severity === 'danger'
                    ? 'border-red-200 bg-red-50'
                    : operation.severity === 'warning'
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-border'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${operation.color}`}
                    >
                      {operation.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{operation.title}</h3>
                        {operation.severity === 'danger' && (
                          <Badge variant="destructive" className="text-xs">
                            DANGER
                          </Badge>
                        )}
                        {operation.severity === 'warning' && (
                          <Badge variant="destructive" className="text-xs">
                            ATTENTION
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{operation.description}</p>

                      <Button
                        size="sm"
                        variant={operation.severity === 'danger' ? 'destructive' : 'outline'}
                        onClick={() => handleMaintenanceOperation(operation.id)}
                        disabled={operationInProgress !== null || !canManageMaintenance}
                        className="gap-2"
                      >
                        {operation.icon}
                        Exécuter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates et modèles */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle>Modèles et Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Template Import Employés', file: 'employees-template.csv' },
              { name: 'Template Import EPI', file: 'equipment-template.csv' },
              { name: 'Template Import Incidents', file: 'incidents-template.csv' },
              { name: 'Procédures HSE', file: 'hse-procedures.pdf' },
              { name: 'Check-Lists Sécurité', file: 'safety-checklists.pdf' },
              { name: 'Formulaires Vierges', file: 'blank-forms.pdf' },
            ].map(template => (
              <div
                key={template.file}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{template.name}</span>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Télécharger
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      {!canManageMaintenance && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Vous n'avez pas les permissions nécessaires pour effectuer des opérations de
            maintenance. Contactez un administrateur.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
