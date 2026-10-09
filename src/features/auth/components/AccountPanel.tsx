import { LogOut } from 'lucide-react'
import BusyButton from '@/components/BusyButton'
import AccountSummary from '@/features/auth/components/AccountSummary'
import LogoutError from '@/features/auth/components/LogoutError'
import { useLogout } from '@/features/auth/hooks/useLogout'
import type { SessionUser } from '@/features/auth/types/auth.types'

interface AccountPanelProps {
  user: SessionUser
}

/** La cuenta de quien tiene la sesión, en el menú del móvil: de quién es y cómo salir. */
const AccountPanel = ({ user }: AccountPanelProps) => {
  const { status, logout } = useLogout()

  return (
    <>
      <AccountSummary user={user} />
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
