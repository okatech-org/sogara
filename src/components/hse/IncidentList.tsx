import React, { useState } from 'react'
import { HSEIncident } from '@/types'
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
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  Eye,
} from 'lucide-react'

interface IncidentListProps {
  incidents: HSEIncident[]
  onSelectIncident: (incident: HSEIncident) => void
  loading?: boolean
}

export default function IncidentList({
  incidents,
  onSelectIncident,
  loading = false,
}: IncidentListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')

  const filtered = incidents.filter(i => {
    const statusMatch = filterStatus === 'all' || i.status === filterStatus
    const severityMatch = filterSeverity === 'all' || i.severity === filterSeverity
    const searchMatch =
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.location.toLowerCase().includes(searchTerm.toLowerCase())
    return statusMatch && severityMatch && searchMatch
  })

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'destructive',
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    }
    return colors[severity] || 'default'
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-4 h-4" />
      case 'high':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      reported: { label: '📢 Signalé', color: 'bg-blue-100 text-blue-800' },
      investigating: { label: '🔍 Investigation', color: 'bg-purple-100 text-purple-800' },
      action_required: { label: '⚠️ Action requise', color: 'bg-orange-100 text-orange-800' },
      monitoring: { label: '📊 Suivi', color: 'bg-green-100 text-green-800' },
      resolved: { label: '✅ Résolu', color: 'bg-teal-100 text-teal-800' },
      closed: { label: '🔒 Fermé', color: 'bg-gray-100 text-gray-800' },
    }
    const badge = badges[status] || { label: status, color: 'default' }
    return <Badge className={badge.color}>{badge.label}</Badge>
  }

  const getApprovalBadge = (approval: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      pending: { label: '⏳ En attente', color: 'bg-yellow-100 text-yellow-800' },
      approved_hse002: { label: '✅ Approuvé HSE002', color: 'bg-green-100 text-green-800' },
      requires_hse001: { label: '📤 Escaladé HSE001', color: 'bg-orange-100 text-orange-800' },
      approved_hse001: { label: '✅ Approuvé HSE001', color: 'bg-green-100 text-green-800' },
    }
    const badge = badges[approval] || { label: approval, color: 'default' }
    return <Badge className={badge.color}>{badge.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin text-primary mb-2">
            <AlertCircle className="w-8 h-8" />
          </div>
          <p className="text-gray-600">Chargement des incidents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          placeholder="Rechercher incidents..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="md:col-span-1"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="reported">Signalé</SelectItem>
            <SelectItem value="investigating">Investigation</SelectItem>
            <SelectItem value="action_required">Action requise</SelectItem>
            <SelectItem value="monitoring">Suivi</SelectItem>
            <SelectItem value="resolved">Résolu</SelectItem>
            <SelectItem value="closed">Fermé</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les sévérités</SelectItem>
            <SelectItem value="critical">Critique</SelectItem>
            <SelectItem value="high">Élevée</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="low">Basse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      <div className="text-sm text-gray-600">
        {filtered.length} incident{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Incidents List */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">Aucun incident trouvé</p>
          </Card>
        ) : (
          filtered.map(incident => (
            <Card
              key={incident.id}
              className="p-4 cursor-pointer hover:shadow-md transition border-l-4 border-l-gray-200"
              onClick={() => onSelectIncident(incident)}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getSeverityIcon(incident.severity)}
                    <h3 className="font-semibold text-lg">{incident.title}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{incident.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(incident.occurredAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{incident.description}</p>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={getSeverityColor(incident.severity)}>
                      {incident.severity.toUpperCase()}
                    </Badge>
                    {getStatusBadge(incident.status)}
                    {getApprovalBadge(incident.approvalStatus)}
                  </div>
                </div>

                <Button variant="ghost" size="sm" onClick={e => {
                  e.stopPropagation()
                  onSelectIncident(incident)
                }}>
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