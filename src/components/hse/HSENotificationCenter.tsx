import { useState } from 'react';
import { Bell, AlertTriangle, Shield, Calendar, Wrench, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHSEAlerts } from '@/hooks/useHSEAlerts';
import { HSENotification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HSENotificationCenterProps {
  className?: string;
}

export function HSENotificationCenter({ className }: HSENotificationCenterProps) {
  const { 
    getUnreadHSEAlerts, 
    getPriorityAlerts, 
    getHSEAlertsByType,
    getHSEAlertsSummary,
    markAlertAsRead 
  } = useHSEAlerts();
  
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // États réactifs avec fallbacks sécurisés
  const unreadAlerts = getUnreadHSEAlerts() || [];
  const priorityAlerts = getPriorityAlerts() || [];
  const alertsSummary = getHSEAlertsSummary() || { 
    total: 0, 
    priority: 0, 
    byType: { 
      trainingExpiring: 0, 
      incidentHigh: 0, 
      equipmentCheck: 0, 
      complianceAlert: 0 
    } 
  };
  
  const getNotificationIcon = (type: HSENotification['type']) => {
    switch (type) {
      case 'hse_training_expiring':
        return <Calendar className="w-4 h-4 text-yellow-500" />;
      case 'hse_incident_high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'hse_equipment_check':
        return <Wrench className="w-4 h-4 text-blue-500" />;
      case 'hse_compliance_alert':
        return <Shield className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: HSENotification['type']) => {
    switch (type) {
      case 'hse_incident_high':
      case 'hse_compliance_alert':
        return 'border-l-red-500 bg-red-50';
      case 'hse_training_expiring':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'hse_equipment_check':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleMarkAsRead = async (alertId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      setLoading(true);
      await markAlertAsRead(alertId);
    } catch (error) {
      console.error('Erreur lors du marquage de l\'alerte:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderNotificationItem = (notification: HSENotification) => (
    <div
      key={notification.id}
      className={`p-3 border-l-4 ${getNotificationColor(notification.type)} hover:bg-opacity-80 transition-colors cursor-pointer`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message}
              </p>
            </div>
            
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-white/50"
                onClick={(e) => handleMarkAsRead(notification.id, e)}
                title="Marquer comme lu"
              >
                <Check className="w-3 h-3" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: fr })}
            </span>
            
            {notification.metadata?.daysUntilExpiry !== undefined && (
              <Badge variant="outline" className="text-xs">
                {notification.metadata.daysUntilExpiry < 0 
                  ? 'Expiré' 
                  : `${notification.metadata.daysUntilExpiry}j`
                }
              </Badge>
            )}
            
            {notification.metadata?.complianceRate !== undefined && (
              <Badge variant="outline" className="text-xs">
                {notification.metadata.complianceRate}% conformité
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = (alerts: HSENotification[]) => (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune notification</p>
          </div>
        ) : (
          alerts.map(renderNotificationItem)
        )}
      </div>
    </ScrollArea>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative ${className}`}
        >
          <Bell className="w-5 h-5" />
          {unreadAlerts.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadAlerts.length > 99 ? '99+' : unreadAlerts.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Notifications HSE
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Résumé des alertes */}
            {unreadAlerts.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>{alertsSummary.priority} prioritaire(s)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Bell className="w-4 h-4 text-blue-500" />
                  <span>{alertsSummary.total} au total</span>
                </div>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
                <TabsTrigger value="all" className="text-xs px-2">
                  Toutes
                  {unreadAlerts.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                      {unreadAlerts.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="priority" className="text-xs px-2">
                  Urgent
                  {alertsSummary.priority > 0 && (
                    <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                      {alertsSummary.priority}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="training" className="text-xs px-2">
                  Formation
                  {alertsSummary.byType.trainingExpiring > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                      {alertsSummary.byType.trainingExpiring}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="equipment" className="text-xs px-2">
                  EPI
                  {alertsSummary.byType.equipmentCheck > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                      {alertsSummary.byType.equipmentCheck}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                {renderTabContent(unreadAlerts)}
              </TabsContent>
              
              <TabsContent value="priority" className="mt-0">
                {renderTabContent(priorityAlerts)}
              </TabsContent>
              
              <TabsContent value="training" className="mt-0">
                {renderTabContent(getHSEAlertsByType('hse_training_expiring').filter(a => !a.read))}
              </TabsContent>
              
              <TabsContent value="equipment" className="mt-0">
                {renderTabContent(getHSEAlertsByType('hse_equipment_check').filter(a => !a.read))}
              </TabsContent>
            </Tabs>
          </CardContent>
          
          {unreadAlerts.length > 5 && (
            <div className="p-3 border-t bg-gray-50">
              <Button 
                variant="ghost" 
                className="w-full text-sm text-gray-600 hover:text-gray-900"
                onClick={() => {
                  // Naviguer vers une page dédiée aux notifications
                  setIsOpen(false);
                }}
              >
                Voir toutes les notifications ({unreadAlerts.length})
              </Button>
            </div>
          )}
        </Card>
      </PopoverContent>
    </Popover>
  );
}
