import { COUNTRY_VIEW, DEPARTMENTS, DEPARTMENT_ZOOM } from '@/features/properties/data/departments.data'
import type { MapView } from '@/features/properties/types/publication.types'

const findDepartment = (id: string) => DEPARTMENTS.find((department) => department.id === id)

export const isDepartmentId = (value: string): boolean => findDepartment(value) !== undefined

/** Vista del mapa para un departamento: su cabecera de cerca, o todo el país si aún no se eligió ninguno. */
export const getDepartmentView = (id: string): MapView => {
  const department = findDepartment(id)

  return department ? { center: department.capitalCoordinates, zoom: DEPARTMENT_ZOOM } : COUNTRY_VIEW
}
