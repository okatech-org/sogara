import { useState } from 'react'
import { Plus, Users, Shield, Edit, Trash2, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/contexts/AppContext'
import { useToast } from '@/hooks/use-toast'

// Mock data pour les comptes HSSE
const mockHSSEAccounts = [
  {
    id: '1',
    matricule: 'HSE001',
    fullName: 'Lié Orphé BOURDES',
    email: 'lie-orphe.bourdes@sogara.com',
    role: 'HSSE_CHIEF',
    service: 'HSSE et Conformité',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00Z',
    permissions: ['Administration HSSE', 'Création comptes', 'Gestion rôles'],
  },
  {
    id: '2',
    matricule: 'HSE002',
    fullName: 'Lise Véronique DITSOUGOU',
    email: 'lise-veronique.ditsougou@sogara.com',
    role: 'HSE',
    service: 'HSSE et Conformité',
    status: 'active',
    lastLogin: '2024-01-15T09:15:00Z',
    permissions: ['Gestion incidents', 'Formations HSSE', 'Conformité'],
  },
  {
    id: '3',
    matricule: 'SEC001',
    fullName: 'Jean SECURITE',
    email: 'jean.securite@sogara.com',
    role: 'SECURITE',
    service: 'Sécurité',
    status: 'active',
    lastLogin: '2024-01-15T08:45:00Z',
    permissions: ['Contrôle accès', 'Surveillance', 'Incidents sécurité'],
  },
]

interface HSSEAccount {
  id: string
  matricule: string
  fullName: string
  email: string
  role: string
  service: string
  status: 'active' | 'inactive'
  lastLogin: string
  permissions: string[]
}

const HSSEAccountsTable = ({
  accounts,
  onEdit,
  onDelete,
  onView,
}: {
  accounts: HSSEAccount[]
  onEdit: (account: HSSEAccount) => void
  onDelete: (account: HSSEAccount) => void
  onView: (account: HSSEAccount) => void
}) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'HSSE_CHIEF':
        return 'default'
      case 'HSE':
        return 'secondary'
      case 'SECURITE':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'default' : 'secondary'
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Matricule</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Dernière connexion</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map(account => (
          <TableRow key={account.id}>
            <TableCell className="font-medium">{account.matricule}</TableCell>
            <TableCell>{account.fullName}</TableCell>
            <TableCell>
              <Badge variant={getRoleBadgeVariant(account.role)}>{account.role}</Badge>
            </TableCell>
            <TableCell>{account.service}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(account.status)}>
                {account.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(account.lastLogin).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onView(account)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(account)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(account)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const CreateAccountModal = ({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}) => {
  const [formData, setFormData] = useState({
    matricule: '',
    fullName: '',
    email: '',
    role: 'HSE',
    service: 'HSSE et Conformité',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      matricule: '',
      fullName: '',
      email: '',
      role: 'HSE',
      service: 'HSSE et Conformité',
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Créer un Nouveau Compte HSSE</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Matricule</label>
              <input
                type="text"
                value={formData.matricule}
                onChange={e => setFormData({ ...formData, matricule: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nom complet</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Rôle</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="HSE">HSE</option>
                <option value="SECURITE">SECURITE</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Créer le Compte
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export const HSSEAccountsPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<HSSEAccount[]>(mockHSSEAccounts)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreateAccount = (data: any) => {
    // Validation : HSSE_CHIEF peut seulement créer HSE et SECURITY
    if (!['HSE', 'SECURITE'].includes(data.role)) {
      toast({
        title: 'Erreur',
        description: 'Vous pouvez seulement créer des comptes HSE ou SECURITE',
        variant: 'destructive',
      })
      return
    }

    const newAccount: HSSEAccount = {
      id: Date.now().toString(),
      matricule: data.matricule,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      service: data.service,
      status: 'active',
      lastLogin: new Date().toISOString(),
      permissions:
        data.role === 'HSE'
          ? ['Gestion incidents', 'Formations HSSE', 'Conformité']
          : ['Contrôle accès', 'Surveillance', 'Incidents sécurité'],
    }

    setAccounts([...accounts, newAccount])
    toast({
      title: 'Succès',
      description: 'Compte créé avec succès',
    })
    setShowCreateModal(false)
  }

  const handleEdit = (account: HSSEAccount) => {
    toast({
      title: 'Modification',
      description: `Modification du compte ${account.matricule}`,
    })
  }

  const handleDelete = (account: HSSEAccount) => {
    if (account.role === 'HSSE_CHIEF') {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le compte Chef de Division',
        variant: 'destructive',
      })
      return
    }

    setAccounts(accounts.filter(a => a.id !== account.id))
    toast({
      title: 'Suppression',
      description: `Compte ${account.matricule} supprimé`,
    })
  }

  const handleView = (account: HSSEAccount) => {
    toast({
      title: 'Consultation',
      description: `Consultation du compte ${account.matricule}`,
    })
  }

  // Filtrer les comptes par rôle
  const hseAccounts = accounts.filter(a => a.role === 'HSE')
  const securityAccounts = accounts.filter(a => a.role === 'SECURITE')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Comptes HSSE</h1>
          <p className="text-muted-foreground">Administration des comptes HSE et Sécurité</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Compte HSE/Sécurité
        </Button>
      </div>

      <Tabs defaultValue="hse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hse">
            <Shield className="mr-2 h-4 w-4" />
            Responsables HSE ({hseAccounts.length})
          </TabsTrigger>
          <TabsTrigger value="security">
            <Users className="mr-2 h-4 w-4" />
            Agents Sécurité ({securityAccounts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Responsables HSE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HSSEAccountsTable
                accounts={hseAccounts}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Agents Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HSSEAccountsTable
                accounts={securityAccounts}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateAccountModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAccount}
      />
    </div>
  )
}
