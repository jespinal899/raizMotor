import { Building2, House, UserRound } from 'lucide-react'
import { MAX_FREE_PUBLICATIONS } from '@/features/properties/utils/publicationLimit'
import type { AgentPlan, AgentPlanId, Plan } from '@/features/shop/types/plan.types'
import { ROUTES, planContactPath } from '@/shared/constants/routes'

/** A quién van dirigidos los planes de pago para agentes; también los identifica al consultar por uno. */
export const AGENT_AUDIENCE = 'Agente inmobiliario'

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
    name: AGENT_AUDIENCE,
    description:
      'Impulsa tu carrera. Publica tu cartera de propiedades y accede a un panel exclusivo para administrar, ' +
      'dar seguimiento y ver reportes de tus anuncios. La herramienta definitiva para cerrar más ventas.',
    action: { label: 'Publicar como inmobiliario', to: ROUTES.agentPlans, icon: UserRound },
  },
  {
    id: 'inmobiliaria',
    name: 'Inmobiliarias',
    description: 'Para empresas con un equipo que gestiona varias propiedades.',
    action: { label: 'Publicar como inmobiliaria', to: planContactPath('inmobiliaria'), icon: Building2 },
  },
]

/** Todavía no hay pagos en línea: contratar abre el contacto indicando de qué plan se trata. */
const contract = (id: AgentPlanId, label: string) => ({ label, to: planContactPath(id) })

export const AGENT_PLANS: AgentPlan[] = [
  {
    id: 'agente-plan-1',
    name: 'Agente Pro',
    description: 'Ideal para agentes independientes que están construyendo su cartera.',
    features: [
      { text: 'Hasta 25 propiedades activas', emphasized: 'Hasta 25 propiedades' },
      { text: '1 usuario por agente inmobiliario', emphasized: '1 usuario' },
      { text: 'Panel de administración de cartera' },
      { text: 'Reportes básicos de visitas' },
    ],
    monthlyPrice: 599,
    action: contract('agente-plan-1', 'Comenzar con Pro'),
  },
  {
    id: 'agente-plan-2',
    name: 'Agente Élite',
    description: 'Para agentes de alto rendimiento que manejan un gran volumen de propiedades.',
    features: [
      { text: 'Hasta 100 propiedades activas', emphasized: 'Hasta 100 propiedades' },
      { text: '2 usuarios por agente inmobiliario', emphasized: '2 usuarios' },
      { text: 'Panel avanzado y reportes detallados' },
    ],
    monthlyPrice: 999,
    action: contract('agente-plan-2', 'Comenzar con Élite'),
  },
]
