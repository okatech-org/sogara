import { cn } from '@/lib/utils'

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg'
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
}

export function ResponsiveGrid({ 
  children, 
  className, 
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gridCols = {
    [`grid-cols-${cols.default}`]: cols.default,
    [`sm:grid-cols-${cols.sm}`]: cols.sm,
    [`md:grid-cols-${cols.md}`]: cols.md,
    [`lg:grid-cols-${cols.lg}`]: cols.lg,
    [`xl:grid-cols-${cols.xl}`]: cols.xl,
  }

  return (
    <div className={cn(
      'grid',
      gapClasses[gap],
      gridCols,
      className
    )}>
      {children}
    </div>
  )
}

interface ResponsiveCardGridProps {
  children: React.ReactNode
  className?: string
  minWidth?: string
}

export function ResponsiveCardGrid({ 
  children, 
  className,
  minWidth = '300px'
}: ResponsiveCardGridProps) {
  return (
    <div 
      className={cn('grid gap-4', className)}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`
      }}
    >
      {children}
    </div>
  )
}