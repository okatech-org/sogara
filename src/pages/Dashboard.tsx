import { useState, useEffect } from 'react'
import {
  Calendar,
  Package,
  HardHat,
  Shield,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  BookOpen,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useDashboard } from '@/hooks/useDashboard'
import { useAuth } from '@/contexts/AppContext'
import { useEmployeeHSEInbox } from '@/hooks/useEmployeeHSEInbox'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmployeeHSEInbox } from '@/components/employee/EmployeeHSEInbox'
import { EmployeeDashboard } from './EmployeeDashboard'
import { ExternalDashboard } from './external/ExternalDashboard'
import { useNavigate } from 'react-router-dom'

// Composant HSSEDashboard pour le Chef de Division HSSE
const HSSEDashboard = () => {
  const { user, currentUser } = useAuth()
  const navigate = useNavigate()

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

  const [stats] = useState(mockStats)

  // Calcul des KPIs
  const totalIncidents = stats.incidents.total
  const incidentsOuverts = stats.incidents.open
  const tauxConformite = stats.trainings.compliance
  const formationsEnCours = stats.trainings.scheduled

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion HSSE</h1>
          <p className="text-muted-foreground">Statistiques et supervision de la division HSSE</p>
          <div className="flex items-center gap-2 mt-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Chef de Division HSSE - {user?.fullName || currentUser?.fullName}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/app/hsse-accounts')} variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Gérer les Comptes HSSE
          </Button>
          <Button onClick={() => navigate('/app/hse001')}>
            <Shield className="mr-2 h-4 w-4" />
            Administration HSSE
          </Button>
        </div>
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

      {/* Modules Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Visites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Aujourd'hui</span>
                <span className="font-semibold">{stats.visits.today}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">En cours</span>
                <Badge variant="outline">{stats.visits.inProgress}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Terminées</span>
                <span className="text-green-600 font-semibold">{stats.visits.completed}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => navigate('/app/visits-stats')}
            >
              Voir les Statistiques
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Colis & Courriers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">En attente</span>
                <Badge variant="warning">{stats.mail.pending}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Urgents</span>
                <Badge variant="destructive">{stats.mail.urgent}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Livrés</span>
                <span className="text-green-600 font-semibold">{stats.mail.delivered}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => navigate('/app/mail-stats')}
            >
              Voir les Statistiques
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardHat className="h-5 w-5" />
              Équipements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Opérationnels</span>
                <span className="text-green-600 font-semibold">{stats.equipment.operational}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">En maintenance</span>
                <Badge variant="warning">{stats.equipment.maintenance}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">À inspecter</span>
                <Badge variant="outline">{stats.equipment.needsInspection}</Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => navigate('/app/equipment-stats')}
            >
              Voir les Statistiques
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Actions Rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Actions Rapides HSSE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/app/hsse-accounts')}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Gérer Comptes HSSE</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/app/hse001')}
            >
              <Shield className="h-6 w-6" />
              <span className="text-sm">Administration HSSE</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/app/visits-stats')}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Stats Visites</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/app/mail-stats')}
            >
              <Package className="h-6 w-6" />
              <span className="text-sm">Stats Colis</span>
            </Button>
          </div>
        </CardContent>
      </Card>

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

export function Dashboard() {
  const { stats, recentNotifications, markNotificationAsRead } = useDashboard()
  const { currentUser, hasAnyRole, user } = useAuth()
  const [showHSEInbox, setShowHSEInbox] = useState(false)
  const navigate = useNavigate()

  const { unreadCount, complianceRate, pendingTrainings, completedTrainings } = useEmployeeHSEInbox(
    currentUser?.id || '',
  )

  // Si l'utilisateur est un candidat EXTERNE, afficher le dashboard externe
  if (currentUser?.roles.includes('EXTERNE')) {
    return <ExternalDashboard />
  }

  // Si l'utilisateur est un simple EMPLOYE (pas admin, HSE, etc.), afficher le dashboard employé
  if (currentUser?.roles.length === 1 && currentUser.roles[0] === 'EMPLOYE') {
    return <EmployeeDashboard />
  }

  // Si c'est le compte HSE001 (Chef de Division HSSE), afficher le dashboard HSSE
  const isHSSEDirector =
    (user?.roles && user.roles.includes('HSSE_CHIEF')) ||
    user?.matricule === 'HSE001' ||
    (currentUser?.roles && currentUser.roles.includes('HSSE_CHIEF')) ||
    currentUser?.matricule === 'HSE001'

  if (isHSSEDirector) {
    return <HSSEDashboard />
  }

  const kpiCards = [
    {
      title: "Visites aujourd'hui",
      value: stats.visitsToday.total,
      change: `${stats.visitsToday.waiting} en attente`,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Colis en attente',
      value: stats.packages.pending,
      change: `${stats.packages.urgent} urgents`,
      icon: Package,
      color: stats.packages.urgent > 0 ? 'text-accent' : 'text-primary',
      bgColor: stats.packages.urgent > 0 ? 'bg-accent/10' : 'bg-primary/10',
    },
    {
      title: 'Équipements à contrôler',
      value: stats.equipment.needsCheck,
      change: `${stats.equipment.inMaintenance} en maintenance`,
      icon: HardHat,
      color: stats.equipment.needsCheck > 0 ? 'text-warning' : 'text-success',
      bgColor: stats.equipment.needsCheck > 0 ? 'bg-warning/10' : 'bg-success/10',
    },
    {
      title: 'Conformité HSE',
      value: `${stats.hse.complianceRate}%`,
      change: `${stats.hse.openIncidents} incidents ouverts`,
      icon: Shield,
      color: stats.hse.complianceRate >= 95 ? 'text-success' : 'text-warning',
      bgColor: stats.hse.complianceRate >= 95 ? 'bg-success/10' : 'bg-warning/10',
    },
  ]

  const visitStatusData = [
    { label: 'En attente', count: stats.visitsToday.waiting, variant: 'warning' as const },
    { label: 'En cours', count: stats.visitsToday.inProgress, variant: 'info' as const },
    { label: 'Terminées', count: stats.visitsToday.completed, variant: 'success' as const },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bonjour {currentUser?.firstName}, voici l'aperçu de votre journée
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card
              key={index}
              className="industrial-card hover:shadow-[var(--shadow-elevated)] transition-shadow animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Visites du jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visitStatusData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.label} variant={item.variant} />
                  </div>
                  <span className="font-semibold text-lg">{item.count}</span>
                </div>
              ))}
            </div>

            {stats.visitsToday.total === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucune visite programmée aujourd'hui</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Notifications récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentNotifications.length > 0 ? (
                recentNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div
                      className={`p-1 rounded-full mt-1 ${
                        notification.type === 'urgent'
                          ? 'bg-destructive/10'
                          : notification.type === 'warning'
                            ? 'bg-warning/10'
                            : notification.type === 'success'
                              ? 'bg-success/10'
                              : 'bg-primary/10'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          notification.type === 'urgent'
                            ? 'bg-destructive'
                            : notification.type === 'warning'
                              ? 'bg-warning'
                              : notification.type === 'success'
                                ? 'bg-success'
                                : 'bg-primary'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune notification en attente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Colis & Courriers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">En attente de remise</span>
                <Badge variant={stats.packages.pending > 0 ? 'destructive' : 'secondary'}>
                  {stats.packages.pending}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Priorité urgente</span>
                <Badge variant={stats.packages.urgent > 0 ? 'destructive' : 'secondary'}>
                  {stats.packages.urgent}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Remis aujourd'hui</span>
                <Badge variant="outline">{stats.packages.delivered}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardHat className="w-5 h-5" />
              Équipements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Contrôles à venir</span>
                <Badge variant={stats.equipment.needsCheck > 0 ? 'destructive' : 'secondary'}>
                  {stats.equipment.needsCheck}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">En maintenance</span>
                <Badge variant="outline">{stats.equipment.inMaintenance}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`industrial-card cursor-pointer hover:shadow-lg transition-all ${
            unreadCount > 0 ? 'border-2 border-primary' : ''
          }`}
          onClick={() => setShowHSEInbox(true)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-lg ${
                    complianceRate >= 90
                      ? 'bg-green-100'
                      : complianceRate >= 70
                        ? 'bg-yellow-100'
                        : 'bg-red-100'
                  }`}
                >
                  <Shield
                    className={`w-5 h-5 ${
                      complianceRate >= 90
                        ? 'text-green-600'
                        : complianceRate >= 70
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  />
                </div>
                <span>Mon Espace HSE</span>
              </CardTitle>
              {unreadCount > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="animate-pulse">
                    {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                  </Badge>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Ma conformité HSE</span>
                  <Badge
                    variant={
                      complianceRate >= 90
                        ? 'default'
                        : complianceRate >= 70
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {complianceRate}%
                  </Badge>
                </div>
                <Progress
                  value={complianceRate}
                  className={`h-2 ${
                    complianceRate >= 90
                      ? 'bg-green-100'
                      : complianceRate >= 70
                        ? 'bg-yellow-100'
                        : 'bg-red-100'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-yellow-50 rounded">
                  <div className="font-bold text-lg text-yellow-600">{pendingTrainings.length}</div>
                  <div className="text-muted-foreground">En attente</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-bold text-lg text-green-600">
                    {completedTrainings.length}
                  </div>
                  <div className="text-muted-foreground">Complétées</div>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground"
              >
                <BookOpen className="w-4 h-4" />
                Accéder à mon espace HSE
                {unreadCount > 0 && <Badge className="ml-auto">{unreadCount}</Badge>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Mon Espace HSE */}
      <Dialog open={showHSEInbox} onOpenChange={setShowHSEInbox}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mon Espace HSE Personnel</DialogTitle>
          </DialogHeader>
          <EmployeeHSEInbox employeeId={currentUser?.id || ''} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
