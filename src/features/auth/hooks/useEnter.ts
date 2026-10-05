import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'

/**
 * Entrar es completar el acceso —con correo, con Google o creando la cuenta— y pasar al inicio.
 * Si el acceso se rechaza, no se navega y el motivo llega a quien llamó.
 */
export const useEnter = () => {
  const navigate = useNavigate()

  return async (access: () => Promise<void>) => {
    await access()
    await navigate(ROUTES.home, { replace: true })
  }
}
