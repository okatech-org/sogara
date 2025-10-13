import { Users, Package, Mail, TrendingUp, Sparkles, Eye, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { visitorService } from '@/services/visitor-management.service'
import { packageService } from '@/services/package-management.service'
import { mailService } from '@/services/mail-management.service'

export function ReceptionDashboard() {
  const visitorStats = visitorService.getVisitorStats()
  const packageStats = packageService.getPackageStats()
  const mailStats = mailService.getMailStats()

  const totalAIOperations =
    visitorStats.aiExtracted + (packageStats.aiScanned || 0) + (mailStats.scannesAujourdhui || 0)

  const overdueItems = visitorStats.overdue + packageStats.urgents + mailStats.urgents

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Intelligence Artificielle Activée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalAIOperations}</div>
              <div className="text-sm text-blue-700">Opérations IA aujourd'hui</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{visitorStats.aiExtracted}</div>
              <div className="text-sm text-muted-foreground">Visiteurs extraits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{packageStats.total}</div>
              <div className="text-sm text-muted-foreground">Colis scannés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {mailStats.scannesAujourdhui}
              </div>
              <div className="text-sm text-muted-foreground">Courriers OCR</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes */}
      {overdueItems > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <h4 className="font-semibold text-red-900">Attention requise</h4>
                <p className="text-sm text-red-700">
                  {overdueItems} élément(s) nécessitent une action immédiate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Visiteurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              Visiteurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Présents</span>
              <span className="font-semibold text-green-600">{visitorStats.present}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Aujourd'hui</span>
              <span className="font-semibold">{visitorStats.todayVisitors}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>VIP</span>
              <span className="font-semibold text-purple-600">{visitorStats.vip}</span>
            </div>
            {visitorStats.overdue > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>En retard</span>
                <span className="font-semibold">{visitorStats.overdue}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Colis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-4 h-4" />
              Colis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>En réception</span>
              <span className="font-semibold text-blue-600">{packageStats.enReception}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>En attente</span>
              <span className="font-semibold text-orange-600">{packageStats.enAttente}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Livrés</span>
              <span className="font-semibold text-green-600">{packageStats.livres}</span>
            </div>
            {packageStats.fragiles > 0 && (
              <div className="flex justify-between text-sm">
                <span>Fragiles</span>
                <span className="font-semibold text-red-600">{packageStats.fragiles}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Courriers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="w-4 h-4" />
              Courriers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Non lus</span>
              <span className="font-semibold text-blue-600">{mailStats.nonLus}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Urgents</span>
              <span className="font-semibold text-red-600">{mailStats.urgents}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>À traiter</span>
              <span className="font-semibold text-orange-600">{mailStats.aTraiter}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Scannés</span>
              <span className="font-semibold text-green-600">{mailStats.scannesAujourdhui}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par département */}
      {Object.keys(packageStats.parDepartement).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Colis par département</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(packageStats.parDepartement).map(([dept, count]) => (
                <div key={dept}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{dept}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <Progress value={(count / packageStats.total) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
