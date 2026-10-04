import { describe, expect, it } from 'vitest'
import { COUNTRY_VIEW, DEPARTMENTS, DEPARTMENT_OPTIONS } from '@/features/properties/data/departments.data'
import type { Coordinates } from '@/features/properties/types/publication.types'

const HONDURAS_BOUNDS = { south: 12.9, north: 16.6, west: -89.4, east: -83.1 }

const isInHonduras = ({ lat, lng }: Coordinates) =>
  lat >= HONDURAS_BOUNDS.south && lat <= HONDURAS_BOUNDS.north && lng >= HONDURAS_BOUNDS.west && lng <= HONDURAS_BOUNDS.east

describe('DEPARTMENTS', () => {
  it('incluye los 18 departamentos de Honduras, sin repetir identificadores', () => {
    // Arrange
    const expectedCount = 18

    // Act
    const ids = new Set(DEPARTMENTS.map(({ id }) => id))

    // Assert
    expect(DEPARTMENTS).toHaveLength(expectedCount)
    expect(ids.size).toBe(expectedCount)
  })

  it('están en orden alfabético, como se muestran en el desplegable', () => {
    // Arrange
    const names = DEPARTMENTS.map(({ name }) => name)

    // Act
    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'es'))

    // Assert
    expect(names).toEqual(sorted)
  })

  it('la cabecera de cada departamento queda dentro del territorio de Honduras', () => {
    // Arrange
    const outside = ({ capitalCoordinates }: (typeof DEPARTMENTS)[number]) => !isInHonduras(capitalCoordinates)

    // Act
    const misplaced = DEPARTMENTS.filter(outside).map(({ name }) => name)

    // Assert
    expect(misplaced).toEqual([])
  })
})

describe('DEPARTMENT_OPTIONS', () => {
  it('ofrece cada departamento con su nombre', () => {
    // Arrange
    const expected = { value: 'francisco-morazan', label: 'Francisco Morazán' }

    // Act
    const option = DEPARTMENT_OPTIONS.find(({ value }) => value === expected.value)

    // Assert
    expect(DEPARTMENT_OPTIONS).toHaveLength(DEPARTMENTS.length)
    expect(option).toEqual(expected)
  })
})

describe('COUNTRY_VIEW', () => {
  it('centra el mapa dentro de Honduras', () => {
    // Arrange
    const { center } = COUNTRY_VIEW

    // Act
    const inside = isInHonduras(center)

    // Assert
    expect(inside).toBe(true)
  })
})

describe('municipios', () => {
  it('reúne los 298 municipios de Honduras', () => {
    // Arrange
    const expectedTotal = 298

    // Act
    const total = DEPARTMENTS.reduce((count, { municipalities }) => count + municipalities.length, 0)

    // Assert
    expect(total).toBe(expectedTotal)
  })

  it('en cada departamento van en orden alfabético y sin repetirse', () => {
    // Arrange
    const sortedWithoutRepeats = (names: string[]) => [...new Set(names)].sort((a, b) => a.localeCompare(b, 'es'))

    // Act
    const disordered = DEPARTMENTS.filter(
      ({ municipalities }) => municipalities.join('|') !== sortedWithoutRepeats(municipalities).join('|'),
    ).map(({ name }) => name)

    // Assert
    expect(disordered).toEqual([])
  })

  it('la cabecera de cada departamento figura entre sus municipios', () => {
    // Arrange
    const lacksCapital = ({ capital, municipalities }: (typeof DEPARTMENTS)[number]) => !municipalities.includes(capital)

    // Act
    const withoutCapital = DEPARTMENTS.filter(lacksCapital).map(({ name }) => name)

    // Assert
    expect(withoutCapital).toEqual([])
  })
})
