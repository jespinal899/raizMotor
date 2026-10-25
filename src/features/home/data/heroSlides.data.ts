import type { HeroSlide } from '@/features/home/types/hero.types'
import { BRAND } from '@/shared/constants/brand'
import { ROUTES } from '@/shared/constants/routes'

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'bienes-raices',
    badge: '🏡 BIENES RAÍCES',
    title: 'Encuentra tu hogar ideal',
    description:
      'Casas, departamentos y terrenos en las mejores zonas del país. Publica gratis y contacta directo.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600',
    primaryAction: { label: 'Explorar propiedades', to: ROUTES.properties },
    secondaryAction: { label: 'Publicar gratis', to: ROUTES.pricing },
  },
  {
    id: 'confianza',
    badge: '💙 CONFIANZA',
    title: 'Tu próximo capítulo empieza aquí',
    description: `Propietarios, agentes e inmobiliarias de todo el país publican en ${BRAND.name}. Contacto directo con quien anuncia y cero comisiones ocultas.`,
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600',
    primaryAction: { label: 'Cómo funciona', to: ROUTES.howItWorks },
    secondaryAction: { label: 'Escríbenos', to: ROUTES.contact },
  },
  {
    id: 'inmobiliarias',
    badge: '🏢 PARA PROFESIONALES',
    title: 'Planes para agentes e inmobiliarias',
    description: `Conoce los planes de ${BRAND.name} para publicar tu cartera de propiedades como agente inmobiliario o como inmobiliaria.`,
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1600',
    primaryAction: { label: 'Ver planes', to: ROUTES.pricing },
    secondaryAction: { label: 'Quiero saber más', to: ROUTES.contact },
  },
]
