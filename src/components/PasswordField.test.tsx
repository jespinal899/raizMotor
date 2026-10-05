import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PasswordField from '@/components/PasswordField'

describe('PasswordField', () => {
  it('enlaza la etiqueta con un campo que oculta lo escrito', () => {
    // Arrange
    const value = 'secreta123'

    // Act
    render(<PasswordField label="Contraseña" value={value} onChange={vi.fn()} autoComplete="current-password" />)

    // Assert
    const field = screen.getByLabelText('Contraseña')
    expect(field).toHaveValue(value)
    expect(field).toHaveAttribute('type', 'password')
    expect(field).toHaveAttribute('autocomplete', 'current-password')
  })

  it('avisa del texto escrito, no del evento', async () => {
    // Arrange
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PasswordField label="Contraseña" value="" onChange={onChange} />)

    // Act
    await user.type(screen.getByLabelText('Contraseña'), 's')

    // Assert
    expect(onChange).toHaveBeenCalledExactlyOnceWith('s')
  })

  it('muestra junto a la etiqueta la regla que debe cumplir', () => {
    // Arrange
    const hint = 'mínimo 8 caracteres'

    // Act
    render(<PasswordField label="Contraseña" hint={hint} value="" onChange={vi.fn()} />)

    // Assert
    expect(screen.getByLabelText('Contraseña (mínimo 8 caracteres)')).toBeInTheDocument()
  })

  it('con error, lo muestra y marca el campo como inválido', () => {
    // Arrange
    const error = 'Escribe tu contraseña.'

    // Act
    render(<PasswordField label="Contraseña" value="" onChange={vi.fn()} error={error} />)

    // Assert
    const field = screen.getByLabelText('Contraseña')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAccessibleDescription(error)
  })

  it('permite ver lo escrito antes de enviarlo', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<PasswordField label="Contraseña" value="secreta123" onChange={vi.fn()} />)

    // Act
    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))

    // Assert
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'text')
  })
})
