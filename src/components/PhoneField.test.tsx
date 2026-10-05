import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PhoneField from '@/components/PhoneField'

const field = () => screen.getByRole('textbox', { name: 'Teléfono' })

/** Campo con memoria, como dentro de un formulario: permite escribir varios caracteres seguidos. */
const StatefulField = ({ onChange }: { onChange: (value: string) => void }) => {
  const [value, setValue] = useState('')

  return (
    <PhoneField
      label="Teléfono"
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange(next)
      }}
    />
  )
}

const setup = () => {
  const onChange = vi.fn()
  render(<StatefulField onChange={onChange} />)

  return { onChange, user: userEvent.setup() }
}

describe('PhoneField', () => {
  it('muestra fijo el prefijo de Honduras, fuera de lo que se escribe', () => {
    // Arrange
    const local = '9999-8888'

    // Act
    render(<PhoneField label="Teléfono" value={local} onChange={vi.fn()} />)

    // Assert
    expect(screen.getByText('+504')).toBeInTheDocument()
    expect(field()).toHaveValue(local)
  })

  it('es un campo de teléfono con teclado numérico, que el navegador rellena sin el prefijo del país', () => {
    // Arrange: campo vacío

    // Act
    render(<PhoneField label="Teléfono" value="" onChange={vi.fn()} />)

    // Assert
    expect(field()).toHaveAttribute('type', 'tel')
    expect(field()).toHaveAttribute('inputmode', 'numeric')
    expect(field()).toHaveAttribute('autocomplete', 'tel-national')
  })

  it('al escribir el número pone el guion y entrega solo la parte local', async () => {
    // Arrange
    const { onChange, user } = setup()

    // Act
    await user.type(field(), '99998888')

    // Assert
    expect(field()).toHaveValue('9999-8888')
    expect(onChange).toHaveBeenLastCalledWith('9999-8888')
  })

  it('no deja escribir letras ni más dígitos de la cuenta', async () => {
    // Arrange
    const { user } = setup()

    // Act
    await user.type(field(), '99a99b888877')

    // Assert
    expect(field()).toHaveValue('9999-8888')
  })

  it('si se pega el número con el prefijo, no lo duplica', async () => {
    // Arrange
    const { user } = setup()
    await user.click(field())

    // Act
    await user.paste('+504 9999-8888')

    // Assert
    expect(field()).toHaveValue('9999-8888')
  })

  it('con error, lo muestra y marca el campo como inválido', () => {
    // Arrange
    const error = 'Escribe los 8 dígitos de tu número.'

    // Act
    render(<PhoneField label="Teléfono" value="9999" onChange={vi.fn()} error={error} />)

    // Assert
    expect(field()).toHaveAttribute('aria-invalid', 'true')
    expect(field()).toHaveAccessibleDescription(error)
  })

  it('se puede bloquear mientras el formulario se envía', () => {
    // Arrange
    const readOnly = true

    // Act
    render(<PhoneField label="Teléfono" value="9999-8888" onChange={vi.fn()} readOnly={readOnly} />)

    // Assert
    expect(field()).toHaveAttribute('readonly')
  })
})
