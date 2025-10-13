import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HSENotificationCenter } from './HSENotificationCenter'
import { Employee, HSENotification } from '@/types'

interface HSENotificationPopoverProps {
  employees?: Employee[]
  notifications?: HSENotification[]
  onSendNotification?: (notification: Omit<HSENotification, 'id' | 'timestamp'>) => void
  onMarkAsRead?: (notificationId: string) => void
  unreadCount?: number
}

export function HSENotificationPopover({
  employees = [],
  notifications = [],
  onSendNotification,
  onMarkAsRead,
  unreadCount = 0,
}: HSENotificationPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[600px] p-0 max-h-[600px] overflow-hidden"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Notifications HSE</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} non {unreadCount > 1 ? 'lues' : 'lue'}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="p-4">
            <HSENotificationCenter
              employees={employees}
              notifications={notifications}
              onSendNotification={onSendNotification}
              onMarkAsRead={id => {
                onMarkAsRead?.(id)
              }}
              compact={true}
            />
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
