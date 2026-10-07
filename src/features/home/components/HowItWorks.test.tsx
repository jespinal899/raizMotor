import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HowItWorks from '@/features/home/components/HowItWorks'
import { BRAND } from '@/shared/constants/brand'
import { ROUTES, SECTION_IDS } from '@/shared/constants/routes'

const section = () => screen.getByRole('region', { name: `En ${BRAND.name} te ayudamos` })

describe('HowItWorks', () => {
  it('se titula "En <marca> te ayudamos"', () => {
    // Arrange
    const expectedTitle = `En ${BRAND.name} te ayudamos`

    // Act
    render(<HowItWorks />)

    // Assert
    expect(screen.getByRole('heading', { level: 2, name: expectedTitle })).toBeInTheDocument()
  })

  it('es la sección a la que apunta el enlace "Cómo funciona"', () => {
    // Arrange
    const anchor = ROUTES.howItWorks.split('#')[1]

    // Act
    render(<HowItWorks />)

    // Assert
    expect(section()).toHaveAttribute('id', anchor)
    expect(anchor).toBe(SECTION_IDS.howItWorks)
  })

  it('muestra publicar, encontrar, contactar y decidir, en ese orden', () => {
    // Arrange
    const expectedSteps = ['Publicar', 'Encontrar', 'Contactar', 'Decidir']

    // Act
    render(<HowItWorks />)

    // Assert
    const steps = within(section())
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent)
    expect(steps).toEqual(expectedSteps)
  })

  it('explica cada paso con su descripción', () => {
    // Arrange
    const expectedFragments = [
      /planes para propietarios, agentes inmobiliarios e inmobiliarias/,
      /tipo de propiedad, ubicación y precio/,
      /sin intermediarios ni comisiones ocultas/,
      /Compara fotos, características y precios/,
    ]

    // Act
    render(<HowItWorks />)

    // Assert
    const items = within(section()).getAllByRole('listitem')
    expect(items).toHaveLength(expectedFragments.length)
    expectedFragments.forEach((fragment, position) => {
      expect(within(items[position]).getByText(fragment)).toBeInTheDocument()
    })
  })

  it('ya no muestra el subtítulo anterior', () => {
    // Arrange
    const previousSubtitle = 'Buscar, contactar y publicar en un solo lugar.'

    // Act
    render(<HowItWorks />)

    // Assert
    expect(screen.queryByText(previousSubtitle)).not.toBeInTheDocument()
  })
})
