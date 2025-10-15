import { useState } from 'react'
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  Package,
  HardHat,
  BarChart3,
  Newspaper,
  CalendarDays,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AppContext'

// Mock data pour les statistiques
const mockStats = {
  incidents: {
    total: 15,
    open: 3,
    thisMonth: 8,
    highSeverity: 1,
  },
  trainings: {
    scheduled: 12,
    completed: 45,
    compliance: 92,
    upcoming: 5,
  },
  equipment: {
    needsInspection: 8,
    operational: 156,
    maintenance: 12,
  },
  visits: {
    today: 23,
    inProgress: 4,
    completed: 19,
  },
  mail: {
    pending: 7,
    urgent: 2,
    delivered: 34,
  },
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
  subtitle?: string
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  subtitle,
}: StatCardProps) => {
  const variantClasses = {
    default: 'bg-card text-card-foreground',
    success: 'bg-green-50 text-green-900 border-green-200',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    danger: 'bg-red-50 text-red-900 border-red-200',
  }

  const iconClasses = {
    default: 'text-muted-foreground',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  }

  return (
    <Card className={variantClasses[variant]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconClasses[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
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

export const HSSEManagementPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState(mockStats)

  // Calcul des KPIs
  const totalIncidents = stats.incidents.total
  const incidentsOuverts = stats.incidents.open
  const tauxConformite = stats.trainings.compliance
  const formationsEnCours = stats.trainings.scheduled

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de Bord HSSE</h1>
          <p className="text-muted-foreground">
            Supervision centralisée de toutes les sections HSSE
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Chef de Division HSSE - {user?.fullName}
            </span>
          </div>
        </div>
        <Button onClick={() => navigate('/app/hse001')} size="lg">
          <Shield className="mr-2 h-5 w-5" />
          Administration HSSE
        </Button>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Incidents Total"
          value={totalIncidents}
          icon={AlertTriangle}
          trend="+5% ce mois"
          variant="warning"
          subtitle={`${stats.incidents.thisMonth} ce mois`}
        />
        <StatCard
          title="Incidents Ouverts"
          value={incidentsOuverts}
          icon={AlertTriangle}
          trend="À traiter"
          variant="danger"
          subtitle={`${stats.incidents.highSeverity} sévérité élevée`}
        />
        <StatCard
          title="Taux de Conformité"
          value={`${tauxConformite}%`}
          icon={CheckCircle}
          trend="+2% vs mois dernier"
          variant="success"
          subtitle="Formations HSSE"
        />
        <StatCard
          title="Formations Programmées"
          value={formationsEnCours}
          icon={TrendingUp}
          trend="Planning respecté"
          variant="default"
          subtitle={`${stats.trainings.upcoming} cette semaine`}
        />
      </div>

      {/* Modules de Supervision HSSE */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Modules de Supervision</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Administration HSSE */}
          <Card
            className="cursor-pointer hover:border-primary transition-all hover:shadow-lg"
            onClick={() => navigate('/app/hse001')}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Administration HSSE
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Administration complète HSSE : incidents, formations, conformité
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Incidents ouverts</span>
                  <Badge variant="destructive">{stats.incidents.open}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Formations programmées</span>
                  <Badge variant="outline">{stats.trainings.scheduled}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Conformité</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {stats.trainings.compliance}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques Flux HSSE */}
          <Card
            className="cursor-pointer hover:border-primary transition-all hover:shadow-lg"
            onClick={() => navigate('/app/flux-hsse')}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Statistiques Flux HSSE
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Statistiques visites, colis et équipements
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs flex items-center gap-1">
                    <Users className="h-3 w-3" /> Visites aujourd'hui
                  </span>
                  <span className="font-semibold">{stats.visits.today}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs flex items-center gap-1">
                    <Package className="h-3 w-3" /> Colis en attente
                  </span>
                  <Badge variant="warning">{stats.mail.pending}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs flex items-center gap-1">
                    <HardHat className="h-3 w-3" /> Équipements à inspecter
                  </span>
                  <Badge variant="outline">{stats.equipment.needsInspection}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SOGARA Connect */}
          <Card
            className="cursor-pointer hover:border-primary transition-all hover:shadow-lg"
            onClick={() => navigate('/app/connect')}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-orange-600" />
                  SOGARA Connect
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Communication interne et actualités de l'entreprise
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Dernières actualités</span>
                  <Badge variant="outline">5 nouvelles</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Événements à venir</span>
                  <Badge variant="outline">3</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Annonces HSSE</span>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    2 importantes
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mon Planning */}
          <Card
            className="cursor-pointer hover:border-primary transition-all hover:shadow-lg"
            onClick={() => navigate('/app/mon-planning')}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-purple-600" />
                  Mon Planning
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Planning personnel et gestion des activités HSSE
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Tâches aujourd'hui</span>
                  <Badge variant="default">7</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Réunions cette semaine</span>
                  <Badge variant="outline">4</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Inspections planifiées</span>
                  <Badge variant="warning">3 urgentes</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vue d'ensemble Visites */}
          <Card className="cursor-pointer hover:border-primary transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Aperçu Visites
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Supervision en temps réel des visites
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">En cours</span>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    {stats.visits.inProgress}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Terminées aujourd'hui</span>
                  <span className="text-green-600 font-semibold">{stats.visits.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Total aujourd'hui</span>
                  <span className="font-semibold">{stats.visits.today}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3"
                onClick={e => {
                  e.stopPropagation()
                  navigate('/app/flux-hsse')
                }}
              >
                Voir détails <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>

          {/* Vue d'ensemble Équipements */}
          <Card className="cursor-pointer hover:border-primary transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardHat className="h-5 w-5 text-amber-600" />
                  Aperçu Équipements
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">État des équipements de sécurité</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Opérationnels</span>
                  <span className="text-green-600 font-semibold">
                    {stats.equipment.operational}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">En maintenance</span>
                  <Badge variant="warning">{stats.equipment.maintenance}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">À inspecter</span>
                  <Badge variant="outline">{stats.equipment.needsInspection}</Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3"
                onClick={e => {
                  e.stopPropagation()
                  navigate('/app/flux-hsse')
                }}
              >
                Voir détails <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alertes Critiques */}
      {incidentsOuverts > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Attention Requise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-800">
              {incidentsOuverts} incident(s) ouvert(s) nécessitent un suivi immédiat.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="mt-2"
              onClick={() => navigate('/app/hse001')}
            >
              Consulter les Incidents
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
