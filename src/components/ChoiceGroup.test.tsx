import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ChoiceGroup from '@/components/ChoiceGroup'

type Operation = 'venta' | 'alquiler'

const OPTIONS: { value: Operation; label: string }[] = [
  { value: 'venta', label: 'Venta' },
  { value: 'alquiler', label: 'Alquiler' },
]

interface Overrides {
  value?: Operation | ''
  error?: string
  onChange?: (value: Operation) => void
}

const renderGroup = ({ value = '', error, onChange = vi.fn() }: Overrides = {}) =>
  render(<ChoiceGroup label="Operación" options={OPTIONS} value={value} onChange={onChange} error={error} />)

const option = (name: string) => screen.getByRole('radio', { name })

describe('ChoiceGroup', () => {
  it('ofrece cada opción dentro de un grupo con nombre, sin ninguna elegida al empezar', () => {
    // Arrange: sin valor

    // Act
    renderGroup()

    // Assert
    expect(screen.getByRole('radiogroup', { name: 'Operación' })).toBeInTheDocument()
    expect(option('Venta')).not.toBeChecked()
    expect(option('Alquiler')).not.toBeChecked()
  })

  it('marca la opción elegida', () => {
    // Arrange
    const value = 'alquiler'

    // Act
    renderGroup({ value })

    // Assert
    expect(option('Alquiler')).toBeChecked()
    expect(option('Venta')).not.toBeChecked()
  })

  it('al pulsar una opción avisa con su valor', async () => {
    // Arrange
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderGroup({ onChange })

    // Act
    await user.click(option('Venta'))

    // Assert
    expect(onChange).toHaveBeenCalledExactlyOnceWith('venta')
  })

  it('con error, lo muestra y lo enlaza con el grupo', () => {
    // Arrange
    const error = 'Indica si es venta o alquiler.'

    // Act
    renderGroup({ error })

    // Assert
    const group = screen.getByRole('radiogroup', { name: 'Operación' })
    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(group).toHaveAccessibleDescription(error)
  })
})
