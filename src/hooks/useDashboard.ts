import { useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { repositories } from '@/services/repositories'
import { DashboardStats } from '@/types'

export function useDashboard() {
  const { state, dispatch } = useApp()

  useEffect(() => {
    updateDashboardStats()
  }, [state.visits, state.packages, state.equipment])

  const updateDashboardStats = () => {
    const visitsStats = repositories.visits.getTodaysStats()
    const packageStats = repositories.packages.getStats()
    const equipmentStats = repositories.equipment.getStats()

    const dashboardStats: DashboardStats = {
      visitsToday: visitsStats,
      packages: packageStats,
      equipment: equipmentStats,
      hse: {
        openIncidents: 0, // À implémenter avec le module HSE
        trainingsThisWeek: 0,
        complianceRate: 95,
      },
    }

    dispatch({ type: 'UPDATE_DASHBOARD_STATS', payload: dashboardStats })
  }

  const getRecentNotifications = () => {
    return state.notifications.filter(n => !n.read).slice(0, 5)
  }

  const markNotificationAsRead = (notificationId: string) => {
    repositories.notifications.markAsRead(notificationId)
    const updatedNotifications = repositories.notifications.getAll()
    dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedNotifications })
  }

  return {
    stats: state.dashboardStats,
    notifications: state.notifications,
    recentNotifications: getRecentNotifications(),
    updateDashboardStats,
    markNotificationAsRead,
  }
}
