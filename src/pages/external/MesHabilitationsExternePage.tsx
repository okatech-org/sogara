import { Award, Download, Calendar, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AppContext'
import { useCertificationPaths } from '@/hooks/useCertificationPaths'

export function MesHabilitationsExternePage() {
  const { currentUser } = useAuth()
  const { getMyProgress, paths } = useCertificationPaths()

  const myProgress = getMyProgress(currentUser?.id || '')
  const habilitationsObtained = myProgress.filter(p => p.habilitationGrantedAt)
  const habilitationsExpiringSoon = habilitationsObtained.filter(p => {
    if (!p.habilitationExpiryDate) return false
    const daysUntilExpiry =
      (p.habilitationExpiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  })

  const getPathData = (pathId: string) => {
    return paths.find(p => p.id === pathId)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            Mes Habilitations
          </h1>
          <p className="text-muted-foreground mt-2">
            Qualifications et autorisations d'accès raffinerie
          </p>
        </div>

        <div className="text-center md:text-right">
          <div className="text-5xl font-bold text-green-600 mb-1">
            {habilitationsObtained.length}
          </div>
          <p className="text-sm text-muted-foreground">Habilitation(s) active(s)</p>
        </div>
      </div>

      {/* Alertes */}
      {habilitationsExpiringSoon.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900">
                  {habilitationsExpiringSoon.length} habilitation(s) expire(nt) dans moins de 30
                  jours
                </p>
                <p className="text-sm text-yellow-800">
                  Contactez le service HSE pour renouvellement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total obtenues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{habilitationsObtained.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Valides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {
                habilitationsObtained.filter(p => {
                  if (!p.habilitationExpiryDate) return true
                  return p.habilitationExpiryDate > new Date()
                }).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">À renouveler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {habilitationsExpiringSoon.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habilitations obtenues */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Habilitations Obtenues</h2>

        {habilitationsObtained.length === 0 ? (
          <Card className="industrial-card">
            <CardContent className="text-center py-16">
              <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Aucune habilitation</h3>
              <p className="text-muted-foreground mb-4">
                Complétez vos parcours de certification pour obtenir vos habilitations.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>Parcours disponibles: {myProgress.length}</p>
                <p>En cours: {myProgress.filter(p => p.status.includes('progress')).length}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {habilitationsObtained.map(progress => {
              const isExpiringSoon = habilitationsExpiringSoon.some(h => h.id === progress.id)
              const isExpired =
                progress.habilitationExpiryDate && progress.habilitationExpiryDate < new Date()
              const pathData = getPathData(progress.pathId)

              return (
                <Card
                  key={progress.id}
                  className={`industrial-card ${
                    isExpired
                      ? 'border-red-300 bg-red-50/30'
                      : isExpiringSoon
                        ? 'border-yellow-300 bg-yellow-50/30'
                        : 'border-green-300 bg-green-50/30'
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`p-3 rounded-lg ${
                            isExpired
                              ? 'bg-red-100'
                              : isExpiringSoon
                                ? 'bg-yellow-100'
                                : 'bg-green-100'
                          }`}
                        >
                          <Award
                            className={`w-6 h-6 ${
                              isExpired
                                ? 'text-red-600'
                                : isExpiringSoon
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                            }`}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {isExpired ? (
                              <Badge variant="destructive">Expirée</Badge>
                            ) : isExpiringSoon ? (
                              <Badge variant="secondary" className="bg-yellow-500">
                                À renouveler
                              </Badge>
                            ) : (
                              <Badge className="bg-green-500">Valide</Badge>
                            )}
                          </div>

                          <h3 className="font-semibold text-lg mb-1">
                            {pathData?.habilitationName || 'Habilitation Professionnelle'}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Code: {pathData?.habilitationCode || 'N/A'}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>
                                Obtenue le{' '}
                                {progress.habilitationGrantedAt?.toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            {progress.habilitationExpiryDate && (
                              <div
                                className={`flex items-center gap-1 ${
                                  isExpired
                                    ? 'text-red-600'
                                    : isExpiringSoon
                                      ? 'text-yellow-600'
                                      : 'text-muted-foreground'
                                }`}
                              >
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {isExpired ? 'Expirée le' : 'Expire le'}{' '}
                                  {progress.habilitationExpiryDate.toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            )}
                          </div>

                          {progress.evaluationScore && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Score obtenu: </span>
                              <span className="font-medium text-green-600">
                                {progress.evaluationScore.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {progress.certificateUrl && !isExpired && (
                          <Button variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Certificat
                          </Button>
                        )}
                        {isExpiringSoon && (
                          <Button size="sm" variant="outline">
                            Renouveler
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Informations */}
      <Card className="bg-green-50/50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">À Propos des Habilitations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-green-800">
          <p>• Les habilitations sont obtenues après réussite des parcours de certification</p>
          <p>• Chaque habilitation a une durée de validité (généralement 12 mois)</p>
          <p>• Présentez vos certificats à l'accueil de la raffinerie</p>
          <p>• Renouvelez vos habilitations avant expiration</p>
          <p>• Conservez vos certificats en lieu sûr</p>
        </CardContent>
      </Card>
    </div>
  )
}
