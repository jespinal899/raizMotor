import { Megaphone, MessageCircle, Scale, Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface HowItWorksStep {
  icon: LucideIcon
  title: string
  description: string
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    icon: Megaphone,
    title: 'Publicar',
    description:
      'Anuncia tu casa, apartamento o terreno con planes que se adaptan a particulares, inmobiliarias y constructoras.',
  },
  {
    icon: Search,
    title: 'Encontrar',
    description: 'Filtra por tipo de propiedad, ubicación y precio hasta dar con lo que buscas.',
  },
  {
    icon: MessageCircle,
    title: 'Contactar',
    description: 'Habla directamente con quien publica el anuncio, sin intermediarios ni comisiones ocultas.',
  },
  {
    icon: Scale,
    title: 'Decidir',
    description: 'Compara fotos, características y precios con información clara antes de elegir.',
  },
]
