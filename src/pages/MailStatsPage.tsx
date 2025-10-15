import { useState } from 'react'
import { Package, TrendingUp, Clock, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react'
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

// Mock data pour les statistiques de colis et courriers
const mockMailData = {
  stats: {
    coliTotal: 89,
    courrierTotal: 156,
    enAttente: 7,
    livres: 234,
    urgents: 2,
    confidentiels: 12,
    aujourdhui: 15,
    cetteSemaine: 67,
    ceMois: 245,
  },
  mail: [
    {
      id: '1',
      type: 'colis',
      reference: 'COL-2024-001',
      expediteur: 'TOTAL ENERGIES',
      destinataire: 'Pierre BEKALE',
      service: 'Production',
      statut: 'en_attente',
      priorite: 'normal',
      dateReception: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      type: 'courrier',
      reference: 'COUR-2024-002',
      expediteur: 'MINISTERE',
      destinataire: 'Direction Générale',
      service: 'Direction',
      statut: 'livre',
      priorite: 'urgent',
      dateReception: '2024-01-15T09:15:00Z',
    },
    {
      id: '3',
      type: 'colis',
      reference: 'COL-2024-003',
      expediteur: 'SCHLUMBERGER',
      destinataire: 'Sylvie KOUMBA',
      service: 'Sécurité',
      statut: 'livre',
      priorite: 'normal',
      dateReception: '2024-01-15T08:45:00Z',
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

  const eligibleUsers = [{ id: '1', name: 'Sylvie KOUMBA (REC001)', role: 'RECEP' }]

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
      description: `Rôle de gestion des colis et courriers attribué avec succès`,
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
        Attribuer le Rôle de Gestion des Colis & Courriers
      </Button>
    </div>
  )
}

export const MailStatsPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [mailData] = useState(mockMailData)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_attente':
        return <Badge variant="warning">En attente</Badge>
      case 'livre':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Livré
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>
      case 'normal':
        return <Badge variant="outline">Normal</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'colis':
        return <Badge variant="secondary">Colis</Badge>
      case 'courrier':
        return <Badge variant="default">Courrier</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statistiques - Colis & Courriers</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble des colis et courriers, gestion des rôles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Chef de Division HSSE - {user?.fullName}
          </span>
        </div>
      </div>

      {/* KPIs Grid */}
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="mail">Colis & Courriers actuels</TabsTrigger>
          <TabsTrigger value="assignment">Attribution de rôles</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Colis</span>
                    <span className="font-semibold">{mailData.stats.coliTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Courriers</span>
                    <span className="font-semibold">{mailData.stats.courrierTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidentiels</span>
                    <span className="font-semibold">{mailData.stats.confidentiels}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statut de Livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Livrés</span>
                    <span className="font-semibold text-green-600">{mailData.stats.livres}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>En attente</span>
                    <span className="font-semibold text-yellow-600">
                      {mailData.stats.enAttente}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Colis & Courriers Récents</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Expéditeur</TableHead>
                    <TableHead>Destinataire</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mailData.mail.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{getTypeBadge(item.type)}</TableCell>
                      <TableCell className="font-medium">{item.reference}</TableCell>
                      <TableCell>{item.expediteur}</TableCell>
                      <TableCell>{item.destinataire}</TableCell>
                      <TableCell>{item.service}</TableCell>
                      <TableCell>{getStatusBadge(item.statut)}</TableCell>
                      <TableCell>{getPriorityBadge(item.priorite)}</TableCell>
                      <TableCell>
                        {new Date(item.dateReception).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
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
              <CardTitle>Attribution du Rôle de Gestion des Colis & Courriers</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleAssignmentSection module="mail" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
