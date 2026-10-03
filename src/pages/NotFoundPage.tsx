import { Compass } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import PageMessage from '@/components/PageMessage'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

const TITLE = 'No encontramos esta página'

const NotFoundPage = () => {
  usePageTitle(TITLE)

  return (
    <PageMessage
      icon={Compass}
      title={TITLE}
      description="Puede que el enlace esté mal escrito o que la página ya no exista."
    >
      <ButtonLink to={ROUTES.home}>Volver al inicio</ButtonLink>
      <ButtonLink to={ROUTES.properties} variant="outline">
        Ver propiedades
      </ButtonLink>
    </PageMessage>
  )
}

export default NotFoundPage
