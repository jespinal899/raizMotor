import type { HeroSlide } from '@/features/home/types/hero.types'
import { BRAND } from '@/shared/constants/brand'
import { ROUTES } from '@/shared/constants/routes'

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'bienes-raices',
    badge: '🏡 BIENES RAÍCES',
    title: 'Encuentra tu hogar ideal',
    description:
      'Casas, departamentos y terrenos verificados en las mejores zonas del país. Publica gratis y contacta directo.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600',
    primaryAction: { label: 'Explorar propiedades', to: ROUTES.properties },
    secondaryAction: { label: 'Publicar gratis', to: ROUTES.publish },
  },
  {
    id: 'confianza',
    badge: '💙 CONFIANZA',
    title: 'Tu próximo capítulo empieza aquí',
    description: `Miles de familias ya encontraron su hogar con ${BRAND.name}. Propiedades verificadas, vendedores reales, cero comisiones ocultas.`,
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600',
    primaryAction: { label: 'Cómo funciona', to: ROUTES.howItWorks },
    secondaryAction: { label: 'Agendar asesoría', to: ROUTES.contact },
  },
  {
    id: 'inmobiliarias',
    badge: '🏢 PARA PROFESIONALES',
    title: 'Planes para agentes e inmobiliarias',
    description: `Estamos preparando los planes de ${BRAND.name} para agentes inmobiliarios e inmobiliarias. Escríbenos y te avisamos cuando estén listos.`,
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1600',
    primaryAction: { label: 'Ver planes', to: ROUTES.pricing },
    secondaryAction: { label: 'Quiero saber más', to: ROUTES.contact },
  },
]
