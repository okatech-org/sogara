import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AppContext'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, AlertCircle, Search, Clock } from 'lucide-react'

interface TrainingValidation {
  id: string
  trainingId: string
  title: string
  coordinator: string
  participants: number
  attended: number
  complianceRate: number
  status: 'VALIDATED' | 'PENDING' | 'REJECTED'
  lastValidated?: Date
  notes?: string
}

export function ComplianceTrainingsPage() {
  const { currentUser, hasRole } = useAuth()
  const [trainings, setTrainings] = useState<TrainingValidation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    void loadTrainings()
  }, [])

  const loadTrainings = async () => {
    try {
      setLoading(true)
      const accessToken = localStorage.getItem('accessToken')
      const response = await fetch('/api/compliance/trainings', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (response.ok) {
        const data = await response.json()
        setTrainings(data.data || [])
      }
    } catch (error) {
      console.error('Error loading trainings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async (trainingId: string, approved: boolean) => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      const response = await fetch(`/api/compliance/trainings/${trainingId}/validate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: approved ? 'VALIDATED' : 'REJECTED',
        }),
      })
      if (response.ok) {
        await loadTrainings()
      }
    } catch (error) {
      console.error('Error validating training:', error)
    }
  }

  const filtered = trainings.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === 'all' || t.status.toLowerCase() === activeTab.toLowerCase()
    return matchesSearch && matchesTab
  })

  const stats = {
    pending: trainings.filter(t => t.status === 'PENDING').length,
    validated: trainings.filter(t => t.status === 'VALIDATED').length,
    rejected: trainings.filter(t => t.status === 'REJECTED').length,
    lowCompliance: trainings.filter(t => t.complianceRate < 80).length,
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Validation Conformité Formations</h1>
          </div>
          <p className="text-gray-600">Vérification de conformité indépendante des formations HSE</p>
          <p className="text-sm text-gray-500 mt-1">Rôle: CONF001 (Chief of Compliance & Audits)</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 border-l-4 border-l-yellow-500">
            <p className="text-gray-600 text-sm">En Attente</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500 mt-2">À valider</p>
          </Card>

          <Card className="p-6 border-l-4 border-l-green-500">
            <p className="text-gray-600 text-sm">Validées</p>
            <p className="text-3xl font-bold text-green-600">{stats.validated}</p>
            <p className="text-xs text-gray-500 mt-2">Approuvées</p>
          </Card>

          <Card className="p-6 border-l-4 border-l-red-500">
            <p className="text-gray-600 text-sm">Rejetées</p>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-xs text-gray-500 mt-2">Non conformes</p>
          </Card>

          <Card className="p-6 border-l-4 border-l-orange-500">
            <p className="text-gray-600 text-sm">Faible Conformité</p>
            <p className="text-3xl font-bold text-orange-600">{stats.lowCompliance}</p>
            <p className="text-xs text-gray-500 mt-2">&lt; 80%</p>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher formation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              En Attente ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="validated" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Validées ({stats.validated})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Rejetées ({stats.rejected})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              Toutes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <div className="space-y-3">
              {filtered.map((training) => (
                <TrainingValidationCard
                  key={training.id}
                  training={training}
                  onValidate={handleValidate}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="validated" className="space-y-4">
            <div className="space-y-3">
              {filtered.map((training) => (
                <TrainingValidationCard
                  key={training.id}
                  training={training}
                  onValidate={handleValidate}
                  readonly={true}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <div className="space-y-3">
              {filtered.map((training) => (
                <TrainingValidationCard
                  key={training.id}
                  training={training}
                  onValidate={handleValidate}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <div className="space-y-3">
              {filtered.map((training) => (
                <TrainingValidationCard
                  key={training.id}
                  training={training}
                  onValidate={handleValidate}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Compliance Guidelines */}
        <Card className="p-6 bg-blue-50 border-l-4 border-l-blue-500">
          <h3 className="font-semibold mb-3">Critères de Conformité</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Taux de participation: ≥ 80%</li>
            <li>✓ Contenu aligné avec ISO 45001</li>
            <li>✓ Documentation complète et traçable</li>
            <li>✓ Certificats émis correctement</li>
            <li>✓ Dates d'expiration respectées</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

interface TrainingValidationCardProps {
  training: TrainingValidation
  onValidate: (id: string, approved: boolean) => Promise<void>
  readonly?: boolean
}

function TrainingValidationCard({ training, onValidate, readonly }: TrainingValidationCardProps) {
  const complianceColor =
    training.complianceRate >= 90
      ? 'text-green-600'
      : training.complianceRate >= 80
        ? 'text-yellow-600'
        : 'text-red-600'

  const statusBg =
    training.status === 'VALIDATED'
      ? 'bg-green-100 text-green-800'
      : training.status === 'REJECTED'
        ? 'bg-red-100 text-red-800'
        : 'bg-yellow-100 text-yellow-800'

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold">{training.title}</h3>
          <p className="text-sm text-gray-600">
            Coordonnée par: {training.coordinator} • {training.participants} participants
          </p>
          <div className="flex gap-4 mt-2">
            <div>
              <p className="text-xs text-gray-500">Attendance</p>
              <p className="text-sm font-semibold">
                {training.attended}/{training.participants}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Taux Conformité</p>
              <p className={`text-sm font-semibold ${complianceColor}`}>{training.complianceRate}%</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBg}`}>
            {training.status}
          </span>
          {!readonly && training.status === 'PENDING' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onValidate(training.id, true)}
              >
                Approuver
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
                onClick={() => onValidate(training.id, false)}
              >
                Rejeter
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
