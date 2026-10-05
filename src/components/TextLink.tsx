import type { ComponentProps } from 'react'
import ButtonLink from '@/components/ButtonLink'
import { cn } from '@/lib/utils'

type TextLinkProps = Omit<ComponentProps<typeof ButtonLink>, 'variant' | 'size'>

/** Enlace que va dentro de una frase o junto a un campo: con aspecto de texto, sin el alto ni el relleno de un botón. */
const TextLink = ({ className, ...props }: TextLinkProps) => {
  return <ButtonLink variant="link" className={cn('h-auto p-0', className)} {...props} />
}

export default TextLink
