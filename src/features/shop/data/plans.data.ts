import { MAX_IMAGES } from '@/features/properties/utils/imageFiles'
import { MAX_FREE_PUBLICATIONS } from '@/features/properties/utils/publicationLimit'
import type { Plan, PlanId } from '@/features/shop/types/plan.types'
import { ROUTES, planContactPath } from '@/shared/constants/routes'

/** Mientras un plan no tiene precio ni contenido, su botón lleva al contacto diciendo de qué plan se trata. */
const askAbout = (id: PlanId) => ({ label: 'Quiero saber más', to: planContactPath(id) })

export const PLANS: Plan[] = [
  {
    id: 'propietario',
    name: 'Propietario',
    audience: 'Para quien vende o alquila su propia propiedad.',
    price: { kind: 'free' },
    // Los límites se leen de donde se aplican: la tarjeta no puede prometer otra cosa que el formulario.
    features: [`${MAX_FREE_PUBLICATIONS} publicación gratis`, `Hasta ${MAX_IMAGES} fotos por publicación`],
    action: { label: 'Publicar gratis', to: ROUTES.publish },
    highlighted: true,
  },
  {
    id: 'agente',
    name: 'Agente inmobiliario',
    audience: 'Para agentes independientes que anuncian propiedades de sus clientes.',
    price: { kind: 'upcoming' },
    features: [],
    action: askAbout('agente'),
  },
  {
    id: 'inmobiliaria',
    name: 'Inmobiliarias',
    audience: 'Para empresas con un equipo que gestiona varias propiedades.',
    price: { kind: 'upcoming' },
    features: [],
    action: askAbout('inmobiliaria'),
  },
]
