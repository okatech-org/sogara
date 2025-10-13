import {
  Crown,
  TrendingUp,
  Users,
  Shield,
  DollarSign,
  BarChart3,
  Target,
  Award,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AppContext'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '@/hooks/useDashboard'

export function DirectionDashboard() {
  const { currentUser, state } = useAuth()
  const navigate = useNavigate()
  const { stats } = useDashboard()

  const kpis = [
    {
      title: 'Performance Opérationnelle',
      value: '95%',
      trend: '+5%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Effectif Total',
      value: state.employees.length,
      trend: 'Actifs',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Conformité HSE',
      value: `${stats.hse.complianceRate}%`,
      trend: stats.hse.complianceRate >= 90 ? 'Excellent' : 'À surveiller',
      icon: Shield,
      color: stats.hse.complianceRate >= 90 ? 'text-green-600' : 'text-yellow-600',
      bgColor: stats.hse.complianceRate >= 90 ? 'bg-green-100' : 'bg-yellow-100',
    },
    {
      title: 'Objectifs Stratégiques',
      value: '8/10',
      trend: '80%',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  const strategicAreas = [
    {
      title: 'Ressources Humaines',
      description: 'Gestion du personnel et développement des compétences',
      icon: Users,
      route: '/app/rh',
      color: 'bg-blue-500',
      metrics: [
        { label: 'Employés', value: state.employees.length },
        { label: 'Formations HSE', value: stats.hse.trainingsThisWeek },
      ],
    },
    {
      title: 'HSE & Conformité',
      description: 'Sécurité, santé et environnement',
      icon: Shield,
      route: '/app/hse',
      color: 'bg-orange-500',
      metrics: [
        { label: 'Conformité', value: `${stats.hse.complianceRate}%` },
        { label: 'Incidents ouverts', value: stats.hse.openIncidents },
      ],
    },
    {
      title: 'Operations & Production',
      description: 'Suivi des activités opérationnelles',
      icon: Activity,
      route: '/app/equipements',
      color: 'bg-green-500',
      metrics: [
        { label: 'Équipements actifs', value: stats.equipment.operational },
        { label: 'Maintenance', value: stats.equipment.inMaintenance },
      ],
    },
    {
      title: 'Communication Interne',
      description: "SOGARA Connect et vie de l'entreprise",
      icon: Award,
      route: '/app/connect',
      color: 'bg-purple-500',
      metrics: [
        { label: 'Publications', value: state.posts.length },
        { label: 'Engagement', value: 'Élevé' },
      ],
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center">
              <Crown className="w-7 h-7" />
            </div>
            Tableau de Bord Direction Générale
          </h1>
          <p className="text-muted-foreground mt-2">
            Vue stratégique et pilotage -{' '}
            {currentUser?.fullName || `${currentUser?.firstName} ${currentUser?.lastName}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
            Directeur Général
          </Badge>
          <Badge variant="outline" className="text-sm px-3 py-1">
            ADMIN
          </Badge>
        </div>
      </div>

      {/* KPIs Stratégiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title} className="industrial-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.trend}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Domaines Stratégiques */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Pilotage par Domaine</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategicAreas.map(area => {
            const Icon = area.icon
            return (
              <Card
                key={area.title}
                className="industrial-card hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate(area.route)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-14 h-14 ${area.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-3">{area.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{area.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {area.metrics.map((metric, index) => (
                      <div key={index} className="text-center p-2 bg-muted/30 rounded">
                        <div className="text-xl font-bold text-foreground">{metric.value}</div>
                        <div className="text-xs text-muted-foreground">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    Consulter →
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle>Indicateurs Clés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Taux de conformité HSE</span>
                <span className="font-semibold">{stats.hse.complianceRate}%</span>
              </div>
              <Progress value={stats.hse.complianceRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Équipements opérationnels</span>
                <span className="font-semibold">95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Satisfaction interne</span>
                <span className="font-semibold">88%</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader>
            <CardTitle>Priorités de la Semaine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Shield className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">Audit HSE trimestriel</p>
                <p className="text-xs text-muted-foreground">Préparation documentation</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">Comité de direction</p>
                <p className="text-xs text-muted-foreground">Vendredi 15h00</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">Présentation résultats Q1</p>
                <p className="text-xs text-muted-foreground">Conseil d'administration</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
