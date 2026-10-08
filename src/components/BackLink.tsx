import type { ComponentProps } from 'react'
import { ArrowLeft } from 'lucide-react'
import TextLink from '@/components/TextLink'

type BackLinkProps = Pick<ComponentProps<typeof TextLink>, 'to' | 'children'>

/** Enlace para volver al paso anterior de un recorrido, con su flecha. Va sobre el título de la página. */
const BackLink = ({ to, children }: BackLinkProps) => {
  return (
    <TextLink to={to} className="justify-self-start">
      <ArrowLeft aria-hidden="true" />
      {children}
    </TextLink>
  )
}

export default BackLink
