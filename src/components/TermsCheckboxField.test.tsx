import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import TermsCheckboxField from '@/components/TermsCheckboxField'
import { renderWithRouter } from '@/test/renderWithRouter'

const box = () => screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' })

describe('TermsCheckboxField', () => {
  it('es una casilla sin marcar para aceptar los términos y condiciones', () => {
    // Arrange
    const checked = false

    // Act
    renderWithRouter(<TermsCheckboxField checked={checked} onChange={vi.fn()} />)

    // Assert
    expect(box()).not.toBeChecked()
  })

  it('enlaza a los términos en otra pestaña, para no perder lo ya escrito en el formulario', () => {
    // Arrange: casilla dentro de un formulario

    // Act
    renderWithRouter(<TermsCheckboxField checked={false} onChange={vi.fn()} />)

    // Assert
    const link = screen.getByRole('link', { name: 'términos y condiciones' })
    expect(link).toHaveAttribute('href', '/terminos')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('al marcarla avisa de que quedó aceptada', async () => {
    // Arrange
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithRouter(<TermsCheckboxField checked={false} onChange={onChange} />)

    // Act
    await user.click(box())

    // Assert
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true)
  })

  it('con error, lo muestra junto a la casilla', () => {
    // Arrange
    const error = 'Acepta los términos y condiciones para continuar.'

    // Act
    renderWithRouter(<TermsCheckboxField checked={false} onChange={vi.fn()} error={error} />)

    // Assert
    expect(box()).toHaveAttribute('aria-invalid', 'true')
    expect(box()).toHaveAccessibleDescription(error)
  })

  it('admite otra redacción, con el enlace en lo que se acepta', () => {
    // Arrange
    const lead = 'Declaro conocer y aceptar los'
    const linkLabel = 'Términos y Condiciones de uso'

    // Act
    renderWithRouter(<TermsCheckboxField checked={false} onChange={vi.fn()} lead={lead} linkLabel={linkLabel} />)

    // Assert
    expect(screen.getByRole('checkbox', { name: `${lead} ${linkLabel}` })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: linkLabel })).toHaveAttribute('href', '/terminos')
  })
})
