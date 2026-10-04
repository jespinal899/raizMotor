import { describe, expect, it } from 'vitest'
import { COUNTRY_VIEW, DEPARTMENT_ZOOM } from '@/features/properties/data/departments.data'
import {
  formatAddress,
  getCityOptions,
  getDepartmentView,
  isCityOf,
  isDepartmentId,
  toAddressQuery,
} from '@/features/properties/utils/departments'

describe('isDepartmentId', () => {
  it('reconoce el identificador de un departamento', () => {
    // Arrange
    const id = 'cortes'

    // Act
    const result = isDepartmentId(id)

    // Assert
    expect(result).toBe(true)
  })

  it.each(['', 'lima', 'constructor', 'Cortés'])('rechaza %j, que no es un identificador', (value) => {
    // Arrange: valor que no corresponde a ningún departamento

    // Act
    const result = isDepartmentId(value)

    // Assert
    expect(result).toBe(false)
  })
})

describe('getDepartmentView', () => {
  it('acerca el mapa a la cabecera del departamento elegido', () => {
    // Arrange
    const id = 'cortes'

    // Act
    const view = getDepartmentView(id)

    // Assert
    expect(view.zoom).toBe(DEPARTMENT_ZOOM)
    expect(view.center.lat).toBeCloseTo(15.5, 1)
    expect(view.center.lng).toBeCloseTo(-88.0, 1)
  })

  it.each(['', 'lima'])('muestra todo el país cuando no hay departamento válido (%j)', (id) => {
    // Arrange: aún no se eligió departamento, o el valor no existe

    // Act
    const view = getDepartmentView(id)

    // Assert
    expect(view).toEqual(COUNTRY_VIEW)
  })
})

describe('getCityOptions', () => {
  it('ofrece los municipios del departamento elegido', () => {
    // Arrange
    const id = 'cortes'

    // Act
    const options = getCityOptions(id)

    // Assert
    expect(options).toHaveLength(12)
    expect(options).toContainEqual({ value: 'San Pedro Sula', label: 'San Pedro Sula' })
  })

  it.each(['', 'lima'])('no ofrece ninguna ciudad sin un departamento válido (%j)', (id) => {
    // Arrange: aún no se eligió departamento, o el valor no existe

    // Act
    const options = getCityOptions(id)

    // Assert
    expect(options).toEqual([])
  })
})

describe('isCityOf', () => {
  it('reconoce una ciudad del departamento', () => {
    // Arrange
    const city = 'Choloma'

    // Act
    const result = isCityOf('cortes', city)

    // Assert
    expect(result).toBe(true)
  })

  it.each([
    { department: 'cortes', city: 'La Ceiba', why: 'es de otro departamento' },
    { department: 'cortes', city: '', why: 'aún no se eligió' },
    { department: '', city: 'Choloma', why: 'falta el departamento' },
  ])('rechaza la ciudad "$city" porque $why', ({ department, city }) => {
    // Arrange: combinación que no corresponde

    // Act
    const result = isCityOf(department, city)

    // Assert
    expect(result).toBe(false)
  })
})

describe('toAddressQuery', () => {
  it('prepara la búsqueda con los nombres tal como los conoce un mapa', () => {
    // Arrange
    const location = {
      department: 'francisco-morazan',
      city: 'Tegucigalpa (Distrito Central)',
      neighborhood: '  Colonia Palmira ',
    }

    // Act
    const query = toAddressQuery(location)

    // Assert
    expect(query).toEqual({ neighborhood: 'Colonia Palmira', city: 'Tegucigalpa', department: 'Francisco Morazán' })
  })
})

describe('formatAddress', () => {
  it('escribe la dirección completa, de lo más concreto al departamento', () => {
    // Arrange
    const location = {
      address: ' Avenida República de Chile, casa 12 ',
      neighborhood: 'Colonia Palmira',
      city: 'Tegucigalpa (Distrito Central)',
      department: 'francisco-morazan',
    }

    // Act
    const text = formatAddress(location)

    // Assert
    expect(text).toBe(
      'Avenida República de Chile, casa 12, Colonia Palmira, Tegucigalpa (Distrito Central), Francisco Morazán',
    )
  })
})
