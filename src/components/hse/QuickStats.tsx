import React from 'react'
import { Card } from '@/components/ui/card'
import { AlertCircle, Clock, Users, BarChart3, TrendingUp, CheckCircle } from 'lucide-react'

interface QuickStatsProps {
  criticalIncidents: number
  pendingApprovals: number
  activeTrainings: number
  pendingAuditFindings: number
  complianceRate?: number
}

export default function QuickStats({
  criticalIncidents,
  pendingApprovals,
  activeTrainings,
  pendingAuditFindings,
  complianceRate = 85,
}: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Critical Incidents */}
      <Card className="p-4 border-l-4 border-l-red-500">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Incidents Critiques</p>
            <p className="text-3xl font-bold text-red-600">{criticalIncidents}</p>
          </div>
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-xs text-gray-500 mt-2">À traiter immédiatement</p>
      </Card>

      {/* Pending Approvals */}
      <Card className="p-4 border-l-4 border-l-yellow-500">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">En Attente d'Approbation</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingApprovals}</p>
          </div>
          <Clock className="w-8 h-8 text-yellow-500" />
        </div>
        <p className="text-xs text-gray-500 mt-2">Incidents non approuvés</p>
      </Card>

      {/* Active Trainings */}
      <Card className="p-4 border-l-4 border-l-blue-500">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Formations Actives</p>
            <p className="text-3xl font-bold text-blue-600">{activeTrainings}</p>
          </div>
          <Users className="w-8 h-8 text-blue-500" />
        </div>
        <p className="text-xs text-gray-500 mt-2">En cours cette semaine</p>
      </Card>

      {/* Audit Findings */}
      <Card className="p-4 border-l-4 border-l-orange-500">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Constats Audit</p>
            <p className="text-3xl font-bold text-orange-600">{pendingAuditFindings}</p>
          </div>
          <BarChart3 className="w-8 h-8 text-orange-500" />
        </div>
        <p className="text-xs text-gray-500 mt-2">Non conformités en attente</p>
      </Card>

      {/* Compliance Rate */}
      <Card className="p-4 border-l-4 border-l-green-500">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Taux de Conformité</p>
            <p className="text-3xl font-bold text-green-600">{complianceRate}%</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-500" />
        </div>
        <p className="text-xs text-gray-500 mt-2">Formation à jour</p>
      </Card>
    </div>
  )
}
