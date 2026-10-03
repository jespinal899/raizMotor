import type { VariantProps } from 'class-variance-authority'
import { Link, NavLink } from 'react-router-dom'
import type { LinkProps } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ButtonLinkProps = Omit<LinkProps, 'className'> &
  VariantProps<typeof buttonVariants> & {
    className?: string
    /** Marca el enlace con `aria-current="page"` cuando apunta a la página actual. */
    markCurrent?: boolean
  }

/**
 * Enlace con aspecto de botón. Es un `<a>` real (no un botón que navega) para que los lectores
 * de pantalla lo anuncien como enlace.
 */
const ButtonLink = ({ className, variant, size, markCurrent = false, ...props }: ButtonLinkProps) => {
  const classes = cn(buttonVariants({ variant, size }), className)

  return markCurrent ? <NavLink end className={classes} {...props} /> : <Link className={classes} {...props} />
}

export default ButtonLink
