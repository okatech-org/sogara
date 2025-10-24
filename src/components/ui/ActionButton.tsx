import { Button, ButtonProps } from './button'
import { LoadingSpinner } from './LoadingSpinner'
import { cn } from '@/lib/utils'

interface ActionButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick?: () => void | Promise<void>
  loading?: boolean
  success?: boolean
  error?: boolean
  loadingText?: string
  successText?: string
  errorText?: string
  icon?: React.ReactNode
  children: React.ReactNode
}

export function ActionButton({
  onClick,
  loading = false,
  success = false,
  error = false,
  loadingText,
  successText,
  errorText,
  icon,
  children,
  className,
  disabled,
  ...props
}: ActionButtonProps) {
  const handleClick = async () => {
    if (onClick && !loading && !disabled) {
      try {
        await onClick()
      } catch (err) {
        console.error('Action button error:', err)
      }
    }
  }

  const getButtonContent = () => {
    if (loading) {
      return (
        <>
          <LoadingSpinner size="sm" />
          {loadingText || 'Chargement...'}
        </>
      )
    }

    if (success) {
      return (
        <>
          <span className="text-green-600">✓</span>
          {successText || 'Succès'}
        </>
      )
    }

    if (error) {
      return (
        <>
          <span className="text-red-600">✗</span>
          {errorText || 'Erreur'}
        </>
      )
    }

    return (
      <>
        {icon}
        {children}
      </>
    )
  }

  const getVariant = () => {
    if (error) return 'destructive'
    if (success) return 'default'
    return props.variant
  }

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={disabled || loading}
      variant={getVariant()}
      className={cn(
        'transition-all duration-200',
        success && 'bg-green-600 hover:bg-green-700 text-white',
        error && 'bg-red-600 hover:bg-red-700 text-white',
        className
      )}
    >
      {getButtonContent()}
    </Button>
  )
}
