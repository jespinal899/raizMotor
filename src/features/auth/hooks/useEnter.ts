import { useNavigate, useSearchParams } from 'react-router-dom'
import type { RegistrationOutcome } from '@/features/auth/types/auth.types'
import { RETURN_PARAM, ROUTES, isInternalPath } from '@/shared/constants/routes'

/**
 * Entrar es completar el acceso —con correo, con Google o creando la cuenta— y pasar al inicio, o a la
 * página desde la que se pidió entrar, como la de publicar.
 * Si el acceso se rechaza no se navega y el motivo llega a quien llamó. Tampoco se navega si la cuenta
 * recién creada espera a que se confirme su correo: esa persona aún no está dentro.
 */
export const useEnter = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get(RETURN_PARAM) ?? ''

  return async (access: () => Promise<RegistrationOutcome | void>) => {
    const outcome = await access()
    if (outcome === 'confirmationPending') return

    await navigate(isInternalPath(returnTo) ? returnTo : ROUTES.home, { replace: true })
  }
}
