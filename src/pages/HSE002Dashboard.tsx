import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AppContext'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Shield, AlertTriangle, Users, FileCheck, Plus, Download, TrendingUp } from 'lucide-react'
import QuickStats from '@/components/hse/QuickStats'
import IncidentList from '@/components/hse/IncidentList'
import IncidentDetailView from '@/components/hse/IncidentDetailView'
import TrainingCoordinator from '@/components/hse/TrainingCoordinator'
import AuditManager from '@/components/hse/AuditManager'
import type { HSEIncident, HSETraining, HSEAudit } from '@/types'

export default function HSE002Dashboard() {
  const { currentUser, hasRole } = useAuth()
  const [activeTab, setActiveTab] = useState('incidents')
  const [incidents, setIncidents] = useState<HSEIncident[]>([])
  const [trainings, setTrainings] = useState<HSETraining[]>([])
  const [audits, setAudits] = useState<HSEAudit[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState<HSEIncident | null>(null)

  // Check if user has HSE_MANAGER role
  if (!hasRole('HSE_MANAGER')) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Accès refusé. Vous n'avez pas les permissions nécessaires pour accéder à ce tableau de
            bord.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Load data on component mount
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

      // Load trainings - filter only HSE trainings
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
  const criticalIncidents = incidents.filter(i => i.severity === 'critical').length
  const pendingApprovals = incidents.filter(i => i.approvalStatus === 'pending').length
  const activeTrainings = trainings.filter(t => t.status === 'ongoing').length
  const pendingAuditFindings = audits
    .flatMap(a => a.findings || [])
    .filter(f => f.nonconformity).length

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold">Tableau de Bord HSE Opérationnel</h1>
          </div>
          <p className="text-gray-600">Bienvenue, {currentUser?.firstName} {currentUser?.lastName}</p>
          <p className="text-sm text-gray-500">
            Chef HSSE Opérationnel - Gestion des incidents, formations et audits HSE
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewIncident} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvel Incident
          </Button>
          <Button variant="outline" onClick={handleExportReport} className="gap-2">
            <Download className="w-4 h-4" />
            Export Rapport
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats
        criticalIncidents={criticalIncidents}
        pendingApprovals={pendingApprovals}
        activeTrainings={activeTrainings}
        pendingAuditFindings={pendingAuditFindings}
        complianceRate={85}
      />

      {/* Main Content */}
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border-b">
            <TabsTrigger value="incidents" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Incidents</span>
              {incidents.length > 0 && (
                <span className="ml-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                  {incidents.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="trainings" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Formations</span>
              {trainings.length > 0 && (
                <span className="ml-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {trainings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="audits" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Audits</span>
              {audits.length > 0 && (
                <span className="ml-1 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                  {audits.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Rapports</span>
            </TabsTrigger>
          </TabsList>

          {/* Incidents Tab */}
          <TabsContent value="incidents" className="space-y-4">
            <Card className="p-4 bg-white">
              <IncidentList
                incidents={incidents}
                onSelectIncident={setSelectedIncident}
                loading={loading}
              />
            </Card>
          </TabsContent>

          {/* Trainings Tab */}
          <TabsContent value="trainings" className="space-y-4">
            <Card className="p-4 bg-white">
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
            <Card className="p-4 bg-white">
              <AuditManager
                audits={audits}
                onSelectAudit={() => {}}
                onCreateNew={() => {}}
                loading={loading}
              />
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card className="p-6 bg-white">
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
              isHSE02={true}
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