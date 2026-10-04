import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import TextField from '@/components/TextField'

describe('TextField', () => {
  it('enlaza la etiqueta con el campo y muestra su valor', () => {
    // Arrange
    const value = 'Tegucigalpa'

    // Act
    render(<TextField label="Ciudad" value={value} onChange={vi.fn()} />)

    // Assert
    expect(screen.getByRole('textbox', { name: 'Ciudad' })).toHaveValue(value)
  })

  it('avisa del texto escrito, no del evento', async () => {
    // Arrange
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TextField label="Ciudad" value="" onChange={onChange} />)

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Ciudad' }), 'T')

    // Assert
    expect(onChange).toHaveBeenCalledExactlyOnceWith('T')
  })

  it('admite campos numéricos con su aclaración de unidad', () => {
    // Arrange
    const unit = 'm²'

    // Act
    render(<TextField label="Superficie construida" hint={unit} type="number" min={0} value="180" onChange={vi.fn()} />)

    // Assert
    const field = screen.getByRole('spinbutton', { name: 'Superficie construida (m²)' })
    expect(field).toHaveValue(180)
    expect(field).toHaveAttribute('min', '0')
  })

  it('con error, lo muestra y marca el campo como inválido', () => {
    // Arrange
    const error = 'Escribe la ciudad.'

    // Act
    render(<TextField label="Ciudad" value="" onChange={vi.fn()} error={error} />)

    // Assert
    const field = screen.getByRole('textbox', { name: 'Ciudad' })
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAccessibleDescription(error)
  })
})
