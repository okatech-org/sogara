import { useState, useCallback } from 'react'
import { Notification } from '@/components/ui/NotificationCenter'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    persistent = false
  ) => {
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      persistent,
    }

    setNotifications(prev => [notification, ...prev])
    return notification.id
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const clearRead = useCallback(() => {
    setNotifications(prev => prev.filter(notification => !notification.read))
  }, [])

  const getUnreadCount = useCallback(() => {
    return notifications.filter(notification => !notification.read).length
  }, [notifications])

  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(notification => notification.type === type)
  }, [notifications])

  // Méthodes de convenance pour différents types de notifications
  const showSuccess = useCallback((title: string, message: string) => {
    return addNotification('success', title, message)
  }, [addNotification])

  const showError = useCallback((title: string, message: string) => {
    return addNotification('error', title, message, true) // Les erreurs sont persistantes
  }, [addNotification])

  const showWarning = useCallback((title: string, message: string) => {
    return addNotification('warning', title, message)
  }, [addNotification])

  const showInfo = useCallback((title: string, message: string) => {
    return addNotification('info', title, message)
  }, [addNotification])

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    clearRead,
    getUnreadCount,
    getNotificationsByType,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}
