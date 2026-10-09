import type { createBrowserRouter } from 'react-router-dom'
import type { AuthLink } from '@/features/auth/utils/authLink'
import { ROUTES } from '@/shared/constants/routes'

type Router = ReturnType<typeof createBrowserRouter>

/**
 * Los enlaces del correo devuelven a la portada. A quien viene a elegir otra contraseña, o trae un enlace
 * que ya no vale, se le lleva a la página que lo atiende. La dirección conserva lo que el enlace dejó tras
 * la almohadilla: de ahí recoge Supabase la sesión.
 */
export const landFromAuthLink = async (router: Pick<Router, 'navigate'>, link: AuthLink, hash: string) => {
  if (link === 'none') return

  await router.navigate({ pathname: ROUTES.resetPassword, hash }, { replace: true })
}
