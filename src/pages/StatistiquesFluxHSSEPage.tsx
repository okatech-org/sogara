import { useState } from 'react'
import {
  Users,
  Package,
  HardHat,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Shield,
  Wrench,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AppContext'

const mockVisitsData = {
  stats: {
    totalVisiteurs: 156,
    visitesEnCours: 4,
    visitesAttendu: 8,
    tauxPresence: 94.2,
    visitesAujourdhui: 23,
    visitesCetteSemaine: 89,
    visitesCeMois: 342,
  },
}

const mockMailData = {
  stats: {
    coliTotal: 89,
    courrierTotal: 156,
    enAttente: 7,
    livres: 234,
    urgents: 2,
    aujourdhui: 15,
    cetteSemaine: 67,
    ceMois: 245,
  },
}

const mockEquipmentData = {
  stats: {
    totalEquipements: 234,
    enService: 198,
    enMaintenance: 12,
    horsService: 8,
    needsInspection: 16,
    inspectionsToday: 5,
    inspectionsThisWeek: 23,
    inspectionsThisMonth: 89,
  },
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: string
  variant?: 'default' | 'success' | 'warning' | 'info'
}

const StatCard = ({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) => {
  const variantClasses = {
    default: 'bg-card text-card-foreground',
    success: 'bg-green-50 text-green-900 border-green-200',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    info: 'bg-blue-50 text-blue-900 border-blue-200',
  }

  const iconClasses = {
    default: 'text-muted-foreground',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  }

  return (
    <Card className={variantClasses[variant]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconClasses[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            <span className="text-xs text-green-600">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const StatistiquesFluxHSSEPage = () => {
  const { user } = useAuth()
  const [visitsData] = useState(mockVisitsData)
  const [mailData] = useState(mockMailData)
  const [equipmentData] = useState(mockEquipmentData)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statistiques Flux HSSE</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble des visites, colis/courriers et équipements de sécurité
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Chef de Division HSSE - {user?.fullName}
          </span>
        </div>
      </div>

      <Tabs defaultValue="visites" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visites" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Visites
          </TabsTrigger>
          <TabsTrigger value="colis" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Colis & Courriers
          </TabsTrigger>
          <TabsTrigger value="equipements" className="flex items-center gap-2">
            <HardHat className="h-4 w-4" />
            Équipements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visites" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Visiteurs"
              value={visitsData.stats.totalVisiteurs}
              icon={Users}
              trend="+12% ce mois"
              variant="info"
            />
            <StatCard
              title="Visites Aujourd'hui"
              value={visitsData.stats.visitesAujourdhui}
              icon={Clock}
              trend="+3 vs hier"
              variant="default"
            />
            <StatCard
              title="Taux de Présence"
              value={`${visitsData.stats.tauxPresence}%`}
              icon={CheckCircle}
              trend="+2.1% vs mois dernier"
              variant="success"
            />
            <StatCard
              title="Visites en Cours"
              value={visitsData.stats.visitesEnCours}
              icon={AlertCircle}
              trend="À surveiller"
              variant="warning"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Cette Semaine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visitsData.stats.visitesCetteSemaine}</div>
                <p className="text-sm text-muted-foreground">visites enregistrées</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Ce Mois
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visitsData.stats.visitesCeMois}</div>
                <p className="text-sm text-muted-foreground">visites enregistrées</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  En Attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visitsData.stats.visitesAttendu}</div>
                <p className="text-sm text-muted-foreground">visiteurs attendus</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="colis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Colis"
              value={mailData.stats.coliTotal}
              icon={Package}
              trend="+8% ce mois"
              variant="info"
            />
            <StatCard
              title="Total Courriers"
              value={mailData.stats.courrierTotal}
              icon={Package}
              trend="+15% ce mois"
              variant="default"
            />
            <StatCard
              title="En Attente"
              value={mailData.stats.enAttente}
              icon={Clock}
              trend="À traiter"
              variant="warning"
            />
            <StatCard
              title="Livrés"
              value={mailData.stats.livres}
              icon={CheckCircle}
              trend="+5% vs mois dernier"
              variant="success"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Aujourd'hui
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mailData.stats.aujourdhui}</div>
                <p className="text-sm text-muted-foreground">colis et courriers reçus</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Cette Semaine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mailData.stats.cetteSemaine}</div>
                <p className="text-sm text-muted-foreground">colis et courriers reçus</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Urgents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{mailData.stats.urgents}</div>
                <p className="text-sm text-muted-foreground">colis/courriers urgents</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="equipements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Équipements"
              value={equipmentData.stats.totalEquipements}
              icon={HardHat}
              trend="+3% ce mois"
              variant="info"
            />
            <StatCard
              title="En Service"
              value={equipmentData.stats.enService}
              icon={CheckCircle}
              trend="+2% vs mois dernier"
              variant="success"
            />
            <StatCard
              title="En Maintenance"
              value={equipmentData.stats.enMaintenance}
              icon={Wrench}
              trend="À surveiller"
              variant="warning"
            />
            <StatCard
              title="À Inspecter"
              value={equipmentData.stats.needsInspection}
              icon={AlertCircle}
              trend="Action requise"
              variant="warning"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Inspections Aujourd'hui
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{equipmentData.stats.inspectionsToday}</div>
                <p className="text-sm text-muted-foreground">inspections programmées</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Cette Semaine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{equipmentData.stats.inspectionsThisWeek}</div>
                <p className="text-sm text-muted-foreground">inspections programmées</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Ce Mois
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{equipmentData.stats.inspectionsThisMonth}</div>
                <p className="text-sm text-muted-foreground">inspections programmées</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Statut</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Opérationnels</span>
                    <span className="font-semibold text-green-600">
                      {equipmentData.stats.enService}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>En maintenance</span>
                    <span className="font-semibold text-yellow-600">
                      {equipmentData.stats.enMaintenance}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hors service</span>
                    <span className="font-semibold text-red-600">
                      {equipmentData.stats.horsService}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inspections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>À inspecter</span>
                    <span className="font-semibold text-orange-600">
                      {equipmentData.stats.needsInspection}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>En retard</span>
                    <span className="font-semibold text-red-600">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bientôt</span>
                    <span className="font-semibold text-yellow-600">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
