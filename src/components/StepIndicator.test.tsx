import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StepIndicator from '@/components/StepIndicator'

const STEPS = ['Propiedad', 'Publicación', 'Últimos detalles']
const LABEL = 'Pasos para publicar'

const renderIndicator = (current: number) => render(<StepIndicator label={LABEL} steps={STEPS} current={current} />)

const items = () => within(screen.getByRole('navigation', { name: LABEL })).getAllByRole('listitem')

describe('StepIndicator', () => {
  it('enumera los pasos en orden, cada uno con su número', () => {
    // Arrange
    const current = 0

    // Act
    renderIndicator(current)

    // Assert
    expect(items().map((item) => item.textContent)).toEqual([
      '1Paso 1: Propiedad',
      '2Paso 2: Publicación',
      '3Paso 3: Últimos detalles',
    ])
  })

  it('señala el paso en el que está la persona', () => {
    // Arrange
    const current = 1

    // Act
    renderIndicator(current)

    // Assert
    const [first, second, third] = items()
    expect(second).toHaveAttribute('aria-current', 'step')
    expect(first).not.toHaveAttribute('aria-current')
    expect(third).not.toHaveAttribute('aria-current')
  })

  it('marca como completados los pasos anteriores, y solo esos', () => {
    // Arrange
    const current = 1

    // Act
    renderIndicator(current)

    // Assert
    const [first, second, third] = items()
    expect(first).toHaveTextContent('Paso 1: Propiedad (completado)')
    expect(second).not.toHaveTextContent('completado')
    expect(third).not.toHaveTextContent('completado')
  })
})
