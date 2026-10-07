import type { LucideIcon } from 'lucide-react'
import { PROPERTY_TYPES } from '@/features/properties/data/propertyOptions.data'
import type { PropertyType } from '@/features/properties/types/property.types'
import { ROUTES, propertyTypePath } from '@/shared/constants/routes'

export interface NavItem {
  label: string
  to: string
}

export interface PropertyCategory extends NavItem {
  description: string
  icon: LucideIcon
}

export interface FooterSection {
  title: string
  links: NavItem[]
}

export const NAV = {
  home: { label: 'Inicio', to: ROUTES.home },
  properties: { label: 'Propiedades', to: ROUTES.properties },
  contact: { label: 'Contáctenos', to: ROUTES.contact },
  login: { label: 'Iniciar sesión', to: ROUTES.login },
  publish: { label: 'Publicar', to: ROUTES.publish },
  pricing: { label: 'Planes', to: ROUTES.pricing },
  about: { label: 'Quiénes somos', to: ROUTES.about },
  howItWorks: { label: 'Cómo funciona', to: ROUTES.howItWorks },
  terms: { label: 'Términos y condiciones', to: ROUTES.terms },
  privacy: { label: 'Política de privacidad', to: ROUTES.privacy },
} satisfies Record<string, NavItem>

const CATEGORY_ORDER: PropertyType[] = ['terreno', 'casa', 'apartamento']

const CATEGORY_DESCRIPTIONS: Record<PropertyType, string> = {
  terreno: 'Lotes para construir o invertir',
  casa: 'Viviendas listas para tu familia',
  apartamento: 'En edificios y condominios',
}

export const PROPERTY_CATEGORIES: PropertyCategory[] = CATEGORY_ORDER.map((type) => ({
  label: PROPERTY_TYPES[type].plural,
  to: propertyTypePath(PROPERTY_TYPES[type].slug),
  description: CATEGORY_DESCRIPTIONS[type],
  icon: PROPERTY_TYPES[type].icon,
}))

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Propiedades',
    links: [
      { label: 'Todas las propiedades', to: ROUTES.properties },
      ...PROPERTY_CATEGORIES.map(({ label, to }) => ({ label, to })),
    ],
  },
  { title: 'Plataforma', links: [NAV.about, NAV.howItWorks, NAV.pricing, NAV.publish] },
  { title: 'Ayuda', links: [NAV.contact, NAV.login, NAV.terms, NAV.privacy] },
]
