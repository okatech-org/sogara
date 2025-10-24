import { useState, useEffect, useMemo } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Shield,
  Plus,
  Calendar,
  FileText,
  Users,
  TrendingUp,
  Loader2,
  RefreshCw,
  GraduationCap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { HSEIncidentForm } from './HSEIncidentForm'
import { HSEIncidentTimeline } from './HSEIncidentTimeline'
import { HSETrainingCalendar } from './HSETrainingCalendar'
import { HSEComplianceDashboard } from './HSEComplianceDashboard'
import { HSETrainingImporter } from './HSETrainingImporter'
import { HSETrainingCatalog } from './HSETrainingCatalog'
import { HSESessionScheduler } from './HSESessionScheduler'
import { HSETrainerDashboard } from './training/HSETrainerDashboard'
import { HSELoadingState } from './HSELoadingState'
import { HSESystemStatus } from './HSESystemStatus'
import { HSEQuickActions } from './HSEQuickActions'
import { HSEEquipmentManagement } from './HSEEquipmentManagement'
import { HSEAuditDashboard } from './HSEAuditDashboard'
import { HSEDataImportTools } from './HSEDataImportTools'
import { HSEMaintenanceTools } from './HSEMaintenanceTools'
import { HSEAnalyticsDashboard } from './HSEAnalyticsDashboard'
import { HSEAdvancedSearch } from './HSEAdvancedSearch'
import { HSEEmployeeManager } from './HSEEmployeeManager'
import { HSENotificationCenter } from './HSENotificationCenter'
import { HSETrainingAssignmentSystem } from './HSETrainingAssignmentSystem'
import { toast } from '@/hooks/use-toast'
import { HSEContentHub } from './HSEContentHub'
import { useAuth } from '@/contexts/AppContext'
import { useEmployees } from '@/hooks/useEmployees'
import { useHSEIncidents } from '@/hooks/useHSEIncidents'
import { useHSETrainings } from '@/hooks/useHSETrainings'
import { useHSECompliance } from '@/hooks/useHSECompliance'
import { useHSEInit } from '@/hooks/useHSEInit'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { HSEIncident, HSETraining, HSETrainingSession, HSENotification } from '@/types'
import { HSESystemValidator } from '@/utils/hse-system-validator'
import { HSEWelcomeTour } from './HSEWelcomeTour'

