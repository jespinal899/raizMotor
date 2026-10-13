import { Building2, House, UserRound } from 'lucide-react'
import { MAX_FREE_PUBLICATIONS } from '@/features/properties/utils/publicationLimit'
import type { AgencyPlanId, AgentPlanFeature, AgentPlanId, PaidPlan, Plan } from '@/features/shop/types/plan.types'
import { ROUTES, agencyPlanCheckoutPath, agentPlanCheckoutPath } from '@/shared/constants/routes'

export const PLANS: Plan[] = [
  {
    id: 'propietario',
    name: 'Propietario',
    // La cantidad se lee de donde se aplica: la tarjeta no puede prometer otra que el formulario.
    description:
      `Vende o arrienda rápido. Publica ${MAX_FREE_PUBLICATIONS} propiedad gratis y aprovecha nuestra alta ` +
      'visualización para llegar a miles de interesados sin comisiones.',
    action: { label: 'Publicar como propietario', to: ROUTES.publish, icon: House },
  },
  {
    id: 'agente',
    name: 'Agente inmobiliario',
    description:
      'Impulsa tu carrera. Publica tu cartera de propiedades y accede a un panel exclusivo para administrar, ' +
      'dar seguimiento y ver reportes de tus anuncios. La herramienta definitiva para cerrar más ventas.',
    action: { label: 'Publicar como inmobiliario', to: ROUTES.agentPlans, icon: UserRound },
  },
  {
    id: 'inmobiliaria',
    name: 'Inmobiliarias',
    description:
      'Para desarrolladoras y empresas con varias propiedades. Publica tus proyectos en preventa o en construcción, ' +
      'con sus modelos y renders, junto a tu cartera de propiedades.',
    action: { label: 'Publicar como inmobiliaria', to: ROUTES.agencyPlans, icon: Building2 },
  },
]

/** Todavía no hay pagos en línea: el botón abre la página donde el plan se pide por WhatsApp. */
const checkout = (id: AgentPlanId, label: string) => ({ label, to: agentPlanCheckoutPath(id) })
const agencyCheckout = (id: AgencyPlanId, label: string) => ({ label, to: agencyPlanCheckoutPath(id) })

const PRO_PUBLICATIONS = 25
const ELITE_PUBLICATIONS = 100

/** La cantidad se escribe una sola vez: la tarjeta no puede prometer otra que la que el plan da a la cuenta. */
const activeProperties = (count: number): AgentPlanFeature => ({
  text: `Hasta ${count} propiedades activas`,
  emphasized: `Hasta ${count} propiedades`,
})

export const AGENT_PLANS: PaidPlan[] = [
  {
    id: 'agente-plan-1',
    name: 'Agente Pro',
    maxPublications: PRO_PUBLICATIONS,
    maxProjects: 0,
    features: [
      activeProperties(PRO_PUBLICATIONS),
      { text: '1 usuario por agente inmobiliario', emphasized: '1 usuario' },
    ],
    monthlyPrice: 599,
    action: checkout('agente-plan-1', 'Comenzar con Pro'),
  },
  {
    id: 'agente-plan-2',
    name: 'Agente Élite',
    maxPublications: ELITE_PUBLICATIONS,
    maxProjects: 0,
    features: [
      activeProperties(ELITE_PUBLICATIONS),
      { text: '2 usuarios por agente inmobiliario', emphasized: '2 usuarios' },
    ],
    monthlyPrice: 999,
    action: checkout('agente-plan-2', 'Comenzar con Élite'),
  },
]

/** Los proyectos y las propiedades que admite un plan de inmobiliaria, escritos una sola vez. */
const agencyFeatures = (projects: number, publications: number): AgentPlanFeature[] => [
  {
    text: projects === 1 ? '1 proyecto activo' : `Hasta ${projects} proyectos activos`,
    emphasized: projects === 1 ? '1 proyecto' : `Hasta ${projects} proyectos`,
  },
  activeProperties(publications),
  { text: 'Proyectos y propiedades destacados en la portada, por turnos', emphasized: 'destacados en la portada' },
]

export const AGENCY_PLANS: PaidPlan[] = [
  {
    id: 'inmobiliaria-inicial',
    name: 'Inmobiliaria Inicial',
    maxPublications: 50,
    maxProjects: 1,
    features: agencyFeatures(1, 50),
    monthlyPrice: 1999,
    action: agencyCheckout('inmobiliaria-inicial', 'Comenzar con Inicial'),
  },
  {
    id: 'inmobiliaria-plus',
    name: 'Inmobiliaria Plus',
    maxPublications: 150,
    maxProjects: 3,
    features: agencyFeatures(3, 150),
    monthlyPrice: 3999,
    action: agencyCheckout('inmobiliaria-plus', 'Comenzar con Plus'),
  },
  {
    id: 'inmobiliaria-corporativa',
    name: 'Inmobiliaria Corporativa',
    maxPublications: 500,
    maxProjects: 10,
    features: agencyFeatures(10, 500),
    monthlyPrice: 6999,
    action: agencyCheckout('inmobiliaria-corporativa', 'Comenzar con Corporativa'),
  },
]

/** Todos los planes de pago, para buscar uno por su identificador o por los límites que da a la cuenta. */
export const PAID_PLANS: PaidPlan[] = [...AGENT_PLANS, ...AGENCY_PLANS]
