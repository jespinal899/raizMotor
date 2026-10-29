import type { ChangeEvent } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import FormGroup from '@/components/FormGroup'
import { Button } from '@/components/ui/button'
import { LOGO_TYPES } from '@/features/agencies/utils/agencyFormRules'
import { initialsOf } from '@/features/agencies/utils/initials'
import PropertyPhoto from '@/features/properties/components/PropertyPhoto'

interface LogoPickerProps {
  /** El logo que se ve: su dirección, el archivo recién elegido o ninguno. */
  logo?: string | File
  /** Para las iniciales que se ven mientras no hay logo. */
  name: string
  error?: string
  onChoose: (file: File) => void
  onRemove: () => void
  disabled?: boolean
}

/** El logo de la inmobiliaria: cómo se ve y los botones para elegir otro o quitarlo. */
const LogoPicker = ({ logo, name, error, onChoose, onRemove, disabled }: LogoPickerProps) => {
  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? [])
    // Vaciar el campo permite volver a elegir el mismo archivo después de quitarlo.
    event.target.value = ''
    if (file) onChoose(file)
  }

  return (
    <FormGroup label="Logo" hint="cuadrado de preferencia; JPG, PNG o WebP" error={error}>
      {(group) => (
        <div role="group" {...group} className="flex flex-wrap items-center gap-4">
          <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl border bg-white">
            {logo ? (
              <PropertyPhoto source={logo} alt="Vista previa del logo" className="size-full object-contain p-2" />
            ) : (
              <span aria-hidden="true" className="font-heading text-2xl font-semibold text-primary">
                {initialsOf(name) || '?'}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-disabled:pointer-events-none has-disabled:opacity-50">
              <ImagePlus className="size-4" aria-hidden="true" />
              {logo ? 'Cambiar logo' : 'Elegir logo'}
              <input type="file" accept={LOGO_TYPES.join(',')} className="sr-only" onChange={handleSelect} disabled={disabled} />
            </label>
            {logo && (
              <Button type="button" variant="ghost" onClick={onRemove} disabled={disabled}>
                <Trash2 />
                Quitar
              </Button>
            )}
          </div>
        </div>
      )}
    </FormGroup>
  )
}

export default LogoPicker
