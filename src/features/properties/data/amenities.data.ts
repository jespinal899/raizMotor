import type { PropertyType } from '@/features/properties/types/property.types'

/** Lo que comparten una casa y un apartamento. */
const HOME_AMENITIES = [
  'Terraza',
  'Cocina equipada',
  'Aire acondicionado',
  'Amueblado',
  'Cisterna',
  'Área de lavandería',
  'Cuarto de servicio',
  'Seguridad 24 horas',
  'Acepta mascotas',
]

/**
 * Comodidades que se pueden marcar al publicar, según el tipo de propiedad y en el orden en que se
 * ofrecen. El texto es el mismo que después se lee en la ficha.
 */
export const AMENITIES: Record<PropertyType, string[]> = {
  casa: ['Piscina', 'Jardín', ...HOME_AMENITIES],
  apartamento: ['Piscina', 'Ascensor', 'Área social', ...HOME_AMENITIES],
  terreno: ['Terreno plano', 'Agua potable', 'Energía eléctrica', 'Acceso vehicular', 'Cercado'],
}
