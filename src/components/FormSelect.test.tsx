import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FormSelect from '@/components/FormSelect'

const OPTIONS = [
  { value: 'cortes', label: 'Cortés' },
  { value: 'yoro', label: 'Yoro' },
]

interface Overrides {
  value?: string
  error?: string
  onChange?: (value: string) => void
}

const renderSelect = ({ value = '', error, onChange = vi.fn() }: Overrides = {}) =>
  render(
    <FormSelect
      label="Departamento"
      placeholder="Selecciona un departamento"
      options={OPTIONS}
      value={value}
      onChange={onChange}
      error={error}
    />,
  )

const trigger = () => screen.getByRole('combobox', { name: 'Departamento' })

describe('FormSelect', () => {
  it('mientras no hay nada elegido muestra el texto de ayuda', () => {
    // Arrange: sin valor

    // Act
    renderSelect()

    // Assert
    expect(trigger()).toHaveTextContent('Selecciona un departamento')
  })

  it('muestra el nombre de la opción elegida', () => {
    // Arrange
    const value = 'yoro'

    // Act
    renderSelect({ value })

    // Assert
    expect(trigger()).toHaveTextContent('Yoro')
  })

  it('al elegir una opción avisa con su valor', async () => {
    // Arrange
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderSelect({ onChange })
    await user.click(trigger())

    // Act
    await user.click(await screen.findByRole('option', { name: 'Cortés' }))

    // Assert
    expect(onChange).toHaveBeenCalledExactlyOnceWith('cortes')
  })

  it('con error, lo muestra y marca el desplegable como inválido', () => {
    // Arrange
    const error = 'Selecciona el departamento.'

    // Act
    renderSelect({ error })

    // Assert
    expect(trigger()).toHaveAttribute('aria-invalid', 'true')
    expect(trigger()).toHaveAccessibleDescription(error)
  })
})

describe('FormSelect deshabilitado', () => {
  it('no se puede abrir mientras no tenga sentido elegir, y lo explica con su texto de ayuda', () => {
    // Arrange
    const placeholder = 'Elige primero el departamento'

    // Act
    render(<FormSelect label="Ciudad" placeholder={placeholder} options={[]} value="" onChange={vi.fn()} disabled />)

    // Assert
    const select = screen.getByRole('combobox', { name: 'Ciudad' })
    expect(select).toBeDisabled()
    expect(select).toHaveTextContent(placeholder)
  })
})
