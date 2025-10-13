import {
  UserCog,
  Users,
  GraduationCap,
  Shield,
  TrendingUp,
  Calendar,
  UserPlus,
  Award,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AppContext'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '@/hooks/useDashboard'

export function RHDashboard() {
  const { currentUser, state } = useAuth()
  const navigate = useNavigate()
  const { stats } = useDashboard()

  const rhKPIs = [
    {
      title: 'Effectif Total',
      value: state.employees.length,
      subtitle: 'Collaborateurs actifs',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Formations HSE',
      value: stats.hse.trainingsThisWeek,
      subtitle: 'Cette semaine',
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Taux Conformité',
      value: `${stats.hse.complianceRate}%`,
      subtitle: stats.hse.complianceRate >= 90 ? 'Excellent' : 'À améliorer',
      icon: Shield,
      color: stats.hse.complianceRate >= 90 ? 'text-green-600' : 'text-yellow-600',
      bgColor: stats.hse.complianceRate >= 90 ? 'bg-green-100' : 'bg-yellow-100',
    },
    {
      title: 'Satisfaction',
      value: '87%',
      subtitle: 'Enquête annuelle',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  const rhModules = [
    {
      title: 'Gestion du Personnel',
      description: 'Base de données collaborateurs',
      icon: Users,
      route: '/app/personnel',
      count: state.employees.length,
      color: 'bg-blue-500',
    },
    {
      title: 'Formations & Compétences',
      description: 'Suivi formations et habilitations',
      icon: GraduationCap,
      route: '/app/hse',
      count: stats.hse.trainingsThisWeek,
      color: 'bg-green-500',
    },
    {
      title: 'Sécurité & Conformité',
      description: 'HSE et conformité réglementaire',
      icon: Shield,
      route: '/app/hse',
      count: stats.hse.complianceRate,
      color: 'bg-orange-500',
    },
  ]

  const byService = [
    {
      service: 'Production',
      count: state.employees.filter(e => e.service === 'Production').length,
    },
    {
      service: 'HSE et Conformité',
      count: state.employees.filter(e => e.service === 'HSE et Conformité').length,
    },
    {
      service: 'Communication',
      count: state.employees.filter(e => e.service === 'Communication').length,
    },
    { service: 'Sécurité', count: state.employees.filter(e => e.service === 'Sécurité').length },
    {
      service: 'Direction Générale',
      count: state.employees.filter(e => e.service === 'Direction Générale').length,
    },
    {
      service: 'Ressources Humaines',
      count: state.employees.filter(e => e.service === 'Ressources Humaines').length,
    },
    {
      service: 'ORGANEUS Gabon',
      count: state.employees.filter(e => e.service === 'ORGANEUS Gabon').length,
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary text-secondary-foreground rounded-xl flex items-center justify-center">
              <UserCog className="w-7 h-7" />
            </div>
            Tableau de Bord Ressources Humaines
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestion du capital humain -{' '}
            {currentUser?.fullName || `${currentUser?.firstName} ${currentUser?.lastName}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-secondary text-secondary-foreground text-sm px-3 py-1">DRH</Badge>
          <Badge variant="outline" className="text-sm px-3 py-1">
            ADMIN
          </Badge>
        </div>
      </div>

      {/* KPIs RH */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {rhKPIs.map(kpi => {
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
                <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modules RH */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Modules RH</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rhModules.map(module => {
            const Icon = module.icon
            return (
              <Card
                key={module.title}
                className="industrial-card hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate(module.route)}
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform mb-3`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary">{module.count}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      Accéder →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Répartition par service */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle>Répartition par Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {byService.map(item => (
              <div
                key={item.service}
                className="flex items-center justify-between p-2 hover:bg-muted/30 rounded"
              >
                <span className="text-sm font-medium">{item.service}</span>
                <Badge variant="outline">
                  {item.count} {item.count > 1 ? 'employés' : 'employé'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader>
            <CardTitle>Actions RH Prioritaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => navigate('/app/personnel')}
            >
              <UserPlus className="w-4 h-4" />
              Gérer les employés
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => navigate('/app/hse')}
            >
              <GraduationCap className="w-4 h-4" />
              Suivi des formations HSE
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => navigate('/app/hse')}
            >
              <Shield className="w-4 h-4" />
              Conformité et habilitations
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => navigate('/app/connect')}
            >
              <Calendar className="w-4 h-4" />
              Communication RH
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
