import { UserRound } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import PageHeader from '@/components/PageHeader'
import PageMessage from '@/components/PageMessage'
import Container from '@/components/layout/Container'
import ProfileForm from '@/features/auth/components/ProfileForm'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { authService } from '@/features/auth/services/authService'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

/** Los datos con que una cuenta aparece en sus anuncios, para corregirlos. */
const AccountPage = () => {
  const { user } = useAuth()
  usePageTitle('Mi cuenta')

  // La ruta exige sesión. Sin servicio de cuentas no la exige, y entonces no hay cuenta que mostrar.
  if (!user) {
    return (
      <PageMessage
        icon={UserRound}
        title="Tu cuenta aún no está disponible"
        description="Las cuentas todavía no están activas en este sitio."
      >
        <ButtonLink to={ROUTES.home}>Ir al inicio</ButtonLink>
      </PageMessage>
    )
  }

  return (
    <Container className="grid max-w-xl gap-8 py-10">
      <PageHeader
        title="Mi cuenta"
        description="Con estos datos apareces en tus anuncios, y a este teléfono te escriben por WhatsApp."
      />
      {/* Otra cuenta es otro formulario: empieza con sus propios datos. */}
      <ProfileForm key={user.email} user={user} onSubmit={(profile) => authService.updateProfile(profile)} />
    </Container>
  )
}

export default AccountPage
