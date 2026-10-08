import { describe, expect, it } from 'vitest'
import { findPlanInquiry } from '@/features/shop/utils/planInquiry'

describe('findPlanInquiry', () => {
  it('describe un plan de la página de planes con su nombre y su texto', () => {
    // Arrange
    const id = 'inmobiliaria'

    // Act
    const inquiry = findPlanInquiry(id)

    // Assert
    expect(inquiry).toEqual({
      id: 'inmobiliaria',
      name: 'Inmobiliarias',
      detail: 'Para empresas con un equipo que gestiona varias propiedades.',
    })
  })

  it('describe un plan para agentes con su nombre, que ya dice a quién va dirigido, y resume lo que incluye', () => {
    // Arrange
    const id = 'agente-plan-1'

    // Act
    const inquiry = findPlanInquiry(id)

    // Assert
    expect(inquiry).toEqual({
      id: 'agente-plan-1',
      name: 'Agente Pro',
      detail: 'Hasta 25 propiedades activas · 1 usuario por agente inmobiliario',
    })
  })

  it.each([
    { id: 'inventado', reason: 'un plan que no existe' },
    { id: '', reason: 'un identificador vacío' },
    { id: null, reason: 'una consulta sin plan' },
  ])('no reconoce $reason', ({ id }) => {
    // Arrange: identificador tal como llega de la URL

    // Act
    const inquiry = findPlanInquiry(id)

    // Assert
    expect(inquiry).toBeUndefined()
  })
})
