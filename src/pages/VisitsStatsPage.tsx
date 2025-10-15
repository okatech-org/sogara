import { useState } from 'react'
import { Users, TrendingUp, Clock, CheckCircle, AlertCircle, BarChart3, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { useToast } from '@/hooks/use-toast'

// Mock data pour les statistiques de visites
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
  visitors: [
    {
      id: '1',
      nom: 'Jean DUPONT',
      entreprise: 'TOTAL ENERGIES',
      heureArrivee: '09:30',
      statut: 'en_cours',
      hote: 'Pierre BEKALE',
      service: 'Production',
    },
    {
      id: '2',
      nom: 'Marie MARTIN',
      entreprise: 'SCHLUMBERGER',
      heureArrivee: '10:15',
      statut: 'attendu',
      hote: 'Sylvie KOUMBA',
      service: 'Sécurité',
    },
    {
      id: '3',
      nom: 'Paul BERNARD',
      entreprise: 'HALLIBURTON',
      heureArrivee: '08:45',
      statut: 'termine',
      hote: 'Lié Orphé BOURDES',
      service: 'HSSE',
    },
  ],
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

const RoleAssignmentSection = ({ module }: { module: string }) => {
  const { toast } = useToast()
  const [selectedUser, setSelectedUser] = useState('')

  const eligibleUsers = [
    { id: '1', name: 'Sylvie KOUMBA (REC001)', role: 'RECEP' },
    { id: '2', name: 'Jean SECURITE (SEC001)', role: 'SECURITE' },
  ]

  const handleAssignRole = () => {
    if (!selectedUser) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un utilisateur',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Succès',
      description: `Rôle de gestion des visites attribué avec succès`,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Sélectionner un utilisateur</label>
        <select
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          className="w-full p-2 border rounded-md mt-1"
        >
          <option value="">Choisir un utilisateur...</option>
          {eligibleUsers.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} - {user.role}
            </option>
          ))}
        </select>
      </div>
      <Button onClick={handleAssignRole} disabled={!selectedUser}>
        Attribuer le Rôle de Gestion des Visites
      </Button>
    </div>
  )
}

export const VisitsStatsPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [visitsData] = useState(mockVisitsData)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_cours':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            En cours
          </Badge>
        )
      case 'attendu':
        return <Badge variant="warning">Attendu</Badge>
      case 'termine':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Terminé
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statistiques - Gestion des Visites</h1>
          <p className="text-muted-foreground">Vue d'ensemble des visites et gestion des rôles</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Chef de Division HSSE - {user?.fullName}
          </span>
        </div>
      </div>

      {/* KPIs Grid */}
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="visitors">Visiteurs actuels</TabsTrigger>
          <TabsTrigger value="assignment">Attribution de rôles</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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

        <TabsContent value="visitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visiteurs Actuels</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Heure d'arrivée</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Hôte</TableHead>
                    <TableHead>Service</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitsData.visitors.map(visitor => (
                    <TableRow key={visitor.id}>
                      <TableCell className="font-medium">{visitor.nom}</TableCell>
                      <TableCell>{visitor.entreprise}</TableCell>
                      <TableCell>{visitor.heureArrivee}</TableCell>
                      <TableCell>{getStatusBadge(visitor.statut)}</TableCell>
                      <TableCell>{visitor.hote}</TableCell>
                      <TableCell>{visitor.service}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attribution du Rôle de Gestion des Visites</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleAssignmentSection module="visits" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
