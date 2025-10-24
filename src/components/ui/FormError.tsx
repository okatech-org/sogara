import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormErrorProps {
  message?: string
  className?: string
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null

  return (
    <div className={cn('flex items-center gap-2 text-sm text-destructive', className)}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

interface FormFieldErrorProps {
  error?: string
  className?: string
}

export function FormFieldError({ error, className }: FormFieldErrorProps) {
  if (!error) return null

  return (
    <div className={cn('mt-1', className)}>
      <FormError message={error} />
    </div>
  )
}