import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PageLoading from '@/components/PageLoading'

describe('PageLoading', () => {
  it('avisa a los lectores de pantalla de que la página se está cargando', () => {
    // Arrange: página cuyo código aún se descarga

    // Act
    render(<PageLoading />)

    // Assert
    expect(screen.getByLabelText('Cargando página')).toHaveAttribute('aria-busy', 'true')
  })
})
