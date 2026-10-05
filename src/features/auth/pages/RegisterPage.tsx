import { UserPlus } from 'lucide-react'
import AuthPendingPage from '@/features/auth/components/AuthPendingPage'
import { BRAND } from '@/shared/constants/brand'

const RegisterPage = () => {
  return (
    <AuthPendingPage
      icon={UserPlus}
      title="Crear una cuenta"
      description={`El registro aún no está disponible: estamos preparando las cuentas de ${BRAND.name}. Mientras tanto, contáctanos y te ayudamos a publicar tu propiedad.`}
    />
  )
}

export default RegisterPage
