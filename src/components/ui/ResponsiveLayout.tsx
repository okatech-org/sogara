import { cn } from '@/lib/utils'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl'
  direction?: 'row' | 'column'
  gap?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}

const breakpointClasses = {
  sm: 'sm:',
  md: 'md:',
  lg: 'lg:',
  xl: 'xl:',
}

export function ResponsiveLayout({
  children,
  className,
  breakpoint = 'md',
  direction = 'row',
  gap = 'md',
  align = 'start',
  justify = 'start',
}: ResponsiveLayoutProps) {
  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col'
  const responsiveDirectionClass = breakpoint 
    ? `${breakpointClasses[breakpoint]}flex-${direction === 'row' ? 'row' : 'col'}`
    : ''

  return (
    <div
      className={cn(
        'flex',
        directionClass,
        responsiveDirectionClass,
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  )
}

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
}

const paddingClasses = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'full',
  padding = 'md',
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
