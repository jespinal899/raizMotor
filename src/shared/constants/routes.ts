/** Identificadores de secciones a las que se puede enlazar dentro de una página. */
export const SECTION_IDS = {
  about: 'quienes-somos',
  howItWorks: 'como-funciona',
} as const

export const ROUTES = {
  home: '/',
  properties: '/propiedades',
  propertiesByType: '/propiedades/:tipo',
  propertyDetail: '/propiedad/:id',
  contact: '/contacto',
  login: '/iniciar-sesion',
  register: '/registro',
  forgotPassword: '/recuperar-contrasena',
  /** A donde llega quien abre el enlace de su correo para elegir otra contraseña. */
  resetPassword: '/restablecer-contrasena',
  publish: '/publicar',
  pricing: '/planes',
  agentPlans: '/planes/agente-inmobiliario',
  agentPlanCheckout: '/planes/agente-inmobiliario/contratar/:plan',
  terms: '/terminos',
  privacy: '/privacidad',
  about: `/#${SECTION_IDS.about}`,
  howItWorks: `/#${SECTION_IDS.howItWorks}`,
} as const

/** Parámetros con los que la página de contacto sabe sobre qué se consulta. */
export const CONTACT_PARAMS = {
  property: 'propiedad',
  plan: 'plan',
} as const

export const propertyTypePath = (tipo: string) => `${ROUTES.properties}/${tipo}`

export const propertyDetailPath = (id: string) => `/propiedad/${id}`

/** Abre el contacto indicando por qué propiedad se consulta. */
export const propertyContactPath = (id: string) =>
  `${ROUTES.contact}?${CONTACT_PARAMS.property}=${encodeURIComponent(id)}`

/** Abre la página para contratar un plan de agente. */
export const agentPlanCheckoutPath = (id: string) => `${ROUTES.agentPlans}/contratar/${encodeURIComponent(id)}`

/** Abre el contacto indicando qué plan interesa. */
export const planContactPath = (id: string) => `${ROUTES.contact}?${CONTACT_PARAMS.plan}=${encodeURIComponent(id)}`
