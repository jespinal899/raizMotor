import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StepScreen from '@/components/StepScreen'
import type { StepDirection } from '@/hooks/useSteps'

const HEADING = 'Paso 2 de 3: Pago'

interface Overrides {
  direction?: StepDirection
  isEntering?: boolean
}

const setup = ({ direction = 'forward', isEntering = false }: Overrides = {}) =>
  render(
    <StepScreen heading={HEADING} direction={direction} isEntering={isEntering}>
      <p>Contenido del paso</p>
    </StepScreen>,
  )

const heading = () => screen.getByRole('heading', { level: 2, name: HEADING })

describe('StepScreen', () => {
  it('titula el paso y muestra su contenido', () => {
    // Arrange: pantalla de un paso

    // Act
    setup()

    // Assert
    expect(heading()).toBeInTheDocument()
    expect(screen.getByText('Contenido del paso')).toBeInTheDocument()
  })

  it('al cargar la página no toca el foco ni anima la entrada', () => {
    // Arrange
    const isEntering = false

    // Act
    setup({ isEntering })

    // Assert
    expect(heading()).not.toHaveFocus()
    expect(heading().parentElement?.className).not.toContain('animate-slide-in')
  })

  it('al llegar desde otro paso lleva el foco a su título, para anunciarlo', () => {
    // Arrange
    const isEntering = true

    // Act
    setup({ isEntering })

    // Assert
    expect(heading()).toHaveFocus()
  })

  it.each([
    { direction: 'forward', animation: 'animate-slide-in-right' },
    { direction: 'backward', animation: 'animate-slide-in-left' },
  ] as const)('al llegar yendo "$direction" entra desde ese lado', ({ direction, animation }) => {
    // Arrange
    const isEntering = true

    // Act
    setup({ direction, isEntering })

    // Assert
    expect(heading().parentElement).toHaveClass(animation)
  })
})
