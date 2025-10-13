import { useCallback, useEffect } from 'react'
import { HSENotification } from '@/types'
import { useApp } from '@/contexts/AppContext'
import { useHSETrainings } from './useHSETrainings'
import { useHSECompliance } from './useHSECompliance'
import { repositories } from '@/services/repositories'

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function useHSEAlerts() {
  const { state, dispatch } = useApp()
  const { getExpiringTrainings, getExpiredTrainings } = useHSETrainings()
  const { getOverallCompliance, getEmployeesRequiringAction } = useHSECompliance()

  // Générer les alertes de formations expirées/expirant bientôt
  const generateTrainingAlerts = useCallback(() => {
    const alerts: HSENotification[] = []
    const now = new Date()

    state.employees.forEach(employee => {
      // Formations expirées
      const expired = getExpiredTrainings(employee.id)
      if (expired.length > 0) {
        alerts.push({
          id: generateId(),
          type: 'hse_training_expiring',
          title: 'Formations expirées',
          message: `${expired.length} formation(s) ont expiré pour ${employee.firstName} ${employee.lastName}`,
          timestamp: now,
          read: false,
          metadata: {
            employeeId: employee.id,
            daysUntilExpiry: -1, // Négatif pour indiquer que c'est expiré
          },
        })
      }

      // Formations expirant dans 30 jours
      const expiring = getExpiringTrainings(employee.id, 30)
      if (expiring.length > 0) {
        const minDays = Math.min(...expiring.map(e => e.daysUntilExpiry))
        alerts.push({
          id: generateId(),
          type: 'hse_training_expiring',
          title: 'Formations à renouveler',
          message: `${expiring.length} formation(s) expire(nt) dans ${minDays} jour(s) pour ${employee.firstName} ${employee.lastName}`,
          timestamp: now,
          read: false,
          metadata: {
            employeeId: employee.id,
            daysUntilExpiry: minDays,
          },
        })
      }
    })

    return alerts
  }, [state.employees, getExpiredTrainings, getExpiringTrainings])

  // Générer les alertes de conformité faible
  const generateComplianceAlerts = useCallback(() => {
    const alerts: HSENotification[] = []
    const now = new Date()
    const overallCompliance = getOverallCompliance()

    // Alerte si la conformité globale est inférieure à 90%
    if (overallCompliance < 90) {
      alerts.push({
        id: generateId(),
        type: 'hse_compliance_alert',
        title: 'Taux de conformité faible',
        message: `Le taux de conformité global est de ${overallCompliance}%. Action requise.`,
        timestamp: now,
        read: false,
        metadata: {
          complianceRate: overallCompliance,
        },
      })
    }

    // Alertes pour les employés nécessitant une action urgente
    const employeesNeedingAction = getEmployeesRequiringAction()
    const urgentCases = employeesNeedingAction.filter(item => item.priority === 'high')

    urgentCases.forEach(item => {
      alerts.push({
        id: generateId(),
        type: 'hse_compliance_alert',
        title: 'Action urgente requise',
        message: `${item.employee.firstName} ${item.employee.lastName} nécessite une action urgente (${item.compliance.rate}% conformité)`,
        timestamp: now,
        read: false,
        metadata: {
          employeeId: item.employee.id,
          complianceRate: item.compliance.rate,
        },
      })
    })

    return alerts
  }, [getOverallCompliance, getEmployeesRequiringAction])

  // Générer les alertes d'équipements EPI
  const generateEquipmentAlerts = useCallback(() => {
    const alerts: HSENotification[] = []
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    state.equipment.forEach(equipment => {
      if (equipment.nextCheckDate && equipment.nextCheckDate <= nextWeek) {
        const daysUntilCheck = Math.ceil(
          (equipment.nextCheckDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        )

        alerts.push({
          id: generateId(),
          type: 'hse_equipment_check',
          title: 'Inspection EPI requise',
          message: `${equipment.label} doit être inspecté ${daysUntilCheck <= 0 ? 'immédiatement' : `dans ${daysUntilCheck} jour(s)`}`,
          timestamp: now,
          read: false,
          metadata: {
            equipmentId: equipment.id,
            daysUntilExpiry: daysUntilCheck,
          },
        })
      }
    })

    return alerts
  }, [state.equipment])

  // Générer toutes les alertes HSE
  const generateAllHSEAlerts = useCallback(async () => {
    const trainingAlerts = generateTrainingAlerts()
    const complianceAlerts = generateComplianceAlerts()
    const equipmentAlerts = generateEquipmentAlerts()

    const allAlerts = [...trainingAlerts, ...complianceAlerts, ...equipmentAlerts]

    // Éviter les doublons en vérifiant les alertes existantes
    const existingAlerts = state.notifications
    const newAlerts = allAlerts.filter(
      alert =>
        !existingAlerts.some(
          existing =>
            existing.type === alert.type &&
            existing.message === alert.message &&
            existing.metadata?.employeeId === alert.metadata?.employeeId,
        ),
    )

    // Ajouter les nouvelles alertes
    for (const alert of newAlerts) {
      const savedAlert = repositories.notifications.create(alert)
      dispatch({ type: 'ADD_NOTIFICATION', payload: savedAlert })
    }

    return newAlerts
  }, [
    generateTrainingAlerts,
    generateComplianceAlerts,
    generateEquipmentAlerts,
    state.notifications,
    dispatch,
  ])

  // Marquer une alerte comme lue
  const markAlertAsRead = useCallback(
    async (alertId: string) => {
      const success = repositories.notifications.markAsRead(alertId)
      if (success) {
        const updatedNotifications = state.notifications.map(notification =>
          notification.id === alertId ? { ...notification, read: true } : notification,
        )
        dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedNotifications })
      }
      return success
    },
    [state.notifications, dispatch],
  )

  // Obtenir les alertes HSE non lues
  const getUnreadHSEAlerts = useCallback(() => {
    const hseTypes = [
      'hse_training_expiring',
      'hse_incident_high',
      'hse_equipment_check',
      'hse_compliance_alert',
    ]
    return state.notifications.filter(
      notification => !notification.read && hseTypes.includes(notification.type),
    )
  }, [state.notifications])

  // Obtenir les alertes HSE par type
  const getHSEAlertsByType = useCallback(
    (type: HSENotification['type']) => {
      return state.notifications
        .filter(notification => notification.type === type)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    },
    [state.notifications],
  )

  // Obtenir les alertes prioritaires (urgentes)
  const getPriorityAlerts = useCallback(() => {
    const priorityTypes = ['hse_incident_high', 'hse_compliance_alert']
    const urgentAlerts = state.notifications.filter(
      notification => priorityTypes.includes(notification.type) && !notification.read,
    )

    // Ajouter les formations expirées (jours négatifs)
    const expiredTrainingAlerts = state.notifications.filter(
      notification =>
        notification.type === 'hse_training_expiring' &&
        !notification.read &&
        notification.metadata?.daysUntilExpiry !== undefined &&
        notification.metadata.daysUntilExpiry < 0,
    )

    return [...urgentAlerts, ...expiredTrainingAlerts].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    )
  }, [state.notifications])

  // Obtenir un résumé des alertes HSE
  const getHSEAlertsSummary = useCallback(() => {
    const unreadAlerts = getUnreadHSEAlerts()
    const priorityAlerts = getPriorityAlerts()

    const summary = {
      total: unreadAlerts.length,
      priority: priorityAlerts.length,
      byType: {
        trainingExpiring: getHSEAlertsByType('hse_training_expiring').filter(a => !a.read).length,
        incidentHigh: getHSEAlertsByType('hse_incident_high').filter(a => !a.read).length,
        equipmentCheck: getHSEAlertsByType('hse_equipment_check').filter(a => !a.read).length,
        complianceAlert: getHSEAlertsByType('hse_compliance_alert').filter(a => !a.read).length,
      },
    }

    return summary
  }, [getUnreadHSEAlerts, getPriorityAlerts, getHSEAlertsByType])

  // Supprimer les anciennes alertes (plus de 30 jours)
  const cleanupOldAlerts = useCallback(async () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentNotifications = state.notifications.filter(
      notification => notification.timestamp > thirtyDaysAgo,
    )

    if (recentNotifications.length !== state.notifications.length) {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: recentNotifications })
      // Mettre à jour le storage
      localStorage.setItem('sogara_notifications', JSON.stringify(recentNotifications))
    }
  }, [state.notifications, dispatch])

  // Effet pour générer automatiquement les alertes
  useEffect(() => {
    // Générer les alertes au démarrage et toutes les heures
    generateAllHSEAlerts()
    cleanupOldAlerts()

    const interval = setInterval(
      () => {
        generateAllHSEAlerts()
        cleanupOldAlerts()
      },
      60 * 60 * 1000,
    ) // Toutes les heures

    return () => clearInterval(interval)
  }, [generateAllHSEAlerts, cleanupOldAlerts])

  return {
    generateAllHSEAlerts,
    generateTrainingAlerts,
    generateComplianceAlerts,
    generateEquipmentAlerts,
    markAlertAsRead,
    getUnreadHSEAlerts,
    getHSEAlertsByType,
    getPriorityAlerts,
    getHSEAlertsSummary,
    cleanupOldAlerts,
  }
}
