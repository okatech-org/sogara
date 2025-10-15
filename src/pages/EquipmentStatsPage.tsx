import { useState } from 'react'
import {
  HardHat,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Wrench,
} from 'lucide-react'
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

// Mock data pour les statistiques d'équipements
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
  equipment: [
    {
      id: '1',
      type: 'Casque de sécurité',
      label: 'CAS-001',
      serialNumber: 'SN123456',
      holder: 'Pierre BEKALE',
      service: 'Production',
      status: 'operational',
      nextCheckDate: '2024-02-15',
      location: 'Zone A',
    },
    {
      id: '2',
      type: 'Gilet de sécurité',
      label: 'GIL-002',
      serialNumber: 'SN789012',
      holder: 'Sylvie KOUMBA',
      service: 'Sécurité',
      status: 'maintenance',
      nextCheckDate: '2024-01-20',
      location: 'Zone B',
    },
    {
      id: '3',
      type: 'Détecteur de gaz',
      label: 'DET-003',
      serialNumber: 'SN345678',
      holder: null,
      service: 'HSSE',
      status: 'out_of_service',
      nextCheckDate: '2024-01-18',
      location: 'Zone C',
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
    { id: '1', name: 'Pierre BEKALE (EMP001)', role: 'EMPLOYE' },
    { id: '2', name: 'Lié Orphé BOURDES (HSE001)', role: 'HSE' },
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
      description: `Rôle de gestion des équipements attribué avec succès`,
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
        Attribuer le Rôle de Gestion des Équipements
      </Button>
    </div>
  )
}

export const EquipmentStatsPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [equipmentData] = useState(mockEquipmentData)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Opérationnel
          </Badge>
        )
      case 'maintenance':
        return <Badge variant="warning">En maintenance</Badge>
      case 'out_of_service':
        return <Badge variant="destructive">Hors service</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getInspectionStatus = (nextCheckDate: string) => {
    const today = new Date()
    const checkDate = new Date(nextCheckDate)
    const diffDays = Math.ceil((checkDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return <Badge variant="destructive">En retard</Badge>
    } else if (diffDays <= 7) {
      return <Badge variant="warning">Bientôt</Badge>
    } else {
      return <Badge variant="outline">OK</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statistiques - Équipements</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble des équipements et gestion des rôles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <HardHat className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Chef de Division HSSE - {user?.fullName}
          </span>
        </div>
      </div>

      {/* KPIs Grid */}
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="equipment">Équipements</TabsTrigger>
          <TabsTrigger value="assignment">Attribution de rôles</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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

        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Équipements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>N° Série</TableHead>
                    <TableHead>Détenteur</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Prochaine Inspection</TableHead>
                    <TableHead>Localisation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipmentData.equipment.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.type}</TableCell>
                      <TableCell>{item.label}</TableCell>
                      <TableCell>{item.serialNumber}</TableCell>
                      <TableCell>{item.holder || 'Non assigné'}</TableCell>
                      <TableCell>{item.service}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {new Date(item.nextCheckDate).toLocaleDateString('fr-FR')}
                          </div>
                          {getInspectionStatus(item.nextCheckDate)}
                        </div>
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
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
              <CardTitle>Attribution du Rôle de Gestion des Équipements</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleAssignmentSection module="equipment" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
