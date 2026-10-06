import type { ComponentProps } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ExternalButtonLinkProps = Omit<ComponentProps<'a'>, 'target' | 'rel'> & VariantProps<typeof buttonVariants>

/**
 * Enlace con aspecto de botón a otro sitio, como WhatsApp o Google Maps. Se abre en otra pestaña y sin
 * dar a esa página acceso a esta.
 */
const ExternalButtonLink = ({ className, variant, size, children, ...props }: ExternalButtonLinkProps) => {
  return (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {children}
    </a>
  )
}

export default ExternalButtonLink
