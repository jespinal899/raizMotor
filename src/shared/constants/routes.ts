export const ROUTES = {
  home: '/',
  properties: '/propiedades',
  propertiesByType: '/propiedades/:tipo',
  contact: '/contacto',
  login: '/iniciar-sesion',
  publish: '/publicar',
  pricing: '/planes',
  stories: '/#historias',
} as const

export const propertyTypePath = (tipo: string) => `${ROUTES.properties}/${tipo}`
