import type { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'

interface TextDividerProps {
  children: ReactNode
}

/** Palabra entre dos líneas, como la "o" que separa dos formas de hacer lo mismo. */
const TextDivider = ({ children }: TextDividerProps) => {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {/* Las líneas son un adorno; un separador con significado partiría la palabra en tres trozos al leerla. */}
      <Separator aria-hidden="true" className="flex-1" />
      <span>{children}</span>
      <Separator aria-hidden="true" className="flex-1" />
    </div>
  )
}

export default TextDivider
