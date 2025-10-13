import { Trash2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { clearAllCache, forceClearEmployeeCache } from '@/utils/clear-cache'

export function CacheCleaner() {
  const handleClearAll = () => {
    if (confirm('⚠️ Ceci va nettoyer tout le cache et recharger la page. Continuer ?')) {
      clearAllCache()
    }
  }

  const handleClearEmployees = () => {
    if (confirm('⚠️ Ceci va nettoyer le cache des employés et recharger la page. Continuer ?')) {
      forceClearEmployeeCache()
    }
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Trash2 className="w-5 h-5" />
          Nettoyage du Cache (Développement)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Si vous voyez des données incorrectes (anciens noms, doublons), utilisez ces boutons
            pour forcer le rechargement.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClearEmployees} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Recharger Employés
          </Button>

          <Button variant="destructive" onClick={handleClearAll} className="gap-2">
            <Trash2 className="w-4 h-4" />
            Tout Nettoyer
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            💡 <strong>Recharger Employés</strong>: Efface le cache des employés uniquement
          </p>
          <p>
            💡 <strong>Tout Nettoyer</strong>: Efface tout le cache (employés, visites, colis, etc.)
          </p>
          <p>⚠️ Ces actions rechargeront automatiquement la page</p>
        </div>
      </CardContent>
    </Card>
  )
}
