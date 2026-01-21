import * as React from 'react'
import { cn } from '@/lib/utils/cn'

const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-primary-100 text-primary-800 border-primary-200',
    secondary: 'bg-gray-100 text-gray-800 border-gray-200',
    outline: 'text-gray-800 border-gray-300',
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = 'Badge'

export { Badge }
