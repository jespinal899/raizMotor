import { adminService } from '@/features/admin/services/adminService'
import type { AdminService } from '@/features/admin/types/admin.types'
import { useAsyncData } from '@/hooks/useAsyncData'

/**
 * Si la cuenta con la sesión abierta es del equipo. Recibe el correo de esa cuenta, o `null` sin sesión, y
 * vuelve a preguntar al cambiar. Mostrar o no el panel es solo comodidad: quien decide lo que se puede hacer
 * es la base de datos.
 */
export const useIsAdmin = (signedInAs: string | null, service: AdminService = adminService) => {
  const { data, isLoading, error } = useAsyncData(
    () => (signedInAs === null ? Promise.resolve(false) : service.isAdmin()),
    `is-admin:${signedInAs ?? ''}`,
  )

  return { isAdmin: data === true, isLoading, error }
}
