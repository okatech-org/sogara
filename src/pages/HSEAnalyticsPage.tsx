import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AppContext'
import { Card } from '@/components/ui/card'
import { BarChart3, TrendingUp, PieChart, LineChart } from 'lucide-react'

interface HSEAnalytics {
  incidents: {
    total: number
    bySeverity: Record<string, number>
    byStatus: Record<string, number>
    trend: number[]
  }
  trainings: {
    total: number
    completed: number
    complianceRate: number
    upcoming: number
  }
  audits: {
    total: number
    findings: number
    nonconformities: number
    resolved: number
  }
}

export function HSEAnalyticsPage() {
  const { currentUser } = useAuth()
  const [analytics, setAnalytics] = useState<HSEAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const accessToken = localStorage.getItem('accessToken')
      const response = await fetch('/api/hse/analytics', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !analytics) {
    return <div className="p-6">Chargement des données...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Données HSE</h1>
          </div>
          <p className="text-gray-600">Statistiques et analyses HSE</p>
        </div>

        {/* Incidents Analytics */}
        <div>
          <h2 className="text-xl font-bold mb-4">Incidents</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <p className="text-gray-600 text-sm">Total Incidents</p>
              <p className="text-3xl font-bold">{analytics.incidents.total}</p>
              <p className="text-xs text-gray-500 mt-2">Tous les temps</p>
            </Card>

            {Object.entries(analytics.incidents.bySeverity).map(([severity, count]) => (
              <Card key={severity} className="p-6 border-l-4 border-l-orange-500">
                <p className="text-gray-600 text-sm capitalize">{severity}</p>
                <p className="text-3xl font-bold">{count}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {((count / analytics.incidents.total) * 100).toFixed(1)}%
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Trainings Analytics */}
        <div>
          <h2 className="text-xl font-bold mb-4">Formations</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <p className="text-gray-600 text-sm">Total</p>
              <p className="text-3xl font-bold">{analytics.trainings.total}</p>
            </Card>

            <Card className="p-6 border-l-4 border-l-green-500">
              <p className="text-gray-600 text-sm">Complétées</p>
              <p className="text-3xl font-bold text-green-600">{analytics.trainings.completed}</p>
            </Card>

            <Card className="p-6 border-l-4 border-l-blue-500">
              <p className="text-gray-600 text-sm">Taux Conformité</p>
              <p className="text-3xl font-bold text-blue-600">{analytics.trainings.complianceRate}%</p>
            </Card>

            <Card className="p-6 border-l-4 border-l-yellow-500">
              <p className="text-gray-600 text-sm">À Venir</p>
              <p className="text-3xl font-bold text-yellow-600">{analytics.trainings.upcoming}</p>
            </Card>
          </div>
        </div>

        {/* Audits Analytics */}
        <div>
          <h2 className="text-xl font-bold mb-4">Audits</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <p className="text-gray-600 text-sm">Audits Total</p>
              <p className="text-3xl font-bold">{analytics.audits.total}</p>
            </Card>

            <Card className="p-6 border-l-4 border-l-red-500">
              <p className="text-gray-600 text-sm">Constats</p>
              <p className="text-3xl font-bold text-red-600">{analytics.audits.findings}</p>
            </Card>

            <Card className="p-6 border-l-4 border-l-orange-500">
              <p className="text-gray-600 text-sm">Non-conformités</p>
              <p className="text-3xl font-bold text-orange-600">{analytics.audits.nonconformities}</p>
            </Card>

            <Card className="p-6 border-l-4 border-l-green-500">
              <p className="text-gray-600 text-sm">Résolues</p>
              <p className="text-3xl font-bold text-green-600">{analytics.audits.resolved}</p>
            </Card>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <LineChart className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Tendance Incidents (30 jours)</h3>
            </div>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
              Graphique en ligne - à implémenter
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold">Distribution par Sévérité</h3>
            </div>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
              Graphique circulaire - à implémenter
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Conformité Trainings</h3>
            </div>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
              Graphique barres - à implémenter
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold">Statut Audits</h3>
            </div>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
              Graphique tendance - à implémenter
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
