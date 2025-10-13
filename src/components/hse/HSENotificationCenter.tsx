import { useState, useEffect, useMemo } from 'react'
import {
  Bell,
  Send,
  Users,
  Clock,
  AlertTriangle,
  BookOpen,
  Shield,
  Check,
  X,
  Filter,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusBadge } from '@/components/ui/status-badge'
import { useAuth } from '@/contexts/AppContext'
import { Employee, HSENotification, UserRole } from '@/types'
import { toast } from '@/hooks/use-toast'

interface HSENotificationCenterProps {
  employees?: Employee[]
  notifications?: HSENotification[]
  onSendNotification?: (notification: Omit<HSENotification, 'id' | 'timestamp'>) => void
  onMarkAsRead?: (notificationId: string) => void
  compact?: boolean
}

interface NotificationTemplate {
  id: string
  title: string
  type: HSENotification['type']
  message: string
  targetRoles?: UserRole[]
  priority: 'low' | 'medium' | 'high'
}

const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'training_reminder',
    title: 'Rappel de formation',
    type: 'hse_training_expiring',
    message:
      'Votre formation arrive à expiration. Veuillez programmer votre session de renouvellement.',
    targetRoles: ['EMPLOYE', 'SUPERVISEUR'],
    priority: 'medium',
  },
  {
    id: 'training_mandatory',
    title: 'Formation obligatoire',
    type: 'hse_training_expiring',
    message:
      'Une nouvelle formation obligatoire vous a été assignée. Merci de la programmer dans les plus brefs délais.',
    targetRoles: ['EMPLOYE', 'SUPERVISEUR'],
    priority: 'high',
  },
  {
    id: 'safety_alert',
    title: 'Alerte sécurité',
    type: 'hse_incident_high',
    message:
      'Alerte sécurité importante : Merci de respecter strictement les consignes de sécurité sur votre poste.',
    targetRoles: ['EMPLOYE', 'SUPERVISEUR'],
    priority: 'high',
  },
  {
    id: 'equipment_check',
    title: 'Vérification équipement',
    type: 'hse_equipment_check',
    message:
      'Votre équipement de sécurité nécessite une vérification. Merci de vous présenter au service HSE.',
    targetRoles: ['EMPLOYE'],
    priority: 'medium',
  },
  {
    id: 'compliance_alert',
    title: 'Alerte conformité',
    type: 'hse_compliance_alert',
    message:
      'Attention : Votre taux de conformité HSE est en dessous du seuil requis. Action corrective nécessaire.',
    targetRoles: ['SUPERVISEUR'],
    priority: 'high',
  },
]

