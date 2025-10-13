import { useState } from 'react'
import { Plus, AlertTriangle, Calendar, FileText, Download, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AppContext'
import { useHSEIncidents } from '@/hooks/useHSEIncidents'
import { useHSETrainings } from '@/hooks/useHSETrainings'
import { useHSECompliance } from '@/hooks/useHSECompliance'

interface HSEQuickActionsProps {
  onCreateIncident?: () => void
  onScheduleTraining?: () => void
  onViewCompliance?: () => void
  onExportReport?: () => void
}

export function HSEQuickActions({
  onCreateIncident,
  onScheduleTraining,
  onViewCompliance,
  onExportReport,
}: HSEQuickActionsProps) {
  const { hasAnyRole } = useAuth()
  const { getStats: getIncidentStats } = useHSEIncidents()
  const { getStats: getTrainingStats } = useHSETrainings()
  const { getEmployeesRequiringAction } = useHSECompliance()

  const [isExporting, setIsExporting] = useState(false)

  const canManageHSE = hasAnyRole(['ADMIN', 'HSE', 'SUPERVISEUR'])
  const canViewReports = hasAnyRole(['ADMIN', 'HSE', 'SUPERVISEUR'])

  const incidentStats = getIncidentStats()
  const trainingStats = getTrainingStats()
  const employeesNeedingAction = getEmployeesRequiringAction()

  const handleExportReport = async () => {
    if (!canViewReports) return

    try {
      setIsExporting(true)

      // Simuler la génération d'un rapport (en réalité, on utiliserait une API)
      const reportData = {
        date: new Date().toISOString(),
        incidents: incidentStats,
        trainings: trainingStats,
        employeesNeedingAction: employeesNeedingAction.length,
        timestamp: new Date().toLocaleString('fr-FR'),
      }

      // Créer et télécharger un fichier JSON pour la démo
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-hse-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      onExportReport?.()
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const quickActions = [
    {
      id: 'create-incident',
      icon: AlertTriangle,
      label: 'Déclarer un incident',
      description: 'Signaler un nouvel incident de sécurité',
      color: 'text-red-500',
      bgColor: 'bg-red-50 hover:bg-red-100',
      borderColor: 'border-red-200',
      action: onCreateIncident,
      visible: canManageHSE,
      urgent: incidentStats.highSeverity > 0,
    },
    {
      id: 'schedule-training',
      icon: Calendar,
      label: 'Programmer une formation',
      description: 'Planifier une nouvelle session de formation',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      borderColor: 'border-blue-200',
      action: onScheduleTraining,
      visible: canManageHSE,
    },
    {
      id: 'view-compliance',
      icon: Users,
      label: 'Vérifier la conformité',
      description: 'Consulter le tableau de conformité détaillé',
      color: 'text-green-500',
      bgColor: 'bg-green-50 hover:bg-green-100',
      borderColor: 'border-green-200',
      action: onViewCompliance,
      visible: true,
      badge: employeesNeedingAction.length > 0 ? employeesNeedingAction.length : undefined,
    },
    {
      id: 'export-report',
      icon: Download,
      label: 'Exporter rapport',
      description: 'Télécharger un rapport HSE complet',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      borderColor: 'border-purple-200',
      action: handleExportReport,
      visible: canViewReports,
      loading: isExporting,
    },
  ]

  const visibleActions = quickActions.filter(action => action.visible)

  if (visibleActions.length === 0) {
    return null
  }

  return (
    <Card className="industrial-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Actions rapides HSE
        </CardTitle>
        <p className="text-muted-foreground">Accès direct aux fonctionnalités principales</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleActions.map(action => {
            const Icon = action.icon

            return (
              <div
                key={action.id}
                className={`
                  relative p-4 rounded-lg border cursor-pointer transition-all
                  ${action.bgColor} ${action.borderColor}
                  ${action.urgent ? 'ring-2 ring-red-300 animate-pulse' : ''}
                `}
                onClick={action.action}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-white border ${action.borderColor}`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{action.label}</h3>

                      {action.badge && (
                        <Badge variant="destructive" className="text-xs">
                          {action.badge}
                        </Badge>
                      )}

                      {action.urgent && (
                        <Badge variant="destructive" className="text-xs animate-pulse">
                          URGENT
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600">{action.description}</p>

                    {action.loading && (
                      <div className="mt-2 text-xs text-gray-500">En cours...</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Résumé des alertes */}
        {(incidentStats.open > 0 || employeesNeedingAction.length > 0) && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <h4 className="font-medium text-yellow-800">Attention requise</h4>
            </div>
            <div className="text-sm text-yellow-700 space-y-1">
              {incidentStats.open > 0 && (
                <p>• {incidentStats.open} incident(s) ouvert(s) nécessitent un suivi</p>
              )}
              {employeesNeedingAction.length > 0 && (
                <p>• {employeesNeedingAction.length} employé(s) ont des problèmes de conformité</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
