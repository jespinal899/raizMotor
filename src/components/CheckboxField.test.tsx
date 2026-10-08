import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CheckboxField from '@/components/CheckboxField'

const LABEL = 'Acepto los términos y condiciones'
const box = () => screen.getByRole('checkbox', { name: LABEL })

describe('CheckboxField', () => {
  it('es una casilla que se llama como su texto y refleja si está marcada', () => {
    // Arrange
    const checked = true

    // Act
    render(<CheckboxField label={LABEL} checked={checked} onChange={vi.fn()} />)

    // Assert
    expect(box()).toBeChecked()
  })

  it('al pulsarla avisa de que pasa a estar marcada', async () => {
    // Arrange
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CheckboxField label={LABEL} checked={false} onChange={onChange} />)

    // Act
    await user.click(box())

    // Assert
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true)
  })

  it('también se marca pulsando su texto', async () => {
    // Arrange
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CheckboxField label={LABEL} checked={false} onChange={onChange} />)

    // Act
    await user.click(screen.getByText(LABEL))

    // Assert
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true)
  })

  it('sin error no muestra ningún aviso ni se marca como inválida', () => {
    // Arrange: casilla sin comprobar todavía

    // Act
    render(<CheckboxField label={LABEL} checked={false} onChange={vi.fn()} />)

    // Assert
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(box()).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('con error, lo muestra y lo une a la casilla', () => {
    // Arrange
    const error = 'Acepta los términos y condiciones para cotizar.'

    // Act
    render(<CheckboxField label={LABEL} checked={false} error={error} onChange={vi.fn()} />)

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(error)
    expect(box()).toHaveAttribute('aria-invalid', 'true')
    expect(box()).toHaveAccessibleDescription(error)
  })

  it('bloqueada, no cambia al pulsarla', async () => {
    // Arrange
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CheckboxField label={LABEL} checked={false} readOnly onChange={onChange} />)

    // Act
    await user.click(box())

    // Assert
    expect(onChange).not.toHaveBeenCalled()
  })

  it('su texto puede llevar un enlace, que sigue formando parte del nombre de la casilla', () => {
    // Arrange
    const label = (
      <>
        Acepto los <a href="/terminos">términos y condiciones</a>
      </>
    )

    // Act
    render(<CheckboxField label={label} checked={false} onChange={vi.fn()} />)

    // Assert
    expect(screen.getByRole('checkbox', { name: LABEL })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'términos y condiciones' })).toHaveAttribute('href', '/terminos')
  })

  it('con un texto largo, puede repartirlo en varias líneas sin apretarlas y con la casilla junto a la primera', () => {
    // Arrange
    const longLabel = 'Declaro conocer y aceptar los Términos y Condiciones de uso'

    // Act
    render(<CheckboxField label={longLabel} checked={false} onChange={vi.fn()} multiline />)

    // Assert
    expect(screen.getByText(longLabel)).toHaveClass('items-start', 'leading-snug')
  })

  it('si no se pide, el texto va en una línea con la casilla centrada', () => {
    // Arrange: casilla con un texto corto

    // Act
    render(<CheckboxField label={LABEL} checked={false} onChange={vi.fn()} />)

    // Assert
    expect(screen.getByText(LABEL)).not.toHaveClass('leading-snug')
  })
})
