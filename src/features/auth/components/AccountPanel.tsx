import { LayoutList, LogOut, ShieldCheck, UserRoundPen } from 'lucide-react'
import BusyButton from '@/components/BusyButton'
import ButtonLink from '@/components/ButtonLink'
import { useIsAdmin } from '@/features/admin/hooks/useIsAdmin'
import AccountSummary from '@/features/auth/components/AccountSummary'
import LogoutError from '@/features/auth/components/LogoutError'
import { useLogout } from '@/features/auth/hooks/useLogout'
import type { SessionUser } from '@/features/auth/types/auth.types'
import { ROUTES } from '@/shared/constants/routes'

interface AccountPanelProps {
  user: SessionUser
  /** Al ir a otra página desde el panel, p. ej. para cerrar el menú que lo contiene. */
  onNavigate?: () => void
}

/** La cuenta de quien tiene la sesión, en el menú del móvil: de quién es y cómo salir. */
const AccountPanel = ({ user, onNavigate }: AccountPanelProps) => {
  const { status, logout } = useLogout()
  const { isAdmin } = useIsAdmin(user.email)

  return (
    <>
      <AccountSummary user={user} />
      <ButtonLink to={ROUTES.myProperties} onClick={onNavigate} variant="outline" size="lg">
        <LayoutList />
        Mis publicaciones
      </ButtonLink>
      <ButtonLink to={ROUTES.account} onClick={onNavigate} variant="outline" size="lg">
        <UserRoundPen />
        Mi cuenta
      </ButtonLink>
      {isAdmin && (
        <ButtonLink to={ROUTES.admin} onClick={onNavigate} variant="outline" size="lg">
          <ShieldCheck />
          Panel de administración
        </ButtonLink>
      )}
      <BusyButton
        variant="outline"
        size="lg"
        isBusy={status === 'leaving'}
        icon={LogOut}
        busyLabel="Cerrando sesión…"
        onClick={() => void logout()}
      >
        Cerrar sesión
      </BusyButton>
      {status === 'failed' && <LogoutError />}
    </>
  )
}

export default AccountPanel
