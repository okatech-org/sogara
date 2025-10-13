import { useEffect, useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { repositories } from '@/services/repositories'
import { HSEStats } from '@/types'
import { useHSEIncidents } from './useHSEIncidents'
import { useHSETrainings } from './useHSETrainings'
import { useHSECompliance } from './useHSECompliance'

/**
 * Hook centralisé pour gérer l'état global HSE de manière cohérente
 * Synchronise les données et fournit des statistiques consolidées
 */
export function useHSEState() {
  const { state, dispatch } = useApp()
  const [isGloballyInitialized, setIsGloballyInitialized] = useState(false)

  const {
    incidents,
    loading: incidentsLoading,
    initialized: incidentsInitialized,
    getStats: getIncidentStats,
  } = useHSEIncidents()

  const {
    trainings,
    loading: trainingsLoading,
    initialized: trainingsInitialized,
    getStats: getTrainingStats,
    getUpcomingSessions,
  } = useHSETrainings()

  const { getOverallCompliance } = useHSECompliance()

  // Initialiser les notifications depuis le storage
  useEffect(() => {
    if (!isGloballyInitialized) {
      const savedNotifications = repositories.notifications.getAll()
      dispatch({ type: 'SET_NOTIFICATIONS', payload: savedNotifications })
      setIsGloballyInitialized(true)
    }
  }, [dispatch, isGloballyInitialized])

  // Calculer les statistiques HSE consolidées
  const getConsolidatedHSEStats = (): HSEStats => {
    const incidentStats = getIncidentStats()
    const trainingStats = getTrainingStats()
    const complianceRate = getOverallCompliance()
    const upcomingSessions = getUpcomingSessions(7)

    return {
      incidents: {
        open: incidentStats.open || 0,
        resolved: incidentStats.resolved || 0,
        thisMonth: incidentStats.thisMonth || 0,
        highSeverity: incidentStats.highSeverity || 0,
      },
      trainings: {
        scheduled: upcomingSessions.length || 0,
        completed: trainingStats.completed || 0,
        compliance: complianceRate || 0,
        upcomingTrainings: trainingStats.scheduled || 0,
      },
      equipment: {
        needsInspection: state.equipment.filter(eq => {
          const nextWeek = new Date()
          nextWeek.setDate(nextWeek.getDate() + 7)
          return eq.nextCheckDate && eq.nextCheckDate <= nextWeek
        }).length,
        operational: state.equipment.filter(eq => eq.status === 'operational').length,
        maintenance: state.equipment.filter(eq => eq.status === 'maintenance').length,
      },
    }
  }

  // Mettre à jour les stats du dashboard global
  useEffect(() => {
    if (incidentsInitialized && trainingsInitialized) {
      const hseStats = getConsolidatedHSEStats()

      const updatedDashboardStats = {
        ...state.dashboardStats,
        hse: {
          openIncidents: hseStats.incidents.open,
          trainingsThisWeek: hseStats.trainings.scheduled,
          complianceRate: hseStats.trainings.compliance,
        },
      }

      dispatch({ type: 'UPDATE_DASHBOARD_STATS', payload: updatedDashboardStats })
    }
  }, [incidents, trainings, state.equipment, incidentsInitialized, trainingsInitialized, dispatch])

  // État général du module HSE
  const hseModuleState = {
    isLoading: incidentsLoading || trainingsLoading,
    isInitialized: incidentsInitialized && trainingsInitialized && isGloballyInitialized,
    hasData: incidents.length > 0 || trainings.length > 0,
    stats: getConsolidatedHSEStats(),
  }

  return {
    // État consolidé
    ...hseModuleState,

    // Données
    incidents,
    trainings,
    notifications: state.notifications.filter(n =>
      [
        'hse_training_expiring',
        'hse_incident_high',
        'hse_equipment_check',
        'hse_compliance_alert',
      ].includes(n.type),
    ),

    // Utilitaires
    getConsolidatedHSEStats,
    refreshAllData: () => {
      setIsGloballyInitialized(false)
    },
  }
}
