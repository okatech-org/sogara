import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AppContext'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Shield,
  AlertTriangle,
  Users,
  FileCheck,
  Plus,
  Download,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import QuickStats from '@/components/hse/QuickStats'
import IncidentList from '@/components/hse/IncidentList'
import IncidentDetailView from '@/components/hse/IncidentDetailView'
import TrainingCoordinator from '@/components/hse/TrainingCoordinator'
import AuditManager from '@/components/hse/AuditManager'
import type { HSEIncident, HSETraining, HSEAudit } from '@/types'

export function HSEPage() {
  const { currentUser, hasRole } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [incidents, setIncidents] = useState<HSEIncident[]>([])
  const [trainings, setTrainings] = useState<HSETraining[]>([])
  const [audits, setAudits] = useState<HSEAudit[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState<HSEIncident | null>(null)

  // Déterminer si HSE002 (HSE_MANAGER)
  const isHSE002 = hasRole('HSE_MANAGER')
  const isHSE001 = hasRole('HSSE_CHIEF')
  const isDG = hasRole('DG')

  useEffect(() => {
    void loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load incidents
      const incidentsResponse = await fetch('/api/hse/incidents', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      if (incidentsResponse.ok) {
        const incidentsData = await incidentsResponse.json()
        setIncidents(incidentsData.data || [])
      }

      // Load trainings
      const trainingsResponse = await fetch('/api/hse/trainings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      if (trainingsResponse.ok) {
        const trainingsData = await trainingsResponse.json()
        setTrainings(trainingsData.data || [])
      }

      // Load audits
      const auditsResponse = await fetch('/api/hse/audits', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      if (auditsResponse.ok) {
        const auditsData = await auditsResponse.json()
        setAudits(auditsData.data || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewIncident = () => {
    console.log('Créer un nouvel incident')
  }

  const handleExportReport = async () => {
    try {
      const response = await fetch('/api/hse/reports/daily-summary', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rapport-hse-${new Date().toLocaleDateString('fr-FR')}.pdf`
        a.click()
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  // Calculate stats
  const openIncidents = incidents.filter(i => i.status !== 'closed').length
  const criticalIncidents = incidents.filter(i => i.severity === 'critical').length
  const pendingApprovals = incidents.filter(i => i.approvalStatus === 'pending').length
  const activeTrainings = trainings.filter(t => t.status === 'ongoing').length
  const pendingAuditFindings = audits
    .flatMap(a => a.findings || [])
    .filter(f => f.nonconformity).length

  const complianceRate = trainings.length > 0 ? Math.round((activeTrainings / trainings.length) * 100) : 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">HSE - Hygiène, Sécurité et Environnement</h1>
                <p className="text-gray-600 text-sm mt-1">
                  {isHSE002
                    ? 'Gestion HSE - Incidents et Formations (HSE002 - Opérationnel)'
                    : 'Gestion des incidents, formations et conformité réglementaire'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {isHSE002 && (
                <Button onClick={handleNewIncident} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <AlertTriangle className="w-4 h-4" />
                  Déclarer un incident
                </Button>
              )}
              <Button variant="outline" onClick={handleExportReport} className="gap-2">
                <Download className="w-4 h-4" />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <QuickStats
            criticalIncidents={criticalIncidents}
            pendingApprovals={pendingApprovals}
            activeTrainings={activeTrainings}
            pendingAuditFindings={pendingAuditFindings}
            complianceRate={complianceRate}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9 bg-white border">
            <TabsTrigger value="overview" className="text-xs md:text-sm">
              Vue d'ensemble
            </TabsTrigger>
            {isHSE002 && (
              <TabsTrigger value="quick-actions" className="text-xs md:text-sm">
                📤 Actions rapides
              </TabsTrigger>
            )}
            <TabsTrigger value="incidents" className="text-xs md:text-sm">
              Incidents
            </TabsTrigger>
            <TabsTrigger value="trainings" className="text-xs md:text-sm">
              Formations
            </TabsTrigger>
            <TabsTrigger value="audits" className="text-xs md:text-sm">
              Audits
            </TabsTrigger>
            {!isHSE002 && (
              <>
                <TabsTrigger value="collaborators" className="text-xs md:text-sm">
                  Collaborateurs
                </TabsTrigger>
                <TabsTrigger value="notifications" className="text-xs md:text-sm">
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="attribution" className="text-xs md:text-sm">
                  Attribution
                </TabsTrigger>
                <TabsTrigger value="compliance" className="text-xs md:text-sm">
                  Conformité
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="reports" className="text-xs md:text-sm">
              Rapports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Informations Générales</h3>
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Utilisateur actuel:</span>
                    <p className="font-semibold">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Rôle:</span>
                    <p className="font-semibold">
                      {isHSE002 ? 'Chef HSSE Opérationnel (HSE002)' : isHSE001 ? 'Chef de Division HSSE (HSE001)' : 'Directeur Général'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Service:</span>
                    <p className="font-semibold">{currentUser?.service || 'N/A'}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Actions Rapides HSE</h3>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={handleNewIncident}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Déclarer un incident
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Programmer une formation
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={handleExportReport}
                  >
                    <Download className="w-4 h-4" />
                    Exporter rapport
                  </Button>
                </div>
              </Card>
            </div>

            {criticalIncidents > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  ⚠️ Attention requise: {criticalIncidents} incident(s) critique(s) nécessitant un suivi
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Quick Actions Tab (HSE002 only) */}
          {isHSE002 && (
            <TabsContent value="quick-actions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 border-l-4 border-l-red-500 cursor-pointer hover:shadow-md transition">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-500 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Déclarer un incident</h3>
                      <p className="text-sm text-gray-600">Signaler un nouvel incident de sécurité</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        URGENT
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md transition">
                  <div className="flex items-start gap-3">
                    <Users className="w-6 h-6 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Programmer une formation</h3>
                      <p className="text-sm text-gray-600">Planifier une nouvelle session de formation</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-green-500 cursor-pointer hover:shadow-md transition">
                  <div className="flex items-start gap-3">
                    <FileCheck className="w-6 h-6 text-green-500 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Vérifier la conformité</h3>
                      <p className="text-sm text-gray-600">Consulter le tableau de conformité détaillé</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-purple-500 cursor-pointer hover:shadow-md transition">
                  <div className="flex items-start gap-3">
                    <Download className="w-6 h-6 text-purple-500 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Exporter rapport</h3>
                      <p className="text-sm text-gray-600">Télécharger un rapport HSE complet</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Incidents Tab */}
          <TabsContent value="incidents" className="space-y-4">
            <Card className="p-4">
              <IncidentList incidents={incidents} onSelectIncident={setSelectedIncident} loading={loading} />
            </Card>
          </TabsContent>

          {/* Trainings Tab */}
          <TabsContent value="trainings" className="space-y-4">
            <Card className="p-4">
              <TrainingCoordinator
                trainings={trainings}
                onSelectTraining={() => {}}
                onCreateNew={() => {}}
                loading={loading}
              />
            </Card>
          </TabsContent>

          {/* Audits Tab */}
          <TabsContent value="audits" className="space-y-4">
            <Card className="p-4">
              <AuditManager audits={audits} onSelectAudit={() => {}} onCreateNew={() => {}} loading={loading} />
            </Card>
          </TabsContent>

          {/* Collaborators Tab (non-HSE002) */}
          {!isHSE002 && (
            <TabsContent value="collaborators" className="space-y-4">
              <Card className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Gestion des collaborateurs - Module à configurer</p>
              </Card>
            </TabsContent>
          )}

          {/* Notifications Tab (non-HSE002) */}
          {!isHSE002 && (
            <TabsContent value="notifications" className="space-y-4">
              <Card className="p-6 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Notifications - Module à configurer</p>
              </Card>
            </TabsContent>
          )}

          {/* Attribution Tab (non-HSE002) */}
          {!isHSE002 && (
            <TabsContent value="attribution" className="space-y-4">
              <Card className="p-6 text-center">
                <FileCheck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Attribution - Module à configurer</p>
              </Card>
            </TabsContent>
          )}

          {/* Compliance Tab (non-HSE002) */}
          {!isHSE002 && (
            <TabsContent value="compliance" className="space-y-4">
              <Card className="p-6 text-center">
                <Shield className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Conformité - Module à configurer</p>
              </Card>
            </TabsContent>
          )}

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card className="p-6">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Rapports HSE</h3>
                <p className="text-gray-600 mb-4">
                  Générez des rapports détaillés sur les incidents, formations et audits
                </p>
                <Button onClick={handleExportReport} className="gap-2">
                  <Download className="w-4 h-4" />
                  Générer Rapport Quotidien
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Incident Detail Dialog */}
      {selectedIncident && (
        <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de l'Incident</DialogTitle>
            </DialogHeader>
            <IncidentDetailView
              incident={selectedIncident}
              onClose={() => setSelectedIncident(null)}
              isHSE02={isHSE002}
              onUpdate={incident => {
                setIncidents(incidents.map(i => (i.id === incident.id ? incident : i)))
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
