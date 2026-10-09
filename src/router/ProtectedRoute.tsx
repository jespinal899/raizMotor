import type { ReactNode } from 'react'
import { LogIn } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import ButtonLink from '@/components/ButtonLink'
import PageLoading from '@/components/PageLoading'
import PageMessage from '@/components/PageMessage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ACCOUNTS_AVAILABLE } from '@/features/auth/services/authService'
import { ROUTES, loginPath } from '@/shared/constants/routes'

interface ProtectedRouteProps {
  /** Qué se le pide a quien llega sin sesión, p. ej. "Inicia sesión para publicar". */
  title: string
  /** Por qué esa página necesita una cuenta. */
  description: string
  children: ReactNode
}

/**
 * Página que solo ve quien tiene la sesión abierta. A los demás les pide iniciarla y, al entrar, los
 * devuelve aquí. Si la compilación no tiene servicio de cuentas no exige nada: no habría cómo iniciarla.
 */
const ProtectedRoute = ({ title, description, children }: ProtectedRouteProps) => {
  const { status } = useAuth()
  const { pathname } = useLocation()

  if (!ACCOUNTS_AVAILABLE || status === 'signedIn') return children

  // Hasta saber si hay sesión no se enseña la página ni se pide iniciarla a quien ya está dentro.
  if (status === 'loading') return <PageLoading />

  return (
    <PageMessage icon={LogIn} title={title} description={description}>
      <ButtonLink to={loginPath(pathname)}>Iniciar sesión</ButtonLink>
      <ButtonLink to={ROUTES.register} variant="outline">
        Crear una cuenta
      </ButtonLink>
    </PageMessage>
  )
}

export default ProtectedRoute
