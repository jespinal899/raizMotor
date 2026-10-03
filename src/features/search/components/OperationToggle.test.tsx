import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import OperationToggle from '@/features/search/components/OperationToggle'

describe('OperationToggle', () => {
  it('marca como pulsada solo la operación seleccionada', () => {
    // Arrange
    const selected = 'alquiler'

    // Act
    render(<OperationToggle value={selected} onChange={vi.fn()} />)

    // Assert
    expect(screen.getByRole('button', { name: 'Alquilar' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Comprar' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('agrupa las opciones bajo la etiqueta "Operación"', () => {
    // Arrange
    const onChange = vi.fn()

    // Act
    render(<OperationToggle value={undefined} onChange={onChange} />)

    // Assert
    expect(screen.getByRole('group', { name: 'Operación' })).toBeInTheDocument()
  })

  it('avisa de la operación elegida al pulsar una opción distinta', async () => {
    // Arrange
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<OperationToggle value="venta" onChange={onChange} />)

    // Act
    await user.click(screen.getByRole('button', { name: 'Alquilar' }))

    // Assert
    expect(onChange).toHaveBeenCalledExactlyOnceWith('alquiler')
  })

  it('quita la selección al pulsar la opción ya seleccionada', async () => {
    // Arrange
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<OperationToggle value="venta" onChange={onChange} />)

    // Act
    await user.click(screen.getByRole('button', { name: 'Comprar' }))

    // Assert
    expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined)
  })
})
