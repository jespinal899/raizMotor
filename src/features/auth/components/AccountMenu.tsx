import { ChevronDown, CircleUserRound, LayoutList, LoaderCircle, LogOut, UserRoundPen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import AccountSummary from '@/features/auth/components/AccountSummary'
import LogoutError from '@/features/auth/components/LogoutError'
import { useLogout } from '@/features/auth/hooks/useLogout'
import type { SessionUser } from '@/features/auth/types/auth.types'
import { shortName } from '@/features/auth/utils/accountName'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/shared/constants/routes'

interface AccountMenuProps {
  user: SessionUser
  className?: string
}

/** La cuenta de quien tiene la sesión, en la barra de navegación: su nombre y, al abrirlo, cómo salir. */
const AccountMenu = ({ user, className }: AccountMenuProps) => {
  const { status, logout } = useLogout()
  const isLeaving = status === 'leaving'
  const name = shortName(user)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="lg"
            aria-label={`Cuenta de ${name}`}
            className={cn('max-w-48 px-3.5', className)}
          />
        }
      >
        <CircleUserRound />
        <span className="truncate">{name}</span>
        <ChevronDown className="text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <AccountSummary user={user} className="px-1.5 py-1.5" />
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to={ROUTES.myProperties} />}>
          <LayoutList />
          Mis anuncios
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to={ROUTES.account} />}>
          <UserRoundPen />
          Mi cuenta
        </DropdownMenuItem>
        {/* No se cierra al pulsarlo: si la sesión no pudo cerrarse, el aviso tiene que verse aquí mismo. */}
        <DropdownMenuItem closeOnClick={false} disabled={isLeaving} onClick={() => void logout()}>
          {isLeaving ? <LoaderCircle className="animate-spin" /> : <LogOut />}
          {isLeaving ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </DropdownMenuItem>
        {status === 'failed' && <LogoutError className="px-1.5 py-1" />}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AccountMenu
