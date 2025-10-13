import { useState } from 'react'
import {
  Upload,
  Download,
  FileText,
  Database,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Settings,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AppContext'

interface HSEDataImportToolsProps {
  onImportComplete: () => void
}

export function HSEDataImportTools({ onImportComplete }: HSEDataImportToolsProps) {
  const { hasAnyRole } = useAuth()
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [lastImport, setLastImport] = useState<Date | null>(null)

  const canManageImports = hasAnyRole(['ADMIN', 'HSE'])

  const handleImportData = async (type: string) => {
    if (!canManageImports) return

    setImporting(true)
    setImportProgress(0)

    try {
      // Simuler l'import avec progression
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      setLastImport(new Date())
      onImportComplete()
    } catch (error) {
      console.error('Erreur import:', error)
    } finally {
      setImporting(false)
      setImportProgress(0)
    }
  }

  const exportData = async (type: string) => {
    try {
      // Simuler l'export
      console.log(`Export ${type} en cours...`)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Dans une vraie application, on téléchargerait le fichier
      alert(`Export ${type} terminé`)
    } catch (error) {
      console.error('Erreur export:', error)
    }
  }

  const clearData = async (type: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir effacer toutes les données ${type} ?`)) {
      return
    }

    try {
      // Simuler la suppression
      console.log(`Suppression ${type}...`)
      await new Promise(resolve => setTimeout(resolve, 500))
      onImportComplete()
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const importTools = [
    {
      id: 'employees',
      title: 'Import Employés',
      description: 'Importer liste des employés avec rôles HSE',
      icon: <Database className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      id: 'equipment',
      title: 'Import Équipements',
      description: 'Importer inventaire des EPI et équipements',
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      id: 'incidents',
      title: 'Import Incidents',
      description: 'Importer historique des incidents HSE',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-orange-500',
    },
    {
      id: 'trainings',
      title: 'Import Formations',
      description: 'Importer données de formation et certifications',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* État de l'import */}
      {importing && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <div className="space-y-2">
              <div>Import en cours... {importProgress}%</div>
              <Progress value={importProgress} className="w-full" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {lastImport && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Dernier import réussi le {lastImport.toLocaleString('fr-FR')}
          </AlertDescription>
        </Alert>
      )}

      {/* Outils d'import */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Outils d'Import de Données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {importTools.map(tool => (
              <Card key={tool.id} className="border hover:bg-muted/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${tool.color}`}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>

                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => handleImportData(tool.id)}
                          disabled={importing || !canManageImports}
                          className="gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Importer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportData(tool.id)}
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Exporter
                        </Button>
                        {canManageImports && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => clearData(tool.id)}
                            className="gap-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            Effacer
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions d'utilisation */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">Instructions d'Import</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Utilisez les modèles CSV fournis pour chaque type de données</li>
                <li>• Vérifiez le format des dates (DD/MM/YYYY)</li>
                <li>• Les imports remplacent les données existantes</li>
                <li>• Sauvegardez vos données avant import important</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modèles de fichiers */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle>Modèles de Fichiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Modèle Employés', file: 'template-employees.csv' },
              { name: 'Modèle Équipements', file: 'template-equipment.csv' },
              { name: 'Modèle Incidents', file: 'template-incidents.csv' },
              { name: 'Modèle Formations', file: 'template-trainings.csv' },
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
    </div>
  )
}
