import { Building2, House, UserRound } from 'lucide-react'
import { MAX_FREE_PUBLICATIONS } from '@/features/properties/utils/publicationLimit'
import type { AgentPlan, AgentPlanId, Plan } from '@/features/shop/types/plan.types'
import { ROUTES, agentPlanCheckoutPath, planContactPath } from '@/shared/constants/routes'

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
    description: 'Para empresas con un equipo que gestiona varias propiedades.',
    action: { label: 'Publicar como inmobiliaria', to: planContactPath('inmobiliaria'), icon: Building2 },
  },
]

/** Todavía no hay pagos en línea: el botón abre la página donde el plan se pide por WhatsApp. */
const checkout = (id: AgentPlanId, label: string) => ({ label, to: agentPlanCheckoutPath(id) })

export const AGENT_PLANS: AgentPlan[] = [
  {
    id: 'agente-plan-1',
    name: 'Agente Pro',
    features: [
      { text: 'Hasta 25 propiedades activas', emphasized: 'Hasta 25 propiedades' },
      { text: '1 usuario por agente inmobiliario', emphasized: '1 usuario' },
    ],
    monthlyPrice: 599,
    action: checkout('agente-plan-1', 'Comenzar con Pro'),
  },
  {
    id: 'agente-plan-2',
    name: 'Agente Élite',
    features: [
      { text: 'Hasta 100 propiedades activas', emphasized: 'Hasta 100 propiedades' },
      { text: '2 usuarios por agente inmobiliario', emphasized: '2 usuarios' },
    ],
    monthlyPrice: 999,
    action: checkout('agente-plan-2', 'Comenzar con Élite'),
  },
]
