import {
  Settings,
  Users,
  Shield,
  Package,
  TrendingUp,
  Activity,
  Database,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AppContext'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '@/hooks/useDashboard'

export function AdminDashboard() {
  const { currentUser, state } = useAuth()
  const navigate = useNavigate()
  const { stats } = useDashboard()

  const modules = [
    {
      title: 'Personnel',
      description: 'Gestion des employés et utilisateurs',
      icon: Users,
      route: '/app/personnel',
      color: 'bg-blue-500',
      stats: `${state.employees.length} employés`,
    },
    {
      title: 'HSE & Sécurité',
      description: 'Module sécurité et conformité',
      icon: Shield,
      route: '/app/hse',
      color: 'bg-orange-500',
      stats: `${stats.hse.openIncidents} incidents ouverts`,
    },
    {
      title: 'Équipements',
      description: 'Gestion des équipements et EPI',
      icon: Package,
      route: '/app/equipements',
      color: 'bg-purple-500',
      stats: `${stats.equipment.needsCheck} vérifications`,
    },
    {
      title: 'Visites',
      description: 'Contrôle des accès et visiteurs',
      icon: Activity,
      route: '/app/visites',
      color: 'bg-green-500',
      stats: `${stats.visitsToday.total} visites aujourd'hui`,
    },
    {
      title: 'SOGARA Connect',
      description: 'Communication interne',
      icon: FileText,
      route: '/app/connect',
      color: 'bg-indigo-500',
      stats: 'Actualités & Événements',
    },
    {
      title: 'Projet & Documentation',
      description: 'Documentation technique',
      icon: Database,
      route: '/app/projet',
      color: 'bg-cyan-500',
      stats: 'Spécifications système',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 bg-destructive text-destructive-foreground rounded-xl flex items-center justify-center">
              <Settings className="w-7 h-7" />
            </div>
            Dashboard Administrateur
          </h1>
          <p className="text-muted-foreground mt-2">
            Supervision complète -{' '}
            {currentUser?.fullName || `${currentUser?.firstName} ${currentUser?.lastName}`}
          </p>
        </div>
        <Badge className="bg-destructive text-destructive-foreground text-sm px-3 py-1">
          ADMIN
        </Badge>
      </div>

      {/* KPIs Système */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Employés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.employees.length}</div>
            <p className="text-xs text-muted-foreground">Comptes actifs</p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              Visites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.visitsToday.total}</div>
            <p className="text-xs text-muted-foreground">Aujourd'hui</p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500" />
              HSE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hse.complianceRate}%</div>
            <p className="text-xs text-muted-foreground">Conformité</p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-muted-foreground">Disponibilité</p>
          </CardContent>
        </Card>
      </div>

      {/* Modules d'accès */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Modules du Système</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(module => {
            const Icon = module.icon
            return (
              <Card
                key={module.route}
                className="industrial-card hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate(module.route)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {module.stats}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    Accéder →
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Accès rapides administrateur */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle>Actions Administrateur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/app/personnel')}
              className="justify-start gap-2"
            >
              <Users className="w-4 h-4" />
              Gérer les utilisateurs
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/app/hse')}
              className="justify-start gap-2"
            >
              <Shield className="w-4 h-4" />
              Supervision HSE
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/app/projet')}
              className="justify-start gap-2"
            >
              <Database className="w-4 h-4" />
              Documentation système
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
