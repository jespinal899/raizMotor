import type { Project } from '@/features/projects/types/project.types'

const COVER_WIDTH = 800
const GALLERY_WIDTH = 1200

/** Las mismas fotos libres que usan las propiedades de ejemplo. */
const PHOTOS = {
  modernHouse: 'photo-1600585154340-be6161a56a0c',
  poolHouse: 'photo-1512917774080-9991f1c4c750',
  villa: 'photo-1613490493576-7fde63acd811',
  kitchen: 'photo-1600607687939-ce8a6c25118c',
  brightLiving: 'photo-1522708323590-d24dbb6b0267',
  loft: 'photo-1502672260266-1c1ef2d93688',
  livingRoom: 'photo-1560448204-e02f11c3d0e2',
  field: 'photo-1500382017468-9049fed747ef',
  valley: 'photo-1500076656116-558758c991c1',
} as const

type PhotoKey = keyof typeof PHOTOS

const photoUrl = (key: PhotoKey, width: number) => `https://images.unsplash.com/${PHOTOS[key]}?w=${width}&q=80`

const photos = (...keys: [PhotoKey, ...PhotoKey[]]) => ({
  image: photoUrl(keys[0], COVER_WIDTH),
  gallery: keys.map((key) => photoUrl(key, GALLERY_WIDTH)),
})

/**
 * Proyectos de ejemplo mientras el equipo no cargue los reales. Las zonas son de Honduras, pero los proyectos y
 * las constructoras son inventados: por eso no llevan dirección, punto en el mapa ni teléfono.
 */
export const PROJECTS: Project[] = [
  {
    id: 'torre-vista-lomas',
    name: 'Torre Vista Lomas',
    developer: { name: 'Constructora de ejemplo' },
    description:
      'Torre de 14 niveles con apartamentos de 1, 2 y 3 habitaciones y vista a la ciudad. La azotea tiene piscina, gimnasio y salón social, y el edificio cuenta con seguridad las 24 horas y dos ascensores.\n\nLa reserva se hace en planos, con una prima que se paga en cuotas durante la obra.',
    kind: 'torre',
    stage: 'preventa',
    deliveryDate: '2027-12-01',
    priceFrom: 89000,
    unitsTotal: 84,
    district: 'Lomas del Guijarro',
    city: 'Tegucigalpa',
    department: 'Francisco Morazán',
    amenities: ['Piscina en la azotea', 'Gimnasio', 'Salón social', 'Seguridad 24 horas', 'Ascensores', 'Planta eléctrica'],
    ...photos('loft', 'brightLiving', 'kitchen', 'livingRoom'),
    models: [
      { name: 'Estudio', bedrooms: 1, bathrooms: 1, area: 48, priceFrom: 89000 },
      { name: 'Modelo A', bedrooms: 2, bathrooms: 2, area: 85, priceFrom: 132000 },
      { name: 'Modelo B', bedrooms: 3, bathrooms: 2, area: 118, priceFrom: 176000 },
    ],
    featured: true,
  },
  {
    id: 'residencial-los-pinos',
    name: 'Residencial Los Pinos',
    developer: { name: 'Desarrolladora de ejemplo' },
    description:
      'Residencial cerrada de 60 casas de una y dos plantas, con áreas verdes, parque infantil y caseta de vigilancia. Las primeras etapas ya están en obra y las casas modelo se pueden visitar.',
    kind: 'residencial',
    stage: 'construccion',
    deliveryDate: '2027-03-01',
    priceFrom: 74000,
    unitsTotal: 60,
    district: 'Jardines del Valle',
    city: 'San Pedro Sula',
    department: 'Cortés',
    amenities: ['Acceso controlado', 'Áreas verdes', 'Parque infantil', 'Calles pavimentadas'],
    ...photos('modernHouse', 'kitchen', 'livingRoom'),
    models: [
      { name: 'Casa Roble', bedrooms: 2, bathrooms: 1, area: 72, priceFrom: 74000 },
      { name: 'Casa Cedro', bedrooms: 3, bathrooms: 2, area: 110, priceFrom: 98000 },
    ],
    featured: true,
  },
  {
    id: 'condominio-brisas-del-mar',
    name: 'Condominio Brisas del Mar',
    developer: { name: 'Constructora de ejemplo' },
    description:
      'Condominio frente al mar con villas de dos plantas, piscina común y acceso a la playa. Las villas están terminadas y se entregan al firmar.',
    kind: 'condominio',
    stage: 'entrega_inmediata',
    priceFrom: 215000,
    unitsTotal: 18,
    district: 'Barrio El Centro',
    city: 'Tela',
    department: 'Atlántida',
    amenities: ['Acceso a la playa', 'Piscina', 'Rancho social', 'Estacionamiento techado'],
    ...photos('poolHouse', 'villa', 'brightLiving'),
    models: [{ name: 'Villa', bedrooms: 3, bathrooms: 3, area: 165, priceFrom: 215000 }],
    featured: false,
  },
  {
    id: 'lotificacion-valle-verde',
    name: 'Lotificación Valle Verde',
    developer: { name: 'Desarrolladora de ejemplo' },
    description:
      'Lotes urbanizados con agua, luz y calles de concreto, a 15 minutos del centro. Se venden en preventa mientras se termina la urbanización.',
    kind: 'lotificacion',
    stage: 'preventa',
    deliveryDate: '2026-12-01',
    priceFrom: 18000,
    unitsTotal: 120,
    district: 'Aldea Las Mesitas',
    city: 'Comayagua',
    department: 'Comayagua',
    amenities: ['Agua potable', 'Energía eléctrica', 'Calles de concreto', 'Portón de acceso'],
    ...photos('field', 'valley'),
    models: [
      { name: 'Lote estándar', area: 200, priceFrom: 18000 },
      { name: 'Lote esquinero', area: 280, priceFrom: 26000 },
    ],
    featured: false,
  },
]
