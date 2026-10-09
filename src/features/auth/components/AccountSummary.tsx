import type { SessionUser } from '@/features/auth/types/auth.types'
import { fullName } from '@/features/auth/utils/accountName'
import { cn } from '@/lib/utils'

interface AccountSummaryProps {
  user: SessionUser
  className?: string
}

/** De quién es la sesión abierta: su nombre completo y su correo. */
const AccountSummary = ({ user, className }: AccountSummaryProps) => {
  const name = fullName(user)

  return (
    <div className={cn('grid min-w-0 gap-0.5', className)}>
      <span className="truncate text-sm font-medium text-foreground">{name}</span>
      {/* Una cuenta sin nombre guardado ya se presenta con su correo: no se repite. */}
      {name !== user.email && <span className="truncate text-xs text-muted-foreground">{user.email}</span>}
    </div>
  )
}

export default AccountSummary
