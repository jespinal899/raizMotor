import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HomePage from '@/pages/HomePage'
import { BRAND } from '@/shared/constants/brand'
import { renderWithRouter } from '@/test/renderWithRouter'

describe('HomePage', () => {
  it('presenta quiénes somos antes de explicar cómo ayuda la plataforma', () => {
    // Arrange
    const helpSection = `En ${BRAND.name} te ayudamos`

    // Act
    renderWithRouter(<HomePage />)

    // Assert
    const about = screen.getByRole('region', { name: 'Quiénes somos' })
    const help = screen.getByRole('region', { name: helpSection })
    expect(about.compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
