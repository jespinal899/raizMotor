import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article'
}

/** Ancho máximo y márgenes laterales comunes a todas las páginas, definidos en un solo lugar. */
const Container = ({ as: Tag = 'div', className, ...props }: ContainerProps) => {
  return <Tag className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)} {...props} />
}

export default Container
