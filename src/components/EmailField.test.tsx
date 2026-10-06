import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import EmailField from '@/components/EmailField'

const field = () => screen.getByRole('textbox', { name: 'Correo' })

describe('EmailField', () => {
  it('es un campo de correo que el navegador puede autocompletar', () => {
    // Arrange
    const value = 'ana@gmail.com'

    // Act
    render(<EmailField value={value} onChange={vi.fn()} />)

    // Assert
    expect(field()).toHaveValue(value)
    expect(field()).toHaveAttribute('type', 'email')
    expect(field()).toHaveAttribute('name', 'email')
    expect(field()).toHaveAttribute('autocomplete', 'email')
  })

  it('avisa del correo escrito', async () => {
    // Arrange
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<EmailField value="" onChange={onChange} />)

    // Act
    await user.type(field(), 'a')

    // Assert
    expect(onChange).toHaveBeenCalledExactlyOnceWith('a')
  })

  it('con error, lo muestra y marca el campo como inválido', () => {
    // Arrange
    const error = 'Escribe tu correo.'

    // Act
    render(<EmailField value="" onChange={vi.fn()} error={error} />)

    // Assert
    expect(field()).toHaveAttribute('aria-invalid', 'true')
    expect(field()).toHaveAccessibleDescription(error)
  })

  it('se puede bloquear mientras el envío está en curso', () => {
    // Arrange
    const readOnly = true

    // Act
    render(<EmailField value="ana@gmail.com" onChange={vi.fn()} readOnly={readOnly} />)

    // Assert
    expect(field()).toHaveAttribute('readonly')
  })
})
