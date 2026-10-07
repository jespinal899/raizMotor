import { describe, expect, it } from 'vitest'
import {
  ROUTES,
  SECTION_IDS,
  planContactPath,
  propertyContactPath,
  propertyDetailPath,
  propertyTypePath,
} from '@/shared/constants/routes'

describe('rutas', () => {
  it('propertyTypePath cuelga el tipo de la ruta de propiedades', () => {
    // Arrange
    const typeSlug = 'casas'

    // Act
    const path = propertyTypePath(typeSlug)

    // Assert
    expect(path).toBe('/propiedades/casas')
  })

  it('propertyDetailPath encaja con el patrón de la ruta de detalle', () => {
    // Arrange
    const id = 'casa-123'

    // Act
    const path = propertyDetailPath(id)

    // Assert
    expect(path).toBe(ROUTES.propertyDetail.replace(':id', id))
  })

  it('propertyContactPath indica la propiedad en la consulta', () => {
    // Arrange
    const id = 'casa-123'

    // Act
    const path = propertyContactPath(id)

    // Assert
    expect(path).toBe('/contacto?propiedad=casa-123')
  })

  it('propertyContactPath codifica caracteres que romperían la URL', () => {
    // Arrange
    const id = 'casa & jardín'

    // Act
    const path = propertyContactPath(id)

    // Assert
    expect(new URL(path, 'https://ejemplo.test').searchParams.get('propiedad')).toBe(id)
  })

  it('planContactPath indica el plan en la consulta', () => {
    // Arrange
    const id = 'agente-plan-1'

    // Act
    const path = planContactPath(id)

    // Assert
    expect(path).toBe('/contacto?plan=agente-plan-1')
  })

  it('los planes para agentes cuelgan de la página de planes', () => {
    // Arrange
    const pricing = ROUTES.pricing

    // Act
    const agentPlans = ROUTES.agentPlans

    // Assert
    expect(agentPlans).toBe(`${pricing}/agente-inmobiliario`)
  })

  it('el enlace a "Cómo funciona" apunta a la sección del inicio', () => {
    // Arrange
    const sectionId = SECTION_IDS.howItWorks

    // Act
    const link = ROUTES.howItWorks

    // Assert
    expect(link).toBe(`/#${sectionId}`)
  })
})
