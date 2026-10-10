import { CircleAlert, ShieldX } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import PageHeader from '@/components/PageHeader'
import PageLoading from '@/components/PageLoading'
import PageMessage from '@/components/PageMessage'
import Container from '@/components/layout/Container'
import AdminDashboard from '@/features/admin/components/AdminDashboard'
import { useIsAdmin } from '@/features/admin/hooks/useIsAdmin'
import { adminService } from '@/features/admin/services/adminService'
import type { AdminService } from '@/features/admin/types/admin.types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

interface AdminDashboardPageProps {
  service?: AdminService
}

/**
 * El panel del equipo: reportes, anuncios y cuentas. Solo se muestra a las cuentas del equipo; aun así, cada
 * lectura y cada decisión las vuelve a comprobar la base de datos.
 */
const AdminDashboardPage = ({ service = adminService }: AdminDashboardPageProps) => {
  usePageTitle('Panel de administración')
  const auth = useAuth()
  const { isAdmin, isLoading, error } = useIsAdmin(auth.user?.email ?? null, service)

  if (auth.status === 'loading' || isLoading) return <PageLoading />

  if (error) {
    return (
      <PageMessage
        icon={CircleAlert}
        title="No pudimos comprobar tus permisos"
        description="Revisa tu conexión y vuelve a intentarlo en unos minutos."
      >
        <ButtonLink to={ROUTES.home}>Ir al inicio</ButtonLink>
      </PageMessage>
    )
  }

  if (!isAdmin) {
    return (
      <PageMessage
        icon={ShieldX}
        title="No tienes acceso a esta página"
        description="El panel de administración es solo para el equipo del sitio."
      >
        <ButtonLink to={ROUTES.home}>Ir al inicio</ButtonLink>
      </PageMessage>
    )
  }

  return (
    <Container className="grid gap-8 py-10">
      <PageHeader
        title="Panel de administración"
        description="Revisa los reportes, oculta los anuncios que no cumplen las normas y ajusta el límite de anuncios de cada cuenta. Cada decisión queda registrada."
      />
      <AdminDashboard service={service} />
    </Container>
  )
}

export default AdminDashboardPage
