import { Megaphone, MessageCircle, Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface HowItWorksStep {
  icon: LucideIcon
  title: string
  description: string
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    icon: Search,
    title: 'Busca',
    description: 'Filtra por tipo de propiedad, ubicación y precio hasta dar con lo que necesitas.',
  },
  {
    icon: MessageCircle,
    title: 'Contacta directo',
    description: 'Habla con quien publica el anuncio, sin intermediarios ni comisiones ocultas.',
  },
  {
    icon: Megaphone,
    title: 'Publica',
    description: 'Particulares, inmobiliarias y constructoras anuncian con planes que se adaptan a cada caso.',
  },
]
