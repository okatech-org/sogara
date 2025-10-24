import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MemoizedCardProps {
  title?: string
  children: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  onClick?: () => void
}

export const MemoizedCard = memo<MemoizedCardProps>(({
  title,
  children,
  className,
  headerClassName,
  contentClassName,
  onClick
}) => {
  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      {title && (
        <CardHeader className={headerClassName}>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  )
})

MemoizedCard.displayName = 'MemoizedCard'
