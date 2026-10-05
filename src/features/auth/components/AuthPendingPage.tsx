import type { LucideIcon } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import PageMessage from '@/components/PageMessage'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

interface AuthPendingPageProps {
  icon: LucideIcon
  title: string
  description: string
}

/** Página de una función de cuentas que aún no existe: lo dice con claridad y ofrece por dónde seguir. */
const AuthPendingPage = ({ icon, title, description }: AuthPendingPageProps) => {
  usePageTitle(title)

  return (
    <PageMessage icon={icon} title={title} description={description}>
      <ButtonLink to={ROUTES.login}>Volver a iniciar sesión</ButtonLink>
      <ButtonLink to={ROUTES.contact} variant="outline">
        Contáctanos
      </ButtonLink>
    </PageMessage>
  )
}

export default AuthPendingPage