export function HSENotificationCenter(props: Partial<HSENotificationCenterProps> = {}) {
  const {
    employees = [],
    notifications = [],
    onSendNotification,
    onMarkAsRead,
    compact = false,
  } = props
  const { hasAnyRole, currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('received')
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [customMessage, setCustomMessage] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationType, setNotificationType] = useState<HSENotification['type']>('info')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterRead, setFilterRead] = useState<string>('all')

  const canManageHSE = hasAnyRole(['ADMIN', 'HSE'])
  const isHSE = hasAnyRole(['HSE'])

  // Filtrer les notifications reçues
  const filteredNotifications = useMemo(() => {
    let filtered = notifications.filter(
      n => !n.metadata?.employeeId || n.metadata.employeeId === user?.id,
    )

    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType)
    }

    if (filterRead !== 'all') {
      const isRead = filterRead === 'read'
      filtered = filtered.filter(n => n.read === isRead)
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [notifications, user?.id, filterType, filterRead])

  // Notifications envoyées (pour les HSE)
  const sentNotifications = useMemo(() => {
    if (!isHSE) return []
    return notifications
      .filter(n => n.metadata?.sentBy === user?.id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [notifications, user?.id, isHSE])

  const handleTemplateSelect = (templateId: string) => {
    const template = NOTIFICATION_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setNotificationTitle(template.title)
      setCustomMessage(template.message)
      setNotificationType(template.type)

      // Pré-sélectionner les employés selon les rôles cibles
      if (template.targetRoles) {
        const targetEmployees = employees
          .filter(emp => emp.roles.some(role => template.targetRoles.includes(role)))
          .map(emp => emp.id)
        setSelectedEmployees(targetEmployees)
      }
    }
  }

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId) ? prev.filter(id => id !== employeeId) : [...prev, employeeId],
    )
  }

  const handleSendNotification = () => {
    if (!notificationTitle.trim() || !customMessage.trim() || selectedEmployees.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs et sélectionner au moins un destinataire.',
        variant: 'destructive',
      })
      return
    }

    selectedEmployees.forEach(employeeId => {
      const notification: Omit<HSENotification, 'id' | 'timestamp'> = {
        type: notificationType,
        title: notificationTitle,
        message: customMessage,
        read: false,
        metadata: {
          employeeId,
          sentBy: user?.id,
        },
      }

      onSendNotification?.(notification)
    })

    // Réinitialiser le formulaire
    setNotificationTitle('')
    setCustomMessage('')
    setSelectedEmployees([])
    setSelectedTemplate('')
    setNotificationType('info')
    setShowSendDialog(false)

    toast({
      title: 'Notifications envoyées',
      description: `${selectedEmployees.length} notification(s) envoyée(s) avec succès.`,
    })
  }

  const getNotificationIcon = (type: HSENotification['type']) => {
    switch (type) {
      case 'hse_training_expiring':
        return <BookOpen className="w-4 h-4" />
      case 'hse_incident_high':
        return <AlertTriangle className="w-4 h-4" />
      case 'hse_equipment_check':
        return <Shield className="w-4 h-4" />
      case 'hse_compliance_alert':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getNotificationVariant = (
    type: HSENotification['type'],
  ): 'info' | 'warning' | 'urgent' | 'success' => {
    switch (type) {
      case 'hse_incident_high':
      case 'hse_compliance_alert':
        return 'urgent'
      case 'hse_training_expiring':
      case 'hse_equipment_check':
        return 'warning'
      case 'success':
        return 'success'
      default:
        return 'info'
    }
  }

  const renderNotificationCard = (notification: HSENotification) => {
    const employee = employees.find(e => e.id === notification.metadata?.employeeId)
    const sender = employees.find(e => e.id === notification.metadata?.sentBy)

    if (compact) {
      return (
        <div
          key={notification.id}
          className={`p-3 rounded-lg border transition-all hover:bg-muted/30 ${
            !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : 'border-border'
          }`}
        >
          <div className="flex items-start gap-2">
            <div
              className={`p-1.5 rounded ${
                notification.type === 'hse_incident_high' ||
                notification.type === 'hse_compliance_alert'
                  ? 'bg-red-100'
                  : notification.type === 'hse_training_expiring' ||
                      notification.type === 'hse_equipment_check'
                    ? 'bg-yellow-100'
                    : 'bg-blue-100'
              }`}
            >
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                  {!notification.read && (
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse flex-shrink-0" />
                  )}
                </div>
                {!notification.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={e => {
                      e.stopPropagation()
                      onMarkAsRead?.(notification.id)
                    }}
                    className="h-6 px-1 ml-2"
                    title="Marquer comme lu"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                {notification.message}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {notification.timestamp.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {activeTab === 'received' && sender && (
                  <span className="truncate">
                    De: {sender.firstName} {sender.lastName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <Card
        key={notification.id}
        className={`industrial-card hover:shadow-md transition-all ${
          !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
        }`}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div
                className={`p-2 rounded-lg ${
                  notification.type === 'hse_incident_high' ||
                  notification.type === 'hse_compliance_alert'
                    ? 'bg-red-100'
                    : notification.type === 'hse_training_expiring' ||
                        notification.type === 'hse_equipment_check'
                      ? 'bg-yellow-100'
                      : 'bg-blue-100'
                }`}
              >
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">{notification.title}</h4>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
                <StatusBadge
                  status={notification.type.replace('hse_', '').replace('_', ' ')}
                  variant={getNotificationVariant(notification.type)}
                  className="mb-2"
                />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {notification.timestamp.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {!notification.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMarkAsRead?.(notification.id)}
                  className="h-7 px-2 gap-1 text-xs"
                  title="Marquer comme lu"
                >
                  <Check className="w-3 h-3" />
                  Lu
                </Button>
              )}
            </div>
          </div>

          <p className="text-sm text-foreground mb-3 pl-12 leading-relaxed">
            {notification.message}
          </p>

          <div className="flex items-center gap-4 pl-12 text-xs text-muted-foreground">
            {activeTab === 'received' && sender && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                De: {sender.firstName} {sender.lastName}
              </span>
            )}
            {activeTab === 'sent' && employee && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                À: {employee.firstName} {employee.lastName}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className={compact ? 'space-y-3' : 'space-y-6'}>
        {/* En-tête - masqué en mode compact */}
        {!compact && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Centre de Notifications HSE</h1>
                <p className="text-muted-foreground">Communication et alertes sécurité</p>
              </div>
              {canManageHSE && (
                <Button onClick={() => setShowSendDialog(true)} className="gap-2">
                  <Send className="w-4 h-4" />
                  Envoyer une notification
                </Button>
              )}
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Total reçues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredNotifications.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    Non lues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {filteredNotifications.filter(n => !n.read).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    Urgentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {
                      filteredNotifications.filter(
                        n => n.type === 'hse_incident_high' || n.type === 'hse_compliance_alert',
                      ).length
                    }
                  </div>
                </CardContent>
              </Card>

              {isHSE && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Send className="w-4 h-4 text-blue-500" />
                      Envoyées
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {sentNotifications.length}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Barre de recherche et filtres compacts - simplifiés en mode compact */}
        {!compact && (
          <Card className="industrial-card">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher dans les notifications..."
                    className="pl-10"
                    disabled
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="hse_training_expiring">📚 Formations</SelectItem>
                      <SelectItem value="hse_incident_high">⚠️ Incidents</SelectItem>
                      <SelectItem value="hse_equipment_check">🛡️ Équipements</SelectItem>
                      <SelectItem value="hse_compliance_alert">📋 Conformité</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterRead} onValueChange={setFilterRead}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="unread">Non lues</SelectItem>
                      <SelectItem value="read">Lues</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtres compacts pour le mode popover */}
        {compact && (
          <div className="flex gap-2 mb-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="hse_training_expiring">📚 Formations</SelectItem>
                <SelectItem value="hse_incident_high">⚠️ Incidents</SelectItem>
                <SelectItem value="hse_equipment_check">🛡️ EPI</SelectItem>
                <SelectItem value="hse_compliance_alert">📋 Conformité</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRead} onValueChange={setFilterRead}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="unread">Non lues</SelectItem>
                <SelectItem value="read">Lues</SelectItem>
              </SelectContent>
            </Select>

            {canManageHSE && (
              <Button size="sm" onClick={() => setShowSendDialog(true)} className="gap-1">
                <Send className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}

        {/* Onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">
              <Bell className="w-4 h-4 mr-2" />
              Notifications reçues
            </TabsTrigger>
            {isHSE && (
              <TabsTrigger value="sent">
                <Send className="w-4 h-4 mr-2" />
                Notifications envoyées
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {/* Liste des notifications */}
            {filteredNotifications.length === 0 ? (
              compact ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 bg-muted/30 rounded-full flex items-center justify-center">
                    <Bell className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground px-4">
                    {filterType !== 'all' || filterRead !== 'all'
                      ? 'Aucune notification correspondante'
                      : 'Aucune notification pour le moment'}
                  </p>
                </div>
              ) : (
                <Card className="industrial-card">
                  <CardContent className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 bg-muted/30 rounded-full flex items-center justify-center">
                      <Bell className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Aucune notification</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {filterType !== 'all' || filterRead !== 'all'
                        ? 'Aucune notification ne correspond à vos critères de filtrage. Essayez de modifier les filtres.'
                        : "Vous n'avez reçu aucune notification pour le moment. Les alertes et informations HSE apparaîtront ici."}
                    </p>
                    {(filterType !== 'all' || filterRead !== 'all') && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setFilterType('all')
                          setFilterRead('all')
                        }}
                      >
                        Réinitialiser les filtres
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            ) : (
              <div className="space-y-3">{filteredNotifications.map(renderNotificationCard)}</div>
            )}
          </TabsContent>

          {isHSE && (
            <TabsContent value="sent" className="space-y-4">
              {sentNotifications.length === 0 ? (
                compact ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                      <Send className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-muted-foreground px-4 mb-3">
                      Aucune notification envoyée
                    </p>
                    <Button size="sm" onClick={() => setShowSendDialog(true)} className="gap-2">
                      <Send className="w-3 h-3" />
                      Envoyer
                    </Button>
                  </div>
                ) : (
                  <Card className="industrial-card">
                    <CardContent className="text-center py-16">
                      <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <Send className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Historique vide</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-4">
                        Vous n'avez encore envoyé aucune notification. Utilisez le bouton "Envoyer
                        une notification" pour communiquer avec les collaborateurs.
                      </p>
                      <Button onClick={() => setShowSendDialog(true)} className="gap-2">
                        <Send className="w-4 h-4" />
                        Envoyer ma première notification
                      </Button>
                    </CardContent>
                  </Card>
                )
              ) : (
                <div className="space-y-3">{sentNotifications.map(renderNotificationCard)}</div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Dialog d'envoi de notification */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Envoyer une notification HSE</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Templates */}
            <div>
              <label className="text-sm font-medium">Modèle prédéfini (optionnel):</label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un modèle..." />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_TEMPLATES.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Titre */}
            <div>
              <label className="text-sm font-medium">Titre:</label>
              <Input
                value={notificationTitle}
                onChange={e => setNotificationTitle(e.target.value)}
                placeholder="Titre de la notification"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-sm font-medium">Type:</label>
              <Select
                value={notificationType}
                onValueChange={value => setNotificationType(value as HSENotification['type'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="warning">Avertissement</SelectItem>
                  <SelectItem value="hse_training_expiring">Formation</SelectItem>
                  <SelectItem value="hse_incident_high">Incident</SelectItem>
                  <SelectItem value="hse_equipment_check">Équipement</SelectItem>
                  <SelectItem value="hse_compliance_alert">Conformité</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium">Message:</label>
              <Textarea
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                placeholder="Votre message..."
                rows={4}
              />
            </div>

            {/* Sélection des destinataires */}
            <div>
              <label className="text-sm font-medium">Destinataires:</label>
              <ScrollArea className="h-48 border rounded-md p-3">
                <div className="space-y-2">
                  {employees.map(employee => (
                    <div key={employee.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={employee.id}
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() => handleEmployeeToggle(employee.id)}
                      />
                      <label htmlFor={employee.id} className="text-sm cursor-pointer flex-1">
                        {employee.firstName} {employee.lastName} ({employee.matricule}) -{' '}
                        {employee.service}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedEmployees.length} destinataire(s) sélectionné(s)
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleSendNotification}>
                <Send className="w-4 h-4 mr-2" />
                Envoyer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
