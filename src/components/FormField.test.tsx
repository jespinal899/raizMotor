import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FormField from '@/components/FormField'

const renderField = (error?: string) =>
  render(
    <FormField label="Nombre" error={error}>
      {(control) => <input {...control} />}
    </FormField>,
  )

describe('FormField', () => {
  it('enlaza la etiqueta con el control', () => {
    // Arrange: campo sin error

    // Act
    renderField()

    // Assert
    expect(screen.getByRole('textbox', { name: 'Nombre' })).toBeInTheDocument()
  })

  it('muestra la aclaración junto a la etiqueta, separada por un espacio', () => {
    // Arrange
    const hint = 'opcional'

    // Act
    render(
      <FormField label="Teléfono" hint={hint}>
        {(control) => <input {...control} />}
      </FormField>,
    )

    // Assert
    expect(screen.getByRole('textbox', { name: 'Teléfono (opcional)' })).toBeInTheDocument()
  })

  it('sin error, el control se marca como válido y no muestra ningún aviso', () => {
    // Arrange: campo sin error

    // Act
    renderField()

    // Assert
    const input = screen.getByRole('textbox', { name: 'Nombre' })
    expect(input).toHaveAttribute('aria-invalid', 'false')
    expect(input).not.toHaveAttribute('aria-describedby')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('con error, lo muestra y lo asocia al control', () => {
    // Arrange
    const error = 'Escribe tu nombre.'

    // Act
    renderField(error)

    // Assert
    const input = screen.getByRole('textbox', { name: 'Nombre' })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(error)
    expect(screen.getByRole('alert')).toHaveTextContent(error)
  })

  it('da un identificador distinto a cada campo', () => {
    // Arrange
    const fields = (
      <>
        <FormField label="Nombre">{(control) => <input {...control} />}</FormField>
        <FormField label="Mensaje">{(control) => <textarea {...control} />}</FormField>
      </>
    )

    // Act
    render(fields)

    // Assert
    const ids = screen.getAllByRole('textbox').map((control) => control.id)
    expect(new Set(ids).size).toBe(2)
  })
})
