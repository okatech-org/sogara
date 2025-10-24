import React, { useState } from 'react'
import { HSEAudit } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertCircle,
  CheckCircle,
  Calendar,
  Target,
  AlertTriangle,
  Plus,
  Eye,
  FileText,
  Zap,
} from 'lucide-react'

interface AuditManagerProps {
  audits: HSEAudit[]
  onSelectAudit: (audit: HSEAudit) => void
  onCreateNew?: () => void
  loading?: boolean
}

export default function AuditManager({
  audits,
  onSelectAudit,
  onCreateNew,
  loading = false,
}: AuditManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filtered = audits.filter(a => {
    const typeMatch = filterType === 'all' || a.type === filterType
    const statusMatch = filterStatus === 'all' || a.status === filterStatus
    const searchMatch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase())
    return typeMatch && statusMatch && searchMatch
  })

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      internal: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-purple-100 text-purple-800',
      emergency: 'bg-red-100 text-red-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      internal: '📋 Interne',
      scheduled: '📅 Programmée',
      emergency: '🚨 Urgence',
    }
    return labels[type] || type
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      reported: 'bg-purple-100 text-purple-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      planned: '📅 Planifiée',
      in_progress: '▶️ En cours',
      completed: '✅ Complétée',
      reported: '📄 Rapportée',
    }
    return labels[status] || status
  }

  const getNonconformityCount = (audit: HSEAudit) => {
    return audit.findings?.filter(f => f.nonconformity).length || 0
  }

  const getOpenNonconformities = (audit: HSEAudit) => {
    return audit.nonconformities?.filter(nc => nc.status === 'open').length || 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin text-primary mb-2">
            <Target className="w-8 h-8" />
          </div>
          <p className="text-gray-600">Chargement des audits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Gestion des Audits HSE</h2>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvel Audit
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          placeholder="Rechercher audits..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="internal">Interne</SelectItem>
            <SelectItem value="scheduled">Programmée</SelectItem>
            <SelectItem value="emergency">Urgence</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="planned">Planifiée</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="completed">Complétée</SelectItem>
            <SelectItem value="reported">Rapportée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      <div className="text-sm text-gray-600">
        {filtered.length} audit{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Audits List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <Target className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">Aucun audit trouvé</p>
          </Card>
        ) : (
          filtered.map(audit => (
            <Card
              key={audit.id}
              className="p-4 cursor-pointer hover:shadow-md transition border-l-4 border-l-yellow-400"
              onClick={() => onSelectAudit(audit)}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="text-2xl">📋</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{audit.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {audit.code}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Scope: {audit.scope}</p>
                    </div>
                  </div>

                  {audit.description && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{audit.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    {audit.schedule?.plannedDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(audit.schedule.plannedDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {audit.standards && audit.standards.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{audit.standards.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={getTypeColor(audit.type)}>
                      {getTypeLabel(audit.type)}
                    </Badge>
                    <Badge className={getStatusColor(audit.status)}>
                      {getStatusLabel(audit.status)}
                    </Badge>
                  </div>

                  {/* Findings Summary */}
                  <div className="flex gap-4 text-sm">
                    {audit.findings && audit.findings.length > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">{audit.findings.length} Findings</span>
                      </div>
                    )}
                    {getNonconformityCount(audit) > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="font-medium text-red-600">{getNonconformityCount(audit)} NC</span>
                      </div>
                    )}
                    {getOpenNonconformities(audit) > 0 && (
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-yellow-600">{getOpenNonconformities(audit)} Open</span>
                      </div>
                    )}
                    {audit.reportGenerated && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-600">Report</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation()
                    onSelectAudit(audit)
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}