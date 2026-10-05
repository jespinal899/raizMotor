import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AboutUs from '@/features/home/components/AboutUs'
import { BRAND } from '@/shared/constants/brand'
import { ROUTES, SECTION_IDS } from '@/shared/constants/routes'

const section = () => screen.getByRole('region', { name: 'Quiénes somos' })

describe('AboutUs', () => {
  it('es la sección a la que apunta el enlace "Quiénes somos"', () => {
    // Arrange
    const anchor = ROUTES.about.split('#')[1]

    // Act
    render(<AboutUs />)

    // Assert
    expect(section()).toHaveAttribute('id', anchor)
    expect(anchor).toBe(SECTION_IDS.about)
  })

  it('se presenta como el puente entre la propiedad y el inquilino', () => {
    // Arrange
    const headline = 'El puente entre tu propiedad y el inquilino perfecto.'

    // Act
    render(<AboutUs />)

    // Assert
    expect(within(section()).getByRole('heading', { level: 2, name: headline })).toBeInTheDocument()
  })

  it('explica en breve para qué nació la marca y a quiénes reúne', () => {
    // Arrange
    const opening = `${BRAND.name} nació para simplificar lo complejo.`

    // Act
    render(<AboutUs />)

    // Assert
    const description = within(section()).getByText(opening, { exact: false })
    expect(description).toHaveTextContent('propietarios, agentes e inquilinos')
    expect(description).toHaveTextContent('sin papeleo, sin comisiones ocultas y con total transparencia.')
  })

  it('no promete funciones que el sitio todavía no tiene', () => {
    // Arrange
    const unbackedClaim = 'en tiempo real'

    // Act
    render(<AboutUs />)

    // Assert
    expect(section()).not.toHaveTextContent(unbackedClaim)
  })
})
