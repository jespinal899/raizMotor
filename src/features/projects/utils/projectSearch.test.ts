import { describe, expect, it } from 'vitest'
import { buildProjectsPath, parseProjectFilters, parseProjectPage } from '@/features/projects/utils/projectSearch'

describe('projectSearch', () => {
  it('lee de la dirección los filtros que entiende e ignora los demás', () => {
    // Arrange
    const params = new URLSearchParams('tipo=torre&etapa=preventa&zona=%20palmira%20&hasta=100000&otro=x')
    const invalid = new URLSearchParams('tipo=castillo&etapa=ya&hasta=mucho')

    // Act
    const filters = parseProjectFilters(params)
    const ignored = parseProjectFilters(invalid)

    // Assert
    expect(filters).toEqual({ kind: 'torre', stage: 'preventa', location: 'palmira', maxPrice: 100000 })
    expect(ignored).toEqual({})
  })

  it('arma la dirección con los filtros y la página, y la vuelve a leer igual', () => {
    // Arrange
    const filters = { kind: 'residencial', stage: 'construccion', location: 'San Pedro', maxPrice: 150000 } as const

    // Act
    const path = buildProjectsPath(filters, 3)
    const params = new URLSearchParams(path.split('?')[1])

    // Assert
    expect(path.startsWith('/proyectos?')).toBe(true)
    expect(parseProjectFilters(params)).toEqual(filters)
    expect(parseProjectPage(params)).toBe(3)
  })

  it('sin filtros ni página es el catálogo entero, y una página que no vale es la primera', () => {
    // Arrange: búsqueda vacía

    // Act
    const path = buildProjectsPath({}, 1)

    // Assert
    expect(path).toBe('/proyectos')
    expect(parseProjectPage(new URLSearchParams('pagina=-2'))).toBe(1)
  })
})
