import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AppContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Calendar, Filter } from 'lucide-react'

interface Report {
  id: string
  title: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  generatedAt: Date
  format: 'pdf' | 'xlsx' | 'csv'
  size: string
  status: 'ready' | 'generating' | 'failed'
}

export function HSEReportsPage() {
  const { currentUser } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    void loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const accessToken = localStorage.getItem('accessToken')
      const response = await fetch('/api/hse/reports', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (response.ok) {
        const data = await response.json()
        setReports(data.data || [])
      }
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async (type: 'daily' | 'weekly' | 'monthly' | 'custom') => {
    try {
      setGenerating(true)
      const accessToken = localStorage.getItem('accessToken')
      const response = await fetch(`/api/hse/reports/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          dateFrom: type === 'custom' ? dateFrom : undefined,
          dateTo: type === 'custom' ? dateTo : undefined,
        }),
      })
      if (response.ok) {
        await loadReports()
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadReport = async (reportId: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      const response = await fetch(`/api/hse/reports/${reportId}/download`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rapport-hse-${reportId}.pdf`
        a.click()
      }
    } catch (error) {
      console.error('Error downloading report:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold">Rapports HSE</h1>
          </div>
          <p className="text-gray-600">Générer et gérer les rapports HSE</p>
        </div>

        {/* Generate Reports Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Générer un Rapport</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              onClick={() => handleGenerateReport('daily')}
              disabled={generating}
              variant="outline"
              className="h-32 flex-col justify-center"
            >
              <Calendar className="w-6 h-6 mb-2" />
              <span>Rapport Quotidien</span>
            </Button>

            <Button
              onClick={() => handleGenerateReport('weekly')}
              disabled={generating}
              variant="outline"
              className="h-32 flex-col justify-center"
            >
              <Calendar className="w-6 h-6 mb-2" />
              <span>Rapport Hebdo</span>
            </Button>

            <Button
              onClick={() => handleGenerateReport('monthly')}
              disabled={generating}
              variant="outline"
              className="h-32 flex-col justify-center"
            >
              <Calendar className="w-6 h-6 mb-2" />
              <span>Rapport Mensuel</span>
            </Button>

            <Button
              disabled={generating}
              variant="outline"
              className="h-32 flex-col justify-center"
              onClick={() => {
                const elem = document.getElementById('custom-dates')
                if (elem) elem.classList.toggle('hidden')
              }}
            >
              <Filter className="w-6 h-6 mb-2" />
              <span>Personnalisé</span>
            </Button>
          </div>

          {/* Custom Date Range */}
          <div id="custom-dates" className="hidden mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date Début</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date Fin</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => handleGenerateReport('custom')}
                  disabled={generating || !dateFrom || !dateTo}
                  className="w-full"
                >
                  Générer
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Reports List */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Rapports Récents</h2>
            {loading ? (
              <p className="text-gray-500">Chargement des rapports...</p>
            ) : reports.length === 0 ? (
              <p className="text-gray-500">Aucun rapport disponible</p>
            ) : (
              <div className="space-y-2">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">{report.title}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(report.generatedAt).toLocaleDateString('fr-FR')} • {report.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          report.status === 'ready'
                            ? 'bg-green-100 text-green-800'
                            : report.status === 'generating'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {report.status === 'ready' ? '✓ Prêt' : report.status === 'generating' ? 'Génération...' : 'Erreur'}
                      </span>
                      {report.status === 'ready' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReport(report.id)}
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Télécharger
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Report Templates */}
        <div>
          <h2 className="text-xl font-bold mb-4">Modèles de Rapport</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Résumé Incidents</h3>
              <p className="text-sm text-gray-600 mb-4">Incidents déclarés, approbations, escalades</p>
              <Button variant="outline" className="w-full">
                Aperçu
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Conformité Trainings</h3>
              <p className="text-sm text-gray-600 mb-4">Taux de formation, complétions, validations</p>
              <Button variant="outline" className="w-full">
                Aperçu
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Audits & Conformité</h3>
              <p className="text-sm text-gray-600 mb-4">Constats, non-conformités, actions correctives</p>
              <Button variant="outline" className="w-full">
                Aperçu
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
