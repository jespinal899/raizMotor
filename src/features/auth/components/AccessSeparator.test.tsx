import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AccessSeparator from '@/features/auth/components/AccessSeparator'

describe('AccessSeparator', () => {
  it('anuncia que debajo hay otra forma de continuar', () => {
    // Arrange: separador entre el formulario y el acceso con Google

    // Act
    render(<AccessSeparator />)

    // Assert
    expect(screen.getByText('O continúa con')).toBeInTheDocument()
  })

  it('dibuja una línea que separa las dos formas de acceder', () => {
    // Arrange: separador entre el formulario y el acceso con Google

    // Act
    render(<AccessSeparator />)

    // Assert
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })
})
