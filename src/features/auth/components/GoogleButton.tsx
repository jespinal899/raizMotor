import type { ReactNode } from 'react'
import BusyButton from '@/components/BusyButton'
import GoogleIcon from '@/features/auth/components/GoogleIcon'

interface GoogleButtonProps {
  isConnecting: boolean
  /** Para desactivarlo mientras la otra forma de entrar está en curso. */
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

/** Botón para entrar o registrarse con la cuenta de Google, del mismo alto que el de enviar. */
const GoogleButton = ({ isConnecting, disabled, onClick, children }: GoogleButtonProps) => {
  return (
    <BusyButton
      variant="outline"
      size="lg"
      isBusy={isConnecting}
      disabled={disabled}
      icon={GoogleIcon}
      busyLabel="Conectando con Google…"
      onClick={onClick}
      className="h-11 text-base"
    >
      {children}
    </BusyButton>
  )
}

export default GoogleButton
