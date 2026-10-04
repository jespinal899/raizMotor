import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FormSection from '@/components/FormSection'

describe('FormSection', () => {
  it('agrupa sus campos en una sección con nombre, titulada con un encabezado', () => {
    // Arrange
    const title = 'Ubicación'

    // Act
    render(
      <FormSection title={title}>
        <input aria-label="Ciudad" />
      </FormSection>,
    )

    // Assert
    const section = screen.getByRole('region', { name: title })
    expect(within(section).getByRole('heading', { level: 2, name: title })).toBeInTheDocument()
    expect(within(section).getByRole('textbox', { name: 'Ciudad' })).toBeInTheDocument()
  })

  it('explica la sección cuando se le da una descripción', () => {
    // Arrange
    const description = 'Indica dónde está la propiedad.'

    // Act
    render(
      <FormSection title="Ubicación" description={description}>
        <input aria-label="Ciudad" />
      </FormSection>,
    )

    // Assert
    expect(screen.getByText(description)).toBeInTheDocument()
  })
})

describe('FormSection dentro de un paso', () => {
  it('puede titularse con un encabezado de tercer nivel, por debajo del título del paso', () => {
    // Arrange
    const title = 'Ubicación'

    // Act
    render(
      <FormSection title={title} titleAs="h3">
        <input aria-label="Ciudad" />
      </FormSection>,
    )

    // Assert
    expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: title })).toBeInTheDocument()
  })
})
