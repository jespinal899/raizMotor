import { Link2Off } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import PageLoading from '@/components/PageLoading'
import PageMessage from '@/components/PageMessage'
import AuthCard from '@/features/auth/components/AuthCard'
import NewPasswordForm from '@/features/auth/components/NewPasswordForm'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { authService } from '@/features/auth/services/authService'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

/**
 * A donde llega quien abre el enlace de su correo para elegir otra contraseña. Solo esa persona ve el
 * formulario: llegó desde el enlace y el enlace le dejó una sesión abierta. A cualquier otra, o si el enlace
 * caducó o ya se usó, se le dice que ya no vale y cómo pedir otro.
 */
const ResetPasswordPage = () => {
  const { status } = useAuth()
  const arrivedFromLink = authService.isRecoveringPassword()

  usePageTitle('Elegir otra contraseña')

  // Hasta que el servicio dice si el enlace dejó una sesión, no se afirma que no valga.
  if (arrivedFromLink && status === 'loading') return <PageLoading />

  if (!arrivedFromLink || status === 'signedOut') {
    return (
      <PageMessage
        icon={Link2Off}
        title="El enlace ya no es válido"
        description="Pudo caducar o ya se usó. Pide otro para elegir tu contraseña."
      >
        <ButtonLink to={ROUTES.forgotPassword}>Pedir otro enlace</ButtonLink>
        <ButtonLink to={ROUTES.login} variant="outline">
          Iniciar sesión
        </ButtonLink>
      </PageMessage>
    )
  }

  return (
    <AuthCard title="Elige otra contraseña" description="Desde ahora entrarás con ella.">
      <NewPasswordForm onSubmit={(password, operationKey) => authService.changePassword(password, operationKey)} />
    </AuthCard>
  )
}

export default ResetPasswordPage
