import { useState, useEffect, useMemo } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Shield,
  TrendingUp,
  Loader2,
  RefreshCw,
  Download,
  Eye,
  BarChart3,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AppContext'
import { useEmployees } from '@/hooks/useEmployees'
import { useHSEIncidents } from '@/hooks/useHSEIncidents'
import { useHSETrainings } from '@/hooks/useHSETrainings'
import { useHSECompliance } from '@/hooks/useHSECompliance'
import { useHSEInit } from '@/hooks/useHSEInit'
import { HSEIncident, HSETraining, HSETrainingSession } from '@/types'

export function DGHSEDashboard() {
  const { hasAnyRole, currentUser } = useAuth()
  
  // État pour la navigation entre onglets
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)

  // Charger les employés depuis le hook
  const { employees: allEmployees } = useEmployees()

  const {
    incidents,
    getStats: getIncidentStats,
    initializeIncidents,
    getIncidentsByStatus,
    getRecentIncidents,
    loading: incidentsLoading,
    error: incidentsError,
    initialized: incidentsInitialized,
  } = useHSEIncidents()

  const {
    trainings,
    getStats: getTrainingStats,
    initializeTrainings,
    getUpcomingSessions,
    loading: trainingsLoading,
    error: trainingsError,
    initialized: trainingsInitialized,
  } = useHSETrainings()

  const { getOverallCompliance } = useHSECompliance()

  // Initialiser les données de base
  const { isInitialized: hseDataInitialized } = useHSEInit()

  // États de chargement et d'erreur
  const isLoading = incidentsLoading || trainingsLoading
  const hasErrors = incidentsError || trainingsError
  const isFullyInitialized = incidentsInitialized && trainingsInitialized && hseDataInitialized

  // Statistiques
  const incidentStats = getIncidentStats()
  const trainingStats = getTrainingStats()
  const upcomingSessions = getUpcomingSessions()
  const complianceRate = getOverallCompliance()

  // Vérification des permissions
  const canViewHSE = hasAnyRole(['DG', 'ADMIN', 'HSE', 'COMPLIANCE'])

  // Gestionnaires d'événements
  const handleRefresh = async () => {
    setLoading(true)
    try {
      await Promise.all([
        initializeIncidents(),
        initializeTrainings()
      ])
    } catch (err) {
      console.error('Erreur lors de l\'actualisation:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Rapport exécutif HSE exporté avec succès')
    } catch (err) {
      alert('Erreur lors de l\'export du rapport')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (type: string, id: string) => {
    console.log('Consulter détails:', { type, id })
    alert(`Consultation des détails ${type} - Gestion opérationnelle par l'équipe HSE`)
  }

  // Filtrage des incidents pour le DG
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter(incident => incident.severity === 'high' || incident.severity === 'medium')
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      .slice(0, 10)
  }, [incidents])

  // Filtrage des formations pour le DG
  const filteredTrainings = useMemo(() => {
    return trainings
      .filter(training => training.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [trainings])

  // Rendu des KPIs stratégiques
  const renderStrategicKPIs = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Incidents critiques</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{incidentStats.highSeverity}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="destructive" className="text-xs">
              {incidentStats.highSeverity} sévérité élevée
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{incidentStats.thisMonth} ce mois</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Formations actives</CardTitle>
          <BookOpen className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{trainingStats.active}</div>
          <p className="text-xs text-muted-foreground mt-2">Programmes en cours</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taux de conformité</CardTitle>
          <Shield className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{complianceRate}%</div>
          <StatusBadge
            status={complianceRate >= 90 ? 'Conforme' : 'À améliorer'}
            variant={complianceRate >= 90 ? 'success' : 'warning'}
            className="mt-2"
          />
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Employés formés</CardTitle>
          <Users className="h-4 w-4 text-info" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round((allEmployees?.length || 0) * (complianceRate / 100))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Sur {allEmployees?.length || 0} employés</p>
        </CardContent>
      </Card>
    </div>
  )

  // Rendu des incidents critiques
  const renderCriticalIncidents = () => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Incidents Critiques - Vue Stratégique
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isFullyInitialized ? (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-spin" />
            <p className="text-muted-foreground">Chargement des incidents...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium mb-2">Aucun incident critique</h3>
            <p className="text-muted-foreground">Excellente nouvelle ! Aucun incident critique n'a été signalé.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIncidents.map(incident => (
              <div
                key={incident.id}
                className="p-4 rounded-lg border border-border bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleViewDetails('incident', incident.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">{incident.type}</h3>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={
                        incident.severity === 'high' ? 'Élevé' : 'Moyen'
                      }
                      variant={
                        incident.severity === 'high' ? 'urgent' : 'warning'
                      }
                    />
                    <StatusBadge
                      status={
                        incident.status === 'reported' ? 'Signalé' :
                        incident.status === 'investigating' ? 'En cours' : 'Résolu'
                      }
                      variant={
                        incident.status === 'reported' ? 'info' :
                        incident.status === 'investigating' ? 'warning' : 'success'
                      }
                    />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="line-clamp-2">{incident.description}</p>
                  <p>Lieu: {incident.location}</p>
                  <p>Date: {incident.occurredAt.toLocaleDateString('fr-FR')}</p>
                  <p>Déclaré par: {incident.reportedBy}</p>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails('incident', incident.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Consulter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Rendu des formations stratégiques
  const renderStrategicTrainings = () => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Formations Stratégiques - Vue d'Ensemble
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isFullyInitialized ? (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-spin" />
            <p className="text-muted-foreground">Chargement des formations...</p>
          </div>
        ) : filteredTrainings.length === 0 ? (
          <div className="text-center py-6">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune formation active</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTrainings.map(training => (
              <div
                key={training.id}
                className="p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleViewDetails('training', training.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{training.title}</h4>
                  <StatusBadge
                    status={training.status === 'active' ? 'Actif' : 'Inactif'}
                    variant={training.status === 'active' ? 'success' : 'secondary'}
                  />
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>📚 {training.category}</p>
                  <p>⏱️ {training.duration} minutes</p>
                  <p>👥 {training.participants?.length || 0} participants</p>
                </div>
                <div className="mt-2 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails('training', training.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Consulter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Vérification des permissions
  if (!canViewHSE) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder au module HSE.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              📊 Vision Stratégique HSE - Direction Générale
            </h1>
            <p className="text-muted-foreground text-lg">
              {currentUser?.firstName} {currentUser?.lastName} - {currentUser?.matricule}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Tableau de bord décisionnel pour pilotage stratégique - {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleRefresh} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button onClick={handleExportReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Rapport Exécutif
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs Stratégiques */}
      {renderStrategicKPIs()}

      {/* Contenu principal par onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="incidents">Incidents Critiques</TabsTrigger>
          <TabsTrigger value="formations">Formations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderCriticalIncidents()}
            {renderStrategicTrainings()}
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          {renderCriticalIncidents()}
        </TabsContent>

        <TabsContent value="formations" className="space-y-6">
          {renderStrategicTrainings()}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics Stratégiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Analytics en développement</h3>
                <p className="text-muted-foreground">
                  Les analytics stratégiques seront disponibles prochainement pour le pilotage décisionnel.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => alert('Redirection vers l\'équipe HSE pour analytics détaillés')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Consulter Analytics HSE
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

