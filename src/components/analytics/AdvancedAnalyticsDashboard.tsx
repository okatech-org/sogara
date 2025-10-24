import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Users,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface AnalyticsData {
  metrics: {
    [key: string]: {
      [metric: string]: Array<{
        value: number
        date: string
        metadata?: any
      }>
    }
  }
  kpis: {
    hse?: {
      incidentsTotal: number
      incidentsResolved: number
      complianceRate: number
      trainingCompletion: number
    }
    visits?: {
      totalToday: number
      averageDuration: number
      completionRate: number
    }
    packages?: {
      totalReceived: number
      deliveredOnTime: number
      deliveryRate: number
    }
  }
  trends: {
    [metric: string]: {
      current: number
      previous: number
      change: number
      changePercent: number
    }
  }
  complianceRatios: {
    total: number
    compliant: number
    ratio: number
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function AdvancedAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedPeriod, selectedDepartment])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/analytics/dashboard?period=${selectedPeriod}&department=${selectedDepartment}`,
      )

      // Check if response is HTML (404 page) instead of JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API non disponible, utilisation de données de démonstration')
        // Use mock data when API is not available
        setAnalyticsData({
          kpis: [
            { label: "Visiteurs aujourd'hui", value: 12, trend: { changePercent: 8.5 } },
            { label: 'Colis en attente', value: 5, trend: { changePercent: -12.3 } },
            { label: 'Incidents HSE', value: 2, trend: { changePercent: -25.0 } },
            { label: 'Formations complétées', value: 18, trend: { changePercent: 15.2 } },
          ],
          charts: {
            visitors: { labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'], data: [8, 12, 15, 10, 14] },
            incidents: { labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai'], data: [3, 2, 4, 1, 2] },
          },
        })
        return
      }

      const data = await response.json()

      if (data.success) {
        setAnalyticsData(data.data)
      }
    } catch (error) {
      console.error('Erreur récupération analytics:', error)
      // Set mock data on error
      setAnalyticsData({
        kpis: [
          { label: "Visiteurs aujourd'hui", value: 12, trend: { changePercent: 8.5 } },
          { label: 'Colis en attente', value: 5, trend: { changePercent: -12.3 } },
          { label: 'Incidents HSE', value: 2, trend: { changePercent: -25.0 } },
          { label: 'Formations complétées', value: 18, trend: { changePercent: 15.2 } },
        ],
        charts: {
          visitors: { labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'], data: [8, 12, 15, 10, 14] },
          incidents: { labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai'], data: [3, 2, 4, 1, 2] },
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTrend = (trend: any) => {
    if (!trend) return null
    const isPositive = trend.changePercent > 0
    return (
      <div className="flex items-center gap-1">
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {Math.abs(trend.changePercent).toFixed(1)}%
        </span>
      </div>
    )
  }

  const getKPICard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    trend?: any,
    subtitle?: string,
  ) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            {icon}
            {trend && formatTrend(trend)}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Avancés</h2>
          <p className="text-muted-foreground">Tableaux de bord directionnels et métriques HSE</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Quotidien</SelectItem>
              <SelectItem value="weekly">Hebdomadaire</SelectItem>
              <SelectItem value="monthly">Mensuel</SelectItem>
              <SelectItem value="yearly">Annuel</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous départements</SelectItem>
              <SelectItem value="hse">HSE</SelectItem>
              <SelectItem value="reception">Réception</SelectItem>
              <SelectItem value="security">Sécurité</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalyticsData} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsData?.kpis?.hse && (
          <>
            {getKPICard(
              'Incidents Totaux',
              analyticsData.kpis.hse.incidentsTotal,
              <AlertTriangle className="h-8 w-8 text-orange-500" />,
              analyticsData.trends?.incidents_total,
            )}
            {getKPICard(
              'Taux de Conformité',
              `${analyticsData.kpis.hse.complianceRate.toFixed(1)}%`,
              <Shield className="h-8 w-8 text-green-500" />,
              analyticsData.trends?.compliance_rate,
            )}
            {getKPICard(
              'Formations Complétées',
              `${analyticsData.kpis.hse.trainingCompletion.toFixed(1)}%`,
              <CheckCircle className="h-8 w-8 text-blue-500" />,
              analyticsData.trends?.training_completion,
            )}
            {getKPICard(
              'Incidents Résolus',
              analyticsData.kpis.hse.incidentsResolved,
              <Target className="h-8 w-8 text-purple-500" />,
              analyticsData.trends?.incidents_resolved,
            )}
          </>
        )}
      </div>

      {/* Onglets de contenu */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="hse">Analytics HSE</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="compliance">Conformité</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique des incidents */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.metrics?.hse?.incidents_total || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Graphique de conformité */}
            <Card>
              <CardHeader>
                <CardTitle>Taux de Conformité par Département</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: 'Conforme',
                          value: analyticsData?.complianceRatios?.compliant || 0,
                        },
                        {
                          name: 'Non conforme',
                          value:
                            (analyticsData?.complianceRatios?.total || 0) -
                            (analyticsData?.complianceRatios?.compliant || 0),
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics HSE */}
        <TabsContent value="hse" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Formations HSE</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Formations complétées</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={analyticsData?.kpis?.hse?.trainingCompletion || 0}
                        className="w-24"
                      />
                      <span className="text-sm font-medium">
                        {analyticsData?.kpis?.hse?.trainingCompletion?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Conformité HSE</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={analyticsData?.kpis?.hse?.complianceRate || 0}
                        className="w-24"
                      />
                      <span className="text-sm font-medium">
                        {analyticsData?.kpis?.hse?.complianceRate?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Résolution d'Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      {
                        name: 'Ouverts',
                        value:
                          (analyticsData?.kpis?.hse?.incidentsTotal || 0) -
                          (analyticsData?.kpis?.hse?.incidentsResolved || 0),
                      },
                      { name: 'Résolus', value: analyticsData?.kpis?.hse?.incidentsResolved || 0 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tendances */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analyticsData?.trends || {}).map(([metric, trend]) => (
              <Card key={metric}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium capitalize">{metric.replace(/_/g, ' ')}</p>
                      <p className="text-2xl font-bold">{trend.current}</p>
                    </div>
                    {formatTrend(trend)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Conformité */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>État de la Conformité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total des vérifications</span>
                  <Badge variant="outline">{analyticsData?.complianceRatios?.total || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Conformes</span>
                  <Badge variant="default" className="bg-green-500">
                    {analyticsData?.complianceRatios?.compliant || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Taux de conformité</span>
                  <Badge variant="secondary">
                    {analyticsData?.complianceRatios?.ratio?.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
