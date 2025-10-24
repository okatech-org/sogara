import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AppContext'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Users, Plus, Download } from 'lucide-react'
import IncidentList from '@/components/hse/IncidentList'
import IncidentDetailView from '@/components/hse/IncidentDetailView'
import TrainingCoordinator from '@/components/hse/TrainingCoordinator'
import type { HSEIncident, HSETraining } from '@/types'

export function HSEOperationsPage() {
  const { currentUser, hasRole } = useAuth()
  const [activeTab, setActiveTab] = useState('incidents')
  const [incidents, setIncidents] = useState<HSEIncident[]>([])
  const [trainings, setTrainings] = useState<HSETraining[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState<HSEIncident | null>(null)

  useEffect(() => {
    void loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const accessToken = localStorage.getItem('accessToken')

      const [incidentsResponse, trainingsResponse] = await Promise.all([
        fetch('/api/hse/incidents', { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch('/api/hse/trainings', { headers: { Authorization: `Bearer ${accessToken}` } }),
      ])

      if (incidentsResponse.ok) {
        const data = await incidentsResponse.json()
        setIncidents(data.data || [])
      }
      if (trainingsResponse.ok) {
        const data = await trainingsResponse.json()
        setTrainings(data.data || [])
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
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `operations-hse-${new Date().toLocaleDateString('fr-FR')}.pdf`
        a.click()
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  const openIncidents = incidents.filter(i => i.status !== 'closed').length
  const criticalIncidents = incidents.filter(i => i.severity === 'CRITICAL').length
  const activeTrainings = trainings.filter(t => t.status === 'ONGOING').length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <h1 className="text-3xl font-bold">Gestion HSE - Opérations</h1>
            </div>
            <p className="text-gray-600">Incidents et Formations</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewIncident} className="gap-2">
              <Plus className="w-4 h-4" />
              Nouvel Incident
            </Button>
            <Button variant="outline" onClick={handleExportReport} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-l-4 border-l-red-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">Incidents Critiques</p>
                <p className="text-3xl font-bold text-red-600">{criticalIncidents}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-yellow-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">Incidents Ouverts</p>
                <p className="text-3xl font-bold text-yellow-600">{openIncidents}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">Formations Actives</p>
                <p className="text-3xl font-bold text-blue-600">{activeTrainings}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
        </div>

        {/* Critical Alerts */}
        {criticalIncidents > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ {criticalIncidents} incident(s) critique(s) nécessitant une escalade immédiate vers HSE001
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border">
            <TabsTrigger value="incidents" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Incidents
            </TabsTrigger>
            <TabsTrigger value="trainings" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Formations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incidents" className="space-y-4">
            <Card className="p-4">
              <IncidentList incidents={incidents} onSelectIncident={setSelectedIncident} loading={loading} />
            </Card>
          </TabsContent>

          <TabsContent value="trainings" className="space-y-4">
            <Card className="p-4">
              <TrainingCoordinator trainings={trainings} onSelectTraining={() => {}} onCreateNew={() => {}} loading={loading} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
