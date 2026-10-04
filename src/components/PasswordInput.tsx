import { useState } from 'react'
import type { ComponentProps } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCapsLock } from '@/hooks/useCapsLock'
import { cn } from '@/lib/utils'

/** Las teclas y la pérdida de foco quedan reservadas para el aviso de Bloq Mayús. */
type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type' | 'onKeyDown' | 'onKeyUp' | 'onBlur'>

/** Campo de contraseña con botón para verla y aviso de Bloq Mayús. */
const PasswordInput = ({ className, ...props }: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const { isCapsLockOn, capsLockHandlers } = useCapsLock()
  const ToggleIcon = isVisible ? EyeOff : Eye

  return (
    <div className="grid gap-2">
      <div className="relative">
        <Input
          {...props}
          {...capsLockHandlers}
          type={isVisible ? 'text' : 'password'}
          className={cn('pr-11', className)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => setIsVisible((current) => !current)}
          className="absolute inset-y-0 right-1.5 my-auto text-muted-foreground"
        >
          <ToggleIcon />
        </Button>
      </div>
      {isCapsLockOn && (
        <p role="status" className="text-sm text-muted-foreground">
          Bloq Mayús está activado.
        </p>
      )}
    </div>
  )
}

export default PasswordInput
