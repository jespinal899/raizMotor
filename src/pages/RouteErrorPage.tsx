import { useEffect, useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { useRouteError } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import ButtonLink from '@/components/ButtonLink'
import PageLoading from '@/components/PageLoading'
import PageMessage from '@/components/PageMessage'
import { usePageTitle } from '@/hooks/usePageTitle'
import { isOutdatedVersionError, reloadOnce } from '@/router/outdatedVersion'
import { ROUTES } from '@/shared/constants/routes'

const TITLE = 'Algo salió mal'

/**
 * Lo que ve quien encuentra un fallo al abrir una página, en lugar de la pantalla del enrutador, en inglés. Si el
 * fallo es que el sitio se actualizó mientras lo tenía abierto, recarga la página una vez y llega a la versión nueva.
 */
const RouteErrorPage = () => {
  const error = useRouteError()
  const [reloading] = useState(() => isOutdatedVersionError(error) && reloadOnce())
  usePageTitle(TITLE)

  useEffect(() => {
    if (!reloading) console.error(error)
  }, [error, reloading])

  if (reloading) return <PageLoading />

  return (
    <PageMessage
      icon={TriangleAlert}
      title={TITLE}
      description="No pudimos mostrar esta página. Vuelve a intentarlo en unos segundos; si sigue fallando, contáctanos."
    >
      <Button onClick={() => window.location.reload()}>Volver a intentar</Button>
      <ButtonLink to={ROUTES.home} variant="outline">
        Volver al inicio
      </ButtonLink>
    </PageMessage>
  )
}

export default RouteErrorPage
