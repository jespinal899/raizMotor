import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HowItWorks from '@/features/home/components/HowItWorks'
import { BRAND } from '@/shared/constants/brand'
import { ROUTES, SECTION_IDS } from '@/shared/constants/routes'

describe('HowItWorks', () => {
  it('es la sección a la que apunta el enlace "Cómo funciona"', () => {
    // Arrange
    const anchor = ROUTES.howItWorks.split('#')[1]

    // Act
    render(<HowItWorks />)

    // Assert
    const section = screen.getByRole('region', { name: `Cómo funciona ${BRAND.name}` })
    expect(section).toHaveAttribute('id', anchor)
    expect(anchor).toBe(SECTION_IDS.howItWorks)
  })

  it('explica los tres pasos numerados y en orden', () => {
    // Arrange
    const expectedSteps = ['1. Busca', '2. Contacta directo', '3. Publica']

    // Act
    render(<HowItWorks />)

    // Assert
    const steps = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)
    expect(steps).toEqual(expectedSteps)
  })

  it('acompaña cada paso con su descripción', () => {
    // Arrange: sección sin estado previo

    // Act
    render(<HowItWorks />)

    // Assert
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(within(items[1]).getByText(/sin intermediarios ni comisiones ocultas/)).toBeInTheDocument()
  })
})
