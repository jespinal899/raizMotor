import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface NavLabelProps {
  children: ReactNode
  active?: boolean
}

// El enlace o botón padre debe llevar la clase `group/nav` para activar la línea.
const NavLabel = ({ children, active = false }: NavLabelProps) => {
  return (
    <span
      data-slot="nav-label"
      className={cn(
        'relative after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary-light after:transition-transform after:duration-300 after:ease-out',
        'group-hover/nav:after:scale-x-100 group-aria-[current=page]/nav:after:scale-x-100 group-data-popup-open/nav:after:scale-x-100',
        active && 'after:scale-x-100',
      )}
    >
      {children}
    </span>
  )
}

export default NavLabel
