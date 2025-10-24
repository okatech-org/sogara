import { CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FormSuccessProps {
  message: string
  onDismiss?: () => void
  className?: string
}

export function FormSuccess({ message, onDismiss, className }: FormSuccessProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800',
        className,
      )}
    >
      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
      <span className="flex-1 text-sm">{message}</span>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  )
}
