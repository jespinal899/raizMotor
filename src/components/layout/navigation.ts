import { Building2, House, LandPlot, type LucideIcon } from 'lucide-react'
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
  howItWorks: { label: 'Cómo funciona', to: ROUTES.howItWorks },
} satisfies Record<string, NavItem>

const CATEGORY_ORDER: PropertyType[] = ['terreno', 'casa', 'apartamento']

const CATEGORY_DETAILS: Record<PropertyType, Pick<PropertyCategory, 'description' | 'icon'>> = {
  terreno: { description: 'Lotes para construir o invertir', icon: LandPlot },
  casa: { description: 'Viviendas listas para tu familia', icon: House },
  apartamento: { description: 'En edificios y condominios', icon: Building2 },
}

export const PROPERTY_CATEGORIES: PropertyCategory[] = CATEGORY_ORDER.map((type) => ({
  label: PROPERTY_TYPES[type].plural,
  to: propertyTypePath(PROPERTY_TYPES[type].slug),
  ...CATEGORY_DETAILS[type],
}))

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Propiedades',
    links: [
      { label: 'Todas las propiedades', to: ROUTES.properties },
      ...PROPERTY_CATEGORIES.map(({ label, to }) => ({ label, to })),
    ],
  },
  { title: 'Plataforma', links: [NAV.howItWorks, NAV.pricing, NAV.publish] },
  { title: 'Ayuda', links: [NAV.contact, NAV.login] },
]
