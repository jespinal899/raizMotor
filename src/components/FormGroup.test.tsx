import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FormGroup from '@/components/FormGroup'

const renderGroup = (error?: string) =>
  render(
    <FormGroup label="Tipo de propiedad" error={error}>
      {(group) => <div role="radiogroup" {...group} />}
    </FormGroup>,
  )

describe('FormGroup', () => {
  it('da nombre al grupo de controles con su etiqueta', () => {
    // Arrange: grupo sin error

    // Act
    renderGroup()

    // Assert
    expect(screen.getByRole('radiogroup', { name: 'Tipo de propiedad' })).toBeInTheDocument()
  })

  it('muestra la aclaración junto a la etiqueta, separada por un espacio', () => {
    // Arrange
    const hint = 'hasta 10'

    // Act
    render(
      <FormGroup label="Fotos" hint={hint}>
        {(group) => <div role="group" {...group} />}
      </FormGroup>,
    )

    // Assert
    expect(screen.getByRole('group', { name: 'Fotos (hasta 10)' })).toBeInTheDocument()
  })

  it('sin error, el grupo se marca como válido y no muestra ningún aviso', () => {
    // Arrange: grupo sin error

    // Act
    renderGroup()

    // Assert
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'false')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('con error, lo muestra y lo enlaza con el grupo', () => {
    // Arrange
    const error = 'Selecciona el tipo de propiedad.'

    // Act
    renderGroup(error)

    // Assert
    const group = screen.getByRole('radiogroup')
    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(group).toHaveAccessibleDescription(error)
    expect(screen.getByRole('alert')).toHaveTextContent(error)
  })
})