export function HSEDashboard() {
  const { hasAnyRole, state } = useAuth()
  const [showWelcomeTour, setShowWelcomeTour] = useState(false)

  // État pour la navigation entre onglets
  const [activeTab, setActiveTab] = useState('overview')

  // Charger les employés depuis le hook
  const { employees: allEmployees } = useEmployees()

  const {
    incidents,
    addIncident,
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

  // Initialiser les données de base de manière simple
  const { isInitialized: hseDataInitialized } = useHSEInit()

  // États des dialogs
  const [showIncidentForm, setShowIncidentForm] = useState(false)
  const [showIncidentDetails, setShowIncidentDetails] = useState<HSEIncident | null>(null)
  const [showTrainingSession, setShowTrainingSession] = useState<{
    training: HSETraining
    session: HSETrainingSession
  } | null>(null)
  const [showSessionScheduler, setShowSessionScheduler] = useState<HSETraining | null>(null)

  // États pour les filtres et recherche
  const [searchFilters, setSearchFilters] = useState<any>({})

  // États pour les notifications HSE
  const [notifications, setNotifications] = useState<HSENotification[]>([])

  const canManageHSE = hasAnyRole(['ADMIN', 'HSE', 'SUPERVISEUR'])
  const canViewHSE = hasAnyRole(['ADMIN', 'HSE', 'SUPERVISEUR', 'EMPLOYE'])

  // État de chargement global
  const isLoading = incidentsLoading || trainingsLoading
  const hasErrors = incidentsError || trainingsError
  const isFullyInitialized = incidentsInitialized && trainingsInitialized

  // Initialiser les données
  useEffect(() => {
    if (!isFullyInitialized && !isLoading) {
      initializeIncidents()
      initializeTrainings()
    }
  }, [initializeIncidents, initializeTrainings, isFullyInitialized, isLoading])

  // Afficher le tour de bienvenue pour les nouveaux utilisateurs
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('sogara_hse_tour_completed')
    if (!hasSeenTour && isFullyInitialized) {
      setShowWelcomeTour(true)
    }
  }, [isFullyInitialized])

  // Filtrage mémoïsé pour éviter les boucles de rendu
  const filteredIncidents = useMemo(() => {
    let filtered = incidents
    const term = searchFilters.searchTerm?.toLowerCase?.()
    if (term) {
      filtered = filtered.filter(
        incident =>
          incident.type.toLowerCase().includes(term) ||
          incident.description.toLowerCase().includes(term) ||
          incident.location.toLowerCase().includes(term),
      )
    }
    if (searchFilters.severity) {
      filtered = filtered.filter(incident => incident.severity === searchFilters.severity)
    }
    if (searchFilters.status) {
      filtered = filtered.filter(incident => incident.status === searchFilters.status)
    }
    if (searchFilters.type) {
      filtered = filtered.filter(incident => incident.type === searchFilters.type)
    }
    return filtered
  }, [incidents, searchFilters])

  // Récupérer les statistiques (seulement si initialisé)
  const incidentStats = isFullyInitialized
    ? getIncidentStats()
    : { open: 0, resolved: 0, thisMonth: 0, highSeverity: 0, total: 0 }
  const trainingStats = isFullyInitialized
    ? getTrainingStats()
    : {
        scheduled: 0,
        completed: 0,
        compliance: 0,
        totalTrainings: 0,
        totalSessions: 0,
        completionRate: 0,
      }
  const complianceRate = isFullyInitialized ? getOverallCompliance() : 0
  const upcomingSessions = isFullyInitialized ? getUpcomingSessions(7) : []
  const recentIncidents = isFullyInitialized ? getRecentIncidents(30) : []
  const openIncidents = isFullyInitialized
    ? getIncidentsByStatus('reported').concat(getIncidentsByStatus('investigating'))
    : []

  const handleIncidentSubmit = async (incidentData: Partial<HSEIncident>) => {
    try {
      await addIncident(
        incidentData as Omit<HSEIncident, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
      )
      setShowIncidentForm(false)
    } catch (error) {
      console.error("Erreur lors de la soumission de l'incident:", error)
      // Le toast d'erreur est déjà géré dans le hook
    }
  }

  const handleSessionClick = (training: HSETraining, session: HSETrainingSession) => {
    setShowTrainingSession({ training, session })
  }

  const handleScheduleSession = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId)
    if (training) {
      setShowSessionScheduler(training)
    }
  }

  // Gestionnaires pour les nouvelles fonctionnalités HSE
  const handleAssignTraining = (employeeId: string, trainingId: string) => {
    console.log('Attribution formation:', { employeeId, trainingId })
    // Logique d'attribution à implémenter
  }

  const handleSendNotification = (notification: Omit<HSENotification, 'id' | 'timestamp'>) => {
    const newNotification: HSENotification = {
      ...notification,
      id: `notif_${Date.now()}`,
      timestamp: new Date(),
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const handleMarkNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  const runSystemValidation = async () => {
    console.log('🔍 Lancement de la validation système HSE...')
    try {
      const validation = await HSESystemValidator.validateSystem()
      const integrity = await HSESystemValidator.validateDataIntegrity()

      console.log('📊 RÉSULTATS DE VALIDATION:')
      console.log(`✅ Système valide: ${validation.isValid}`)
      console.log(`✅ Intégrité: ${integrity}`)

      validation.checks.forEach(check => {
        const icon = check.status === 'success' ? '✅' : check.status === 'warning' ? '⚠️' : '❌'
        console.log(`   ${icon} ${check.name}: ${check.message}`)
      })

      return validation.isValid && integrity
    } catch (error) {
      console.error('❌ Erreur validation:', error)
      return false
    }
  }

  const renderKPIs = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="industrial-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Incidents ouverts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{incidentStats.open}</div>
          <div className="flex items-center gap-2 mt-1">
            {incidentStats.highSeverity > 0 && (
              <Badge variant="destructive" className="text-xs">
                {incidentStats.highSeverity} sévérité élevée
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{incidentStats.thisMonth} ce mois</p>
        </CardContent>
      </Card>

      <Card className="industrial-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Formations cette semaine</CardTitle>
          <BookOpen className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingSessions.length}</div>
          <p className="text-xs text-muted-foreground mt-2">Sessions programmées</p>
        </CardContent>
      </Card>

      <Card className="industrial-card">
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

      <Card className="industrial-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Actions requises</CardTitle>
          <TrendingUp className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {incidents.filter(i => i.status === 'investigating').length}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Enquêtes en cours</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderRecentIncidents = () => (
    <Card className="industrial-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Incidents récents
            {incidentsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </CardTitle>
          {canManageHSE && (
            <Button
              size="sm"
              onClick={() => setShowIncidentForm(true)}
              className="gap-2"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4" />
              Déclarer un incident
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isFullyInitialized ? (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-spin" />
            <p className="text-muted-foreground">Chargement des incidents...</p>
          </div>
        ) : recentIncidents.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium mb-2">Aucun incident récent</h3>
            <p className="text-muted-foreground">
              Excellente nouvelle ! Aucun incident n'a été signalé récemment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentIncidents.slice(0, 5).map(incident => (
              <div
                key={incident.id}
                className="p-4 rounded-lg border border-border bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setShowIncidentDetails(incident)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">{incident.type}</h3>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={
                        incident.severity === 'low'
                          ? 'Faible'
                          : incident.severity === 'medium'
                            ? 'Moyen'
                            : 'Élevé'
                      }
                      variant={
                        incident.severity === 'low'
                          ? 'info'
                          : incident.severity === 'medium'
                            ? 'warning'
                            : 'urgent'
                      }
                    />
                    <StatusBadge
                      status={
                        incident.status === 'reported'
                          ? 'Signalé'
                          : incident.status === 'investigating'
                            ? 'En cours'
                            : 'Résolu'
                      }
                      variant={
                        incident.status === 'reported'
                          ? 'info'
                          : incident.status === 'investigating'
                            ? 'warning'
                            : 'success'
                      }
                    />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Lieu: {incident.location}</p>
                  <p>Date: {incident.occurredAt.toLocaleDateString('fr-FR')}</p>
                  <p>Déclaré par: {incident.reportedBy}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderUpcomingTrainings = () => (
    <Card className="industrial-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Formations à venir
          {trainingsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isFullyInitialized ? (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-spin" />
            <p className="text-muted-foreground">Chargement des formations...</p>
          </div>
        ) : upcomingSessions.length === 0 ? (
          <div className="text-center py-6">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune formation programmée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.slice(0, 3).map(({ training, session }) => (
              <div
                key={session.id}
                className="p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSessionClick(training, session)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{training.title}</h4>
                  <StatusBadge
                    status={session.status === 'scheduled' ? 'Programmé' : 'En cours'}
                    variant={session.status === 'scheduled' ? 'info' : 'warning'}
                  />
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    📅{' '}
                    {session.date.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p>👨‍🏫 {session.instructor}</p>
                  <p>
                    👥 {session.attendance.length}/{session.maxParticipants} participants
                  </p>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{
                        width: `${(session.attendance.length / session.maxParticipants) * 100}%`,
                      }}
                    />
                  </div>
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
    <>
      {/* Tour de bienvenue */}
      {showWelcomeTour && <HSEWelcomeTour onComplete={() => setShowWelcomeTour(false)} />}

      <HSELoadingState
        loading={isLoading && !isFullyInitialized}
        error={hasErrors ? incidentsError || trainingsError : null}
        onRetry={() => {
          initializeIncidents()
          initializeTrainings()
        }}
      >
        <div className="space-y-6 animate-fade-in">
          {/* En-tête */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                HSE - Hygiène, Sécurité et Environnement
              </h1>
              <p className="text-muted-foreground">
                Gestion des incidents, formations et conformité réglementaire
              </p>
            </div>
            {canManageHSE && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowIncidentForm(true)}
                  className="gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  Déclarer un incident
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    initializeIncidents()
                    initializeTrainings()
                  }}
                  className="gap-2"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
                {hasAnyRole(['ADMIN']) && (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      console.log('Test système HSE - Validation des composants')
                      toast({
                        title: 'Test système',
                        description: 'Validation des composants HSE en cours...',
                      })
                    }} 
                    className="gap-2" 
                    size="sm"
                  >
                    <FileText className="w-4 h-4" />
                    Test système
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* KPIs */}
          {renderKPIs()}

          {/* Contenu principal par onglets */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-10">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="send">📤 Centre d'Envoi</TabsTrigger>
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
              <TabsTrigger value="formations">Formations</TabsTrigger>
              <TabsTrigger value="employees">Collaborateurs</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="assignment">Attribution</TabsTrigger>
              <TabsTrigger value="compliance">Conformité</TabsTrigger>
              <TabsTrigger value="status">Système</TabsTrigger>
              <TabsTrigger value="analytics">Rapports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Actions rapides */}
              <HSEQuickActions
                onCreateIncident={() => setShowIncidentForm(true)}
                onScheduleTraining={() => {
                  setActiveTab('formations')
                  if (trainings.length > 0) {
                    setShowSessionScheduler(trainings[0])
                  }
                }}
                onViewCompliance={() => {
                  setActiveTab('compliance')
                }}
                onExportReport={() => {
                  setActiveTab('analytics')
                }}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderRecentIncidents()}
                {renderUpcomingTrainings()}
              </div>
            </TabsContent>

            <TabsContent value="send" className="space-y-6">
              <HSEContentHub employees={allEmployees || []} />
            </TabsContent>

            <TabsContent value="incidents" className="space-y-4">
              {/* Recherche avancée d'incidents */}
              <Card className="industrial-card">
                <CardContent className="pt-6">
                  <HSEAdvancedSearch
                    onSearch={setSearchFilters}
                    onClear={() => setSearchFilters({})}
                    placeholder="Rechercher dans les incidents..."
                    showFilters={['severity', 'status', 'type']}
                  />
                </CardContent>
              </Card>

              {/* Liste des incidents filtrés */}
              <Card className="industrial-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Incidents HSE
                      {filteredIncidents.length !== incidents.length && (
                        <Badge variant="outline">
                          {filteredIncidents.length} sur {incidents.length}
                        </Badge>
                      )}
                    </CardTitle>
                    {canManageHSE && (
                      <Button onClick={() => setShowIncidentForm(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Nouveau incident
                      </Button>
                    )}
                  </div>
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
                      <h3 className="text-lg font-medium mb-2">
                        {searchFilters.searchTerm || Object.keys(searchFilters).length > 1
                          ? 'Aucun incident trouvé'
                          : 'Aucun incident signalé'}
                      </h3>
                      <p className="text-muted-foreground">
                        {searchFilters.searchTerm || Object.keys(searchFilters).length > 1
                          ? 'Essayez de modifier les critères de recherche'
                          : "Excellente nouvelle ! Aucun incident n'a été signalé."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredIncidents.map(incident => (
                        <div
                          key={incident.id}
                          className="p-4 rounded-lg border border-border bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setShowIncidentDetails(incident)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-foreground">{incident.type}</h3>
                            <div className="flex items-center gap-2">
                              <StatusBadge
                                status={
                                  incident.severity === 'low'
                                    ? 'Faible'
                                    : incident.severity === 'medium'
                                      ? 'Moyen'
                                      : 'Élevé'
                                }
                                variant={
                                  incident.severity === 'low'
                                    ? 'info'
                                    : incident.severity === 'medium'
                                      ? 'warning'
                                      : 'urgent'
                                }
                              />
                              <StatusBadge
                                status={
                                  incident.status === 'reported'
                                    ? 'Signalé'
                                    : incident.status === 'investigating'
                                      ? 'En cours'
                                      : 'Résolu'
                                }
                                variant={
                                  incident.status === 'reported'
                                    ? 'info'
                                    : incident.status === 'investigating'
                                      ? 'warning'
                                      : 'success'
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
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {openIncidents.length > 0 && (
                <Card className="industrial-card">
                  <CardHeader>
                    <CardTitle>Incidents nécessitant une attention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {openIncidents.map(incident => (
                        <div
                          key={incident.id}
                          className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                          onClick={() => setShowIncidentDetails(incident)}
                        >
                          <div>
                            <h4 className="font-medium">{incident.type}</h4>
                            <p className="text-sm text-muted-foreground">
                              {incident.location} •{' '}
                              {incident.occurredAt.toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <StatusBadge
                            status={incident.status === 'reported' ? 'À traiter' : 'En cours'}
                            variant="warning"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="formations" className="space-y-6">
              {/* Interface unifiée formations et modules */}
              <Tabs defaultValue="modules" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="modules">Modules Interactifs</TabsTrigger>
                  <TabsTrigger value="calendar">Calendrier & Sessions</TabsTrigger>
                  <TabsTrigger value="catalog">Catalogue & Import</TabsTrigger>
                </TabsList>

                <TabsContent value="modules">
                  <HSETrainerDashboard canManage={canManageHSE} />
                </TabsContent>

                <TabsContent value="calendar">
                  <HSETrainingCalendar
                    trainings={trainings}
                    onSessionClick={handleSessionClick}
                    canEdit={canManageHSE}
                  />
                </TabsContent>

                <TabsContent value="catalog" className="space-y-6">
                  {/* Système d'importation */}
                  <HSETrainingImporter
                    onImportComplete={() => {
                      initializeIncidents()
                      initializeTrainings()
                    }}
                  />

                  {/* Catalogue détaillé */}
                  <HSETrainingCatalog
                    trainings={trainings}
                    onScheduleSession={handleScheduleSession}
                    canManage={canManageHSE}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="employees" className="space-y-6">
              <HSEEmployeeManager
                employees={allEmployees || []}
                onAssignTraining={handleAssignTraining}
                onSendNotification={handleSendNotification}
              />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <HSENotificationCenter
                employees={allEmployees || []}
                notifications={notifications}
                onSendNotification={handleSendNotification}
                onMarkAsRead={handleMarkNotificationAsRead}
              />
            </TabsContent>

            <TabsContent value="assignment" className="space-y-6">
              <HSETrainingAssignmentSystem
                employees={allEmployees || []}
                onAssignTraining={assignments => {
                  console.log('Attributions automatiques:', assignments)
                }}
                onUpdateRules={rules => {
                  console.log('Mise à jour des règles:', rules)
                }}
              />
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              {/* Interface unifiée conformité et EPI */}
              <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="dashboard">Tableau de Bord</TabsTrigger>
                  <TabsTrigger value="epi">Gestion EPI</TabsTrigger>
                  <TabsTrigger value="audits">Audits & Contrôles</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                  <HSEComplianceDashboard />
                </TabsContent>

                <TabsContent value="epi">
                  <HSEEquipmentManagement />
                </TabsContent>

                <TabsContent value="audits">
                  <HSEAuditDashboard />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="status" className="space-y-6">
              {/* Outils système et administration */}
              <Tabs defaultValue="system" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="system">État Système</TabsTrigger>
                  <TabsTrigger value="imports">Outils Import</TabsTrigger>
                  <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                </TabsList>

                <TabsContent value="system">
                  <HSESystemStatus
                    onAction={action => {
                      switch (action) {
                        case 'init-training-system':
                          console.log('Initialisation système formation')
                          break
                        case 'view-compliance':
                          console.log('Redirection vers conformité')
                          break
                        default:
                          console.log('Action:', action)
                      }
                    }}
                  />
                </TabsContent>

                <TabsContent value="imports">
                  <HSEDataImportTools
                    onImportComplete={() => {
                      initializeIncidents()
                      initializeTrainings()
                    }}
                  />
                </TabsContent>

                <TabsContent value="maintenance">
                  <HSEMaintenanceTools />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <HSEAnalyticsDashboard
                incidents={incidents}
                trainings={trainings}
                employees={allEmployees || []}
              />
            </TabsContent>
          </Tabs>

          {/* Dialogs */}
          <Dialog open={showIncidentForm} onOpenChange={setShowIncidentForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Déclarer un incident</DialogTitle>
              </DialogHeader>
              <HSEIncidentForm
                onSubmit={handleIncidentSubmit}
                onCancel={() => setShowIncidentForm(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={!!showIncidentDetails} onOpenChange={() => setShowIncidentDetails(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Détails de l'incident</DialogTitle>
              </DialogHeader>
              {showIncidentDetails && (
                <HSEIncidentTimeline incident={showIncidentDetails} canEdit={canManageHSE} />
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={!!showTrainingSession} onOpenChange={() => setShowTrainingSession(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Session de formation</DialogTitle>
              </DialogHeader>
              {showTrainingSession && (
                <Card>
                  <CardHeader>
                    <CardTitle>{showTrainingSession.training.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        {showTrainingSession.training.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Date:</span>{' '}
                          {showTrainingSession.session.date.toLocaleDateString('fr-FR')}
                        </div>
                        <div>
                          <span className="font-medium">Formateur:</span>{' '}
                          {showTrainingSession.session.instructor}
                        </div>
                        <div>
                          <span className="font-medium">Lieu:</span>{' '}
                          {showTrainingSession.session.location}
                        </div>
                        <div>
                          <span className="font-medium">Durée:</span>{' '}
                          {showTrainingSession.training.duration} min
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Participants inscrits</span>
                          <span>
                            {showTrainingSession.session.attendance.length}/
                            {showTrainingSession.session.maxParticipants}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(showTrainingSession.session.attendance.length / showTrainingSession.session.maxParticipants) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={!!showSessionScheduler} onOpenChange={() => setShowSessionScheduler(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Planifier une session</DialogTitle>
              </DialogHeader>
              {showSessionScheduler && (
                <HSESessionScheduler
                  training={showSessionScheduler}
                  onScheduled={session => {
                    console.log('Session programmée:', session)
                    setShowSessionScheduler(null)
                    // Recharger les formations
                    initializeTrainings()
                  }}
                  onCancel={() => setShowSessionScheduler(null)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </HSELoadingState>
    </>
  )
}
