import { describe, expect, it } from 'vitest'
import { COUNTRY_VIEW, DEPARTMENT_ZOOM } from '@/features/properties/data/departments.data'
import { getDepartmentView, isDepartmentId } from '@/features/properties/utils/departments'

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
