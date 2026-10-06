import { COUNTRY_VIEW, DEPARTMENTS, DEPARTMENT_ZOOM } from '@/features/properties/data/departments.data'
import type { AddressQuery, MapView, PublicationFormValues } from '@/features/properties/types/publication.types'
import type { SelectOption } from '@/shared/types/common.types'

const findDepartment = (id: string) => DEPARTMENTS.find((department) => department.id === id)

export const isDepartmentId = (value: string): boolean => findDepartment(value) !== undefined

/** Nombre del departamento, o `undefined` si el identificador no corresponde a ninguno. */
export const getDepartmentName = (id: string): string | undefined => findDepartment(id)?.name

/** Vista del mapa para un departamento: su cabecera de cerca, o todo el país si aún no se eligió ninguno. */
export const getDepartmentView = (id: string): MapView => {
  const department = findDepartment(id)

  return department ? { center: department.capitalCoordinates, zoom: DEPARTMENT_ZOOM } : COUNTRY_VIEW
}

/** Ciudades que se ofrecen para un departamento: sus municipios. */
export const getCityOptions = (departmentId: string): SelectOption[] =>
  (findDepartment(departmentId)?.municipalities ?? []).map((name) => ({ value: name, label: name }))

export const isCityOf = (departmentId: string, city: string): boolean =>
  findDepartment(departmentId)?.municipalities.includes(city) ?? false

/** "Tegucigalpa (Distrito Central)" se busca en el mapa como "Tegucigalpa". */
const withoutClarification = (name: string) => name.replace(/\s*\(.*\)$/, '')

/** Convierte lo elegido en el formulario en lo que se le pregunta al buscador de direcciones. */
export const toAddressQuery = ({
  department,
  city,
  neighborhood,
}: Pick<PublicationFormValues, 'department' | 'city' | 'neighborhood'>): AddressQuery => ({
  neighborhood: neighborhood.trim(),
  city: withoutClarification(city),
  department: getDepartmentName(department) ?? '',
})

/** La dirección completa en una línea, de lo más concreto al departamento. */
export const formatAddress = ({
  address,
  neighborhood,
  city,
  department,
}: Pick<PublicationFormValues, 'department' | 'city' | 'neighborhood' | 'address'>): string =>
  [address.trim(), neighborhood.trim(), city, getDepartmentName(department)].filter(Boolean).join(', ')
