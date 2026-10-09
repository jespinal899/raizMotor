import { cn } from '@/lib/utils'

interface LogoutErrorProps {
  className?: string
}

/** Sin este aviso, quien pulsó «Cerrar sesión» y no pudo salir creería que su sesión quedó cerrada. */
const LogoutError = ({ className }: LogoutErrorProps) => {
  return (
    <p role="alert" className={cn('text-xs text-destructive', className)}>
      No pudimos cerrar tu sesión. Inténtalo de nuevo.
    </p>
  )
}

export default LogoutError
