import { Compass } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import EmptyState from '@/components/EmptyState'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

const TITLE = 'No encontramos esta página'

const NotFoundPage = () => {
  usePageTitle(TITLE)

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <EmptyState
        icon={Compass}
        titleAs="h1"
        title={TITLE}
        description="Puede que el enlace esté mal escrito o que la página ya no exista."
      >
        <ButtonLink to={ROUTES.home}>Volver al inicio</ButtonLink>
        <ButtonLink to={ROUTES.properties} variant="outline">
          Ver propiedades
        </ButtonLink>
      </EmptyState>
    </div>
  )
}

export default NotFoundPage
