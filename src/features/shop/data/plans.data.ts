import type { Plan } from '@/features/shop/types/plan.types'
import { ROUTES, planContactPath } from '@/shared/constants/routes'

export const PLANS: Plan[] = [
  {
    id: 'particular',
    name: 'Particular',
    audience: 'Para quien vende o alquila su propiedad.',
    price: { kind: 'free' },
    features: ['Publica tu propiedad gratis', 'Contacto directo con los interesados', 'Sin comisiones ocultas'],
    action: { label: 'Publicar gratis', to: ROUTES.publish },
  },
  {
    id: 'inmobiliaria',
    name: 'Inmobiliaria',
    audience: 'Para equipos que gestionan varias propiedades.',
    price: { kind: 'monthly', from: 50 },
    features: ['Hasta 25 propiedades', 'Reportes', 'Gestión de equipo', 'Visibilidad premium'],
    action: { label: 'Solicitar este plan', to: planContactPath('inmobiliaria') },
    highlighted: true,
  },
  {
    id: 'constructora',
    name: 'Constructora',
    audience: 'Para proyectos y carteras de cientos de propiedades.',
    price: { kind: 'custom' },
    features: ['Condiciones a la medida de tu cartera', 'Acompañamiento del equipo de ventas'],
    action: { label: 'Hablar con ventas', to: planContactPath('constructora') },
  },
]
