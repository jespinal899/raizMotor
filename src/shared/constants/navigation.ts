import { Building2, House, LandPlot, type LucideIcon } from 'lucide-react'
import { ROUTES, propertyTypePath } from './routes'

export interface NavItem {
  label: string
  to: string
}

export interface PropertyCategory extends NavItem {
  description: string
  icon: LucideIcon
}

export const NAV = {
  home: { label: 'Inicio', to: ROUTES.home },
  properties: { label: 'Propiedades', to: ROUTES.properties },
  contact: { label: 'Contáctenos', to: ROUTES.contact },
  login: { label: 'Iniciar sesión', to: ROUTES.login },
  publish: { label: 'Publicar', to: ROUTES.publish },
} satisfies Record<string, NavItem>

export const PROPERTY_CATEGORIES: PropertyCategory[] = [
  {
    label: 'Terrenos',
    description: 'Lotes para construir o invertir',
    to: propertyTypePath('terrenos'),
    icon: LandPlot,
  },
  {
    label: 'Casas',
    description: 'Viviendas listas para tu familia',
    to: propertyTypePath('casas'),
    icon: House,
  },
  {
    label: 'Apartamentos',
    description: 'En edificios y condominios',
    to: propertyTypePath('apartamentos'),
    icon: Building2,
  },
]
