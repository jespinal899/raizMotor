import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LegalDocument from '@/features/legal/components/LegalDocument'
import type { LegalDocumentContent } from '@/features/legal/types/legal.types'
import { renderWithRouter } from '@/test/renderWithRouter'

const DOCUMENT: LegalDocumentContent = {
  title: 'Términos de prueba',
  summary: 'Resumen de lo que dice el documento.',
  updatedOn: '2026-10-06',
  sections: [
    { id: 'uno', title: 'Primera parte', paragraphs: ['Primer párrafo.', 'Segundo párrafo.'] },
    { id: 'dos', title: 'Segunda parte', paragraphs: ['Antes de la lista:'], items: ['Un punto', 'Otro punto'] },
  ],
  related: { label: 'Ver el otro documento', to: '/otro' },
}

const renderDocument = () => renderWithRouter(<LegalDocument document={DOCUMENT} />)

describe('LegalDocument', () => {
  it('presenta el documento con su título principal, su resumen y la fecha de la última revisión', () => {
    // Arrange: documento de prueba

    // Act
    renderDocument()

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Términos de prueba' })).toBeInTheDocument()
    expect(screen.getByText('Resumen de lo que dice el documento.')).toBeInTheDocument()
    expect(screen.getByText('Última actualización: 6 de octubre de 2026')).toBeInTheDocument()
  })

  it('numera cada sección y la presenta como una región con su título', () => {
    // Arrange: documento de prueba

    // Act
    renderDocument()

    // Assert
    const titles = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
    expect(titles).toEqual(['1. Primera parte', '2. Segunda parte'])
    expect(screen.getByRole('region', { name: '1. Primera parte' })).toHaveTextContent('Primer párrafo.Segundo párrafo.')
  })

  it('muestra como lista los puntos de una sección, después de su texto', () => {
    // Arrange: documento de prueba

    // Act
    renderDocument()

    // Assert
    const section = screen.getByRole('region', { name: '2. Segunda parte' })
    expect(within(section).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Un punto', 'Otro punto'])
    expect(within(screen.getByRole('region', { name: '1. Primera parte' })).queryByRole('list')).not.toBeInTheDocument()
  })

  it('avisa de que el texto es preliminar y está pendiente de revisión legal', () => {
    // Arrange: documento de prueba

    // Act
    renderDocument()

    // Assert
    const note = screen.getByRole('note')
    expect(note).toHaveTextContent('Versión preliminar')
    expect(note).toHaveTextContent('pendiente de revisión legal')
  })

  it('enlaza al final con el documento relacionado', () => {
    // Arrange: documento de prueba

    // Act
    renderDocument()

    // Assert
    expect(screen.getByRole('link', { name: 'Ver el otro documento' })).toHaveAttribute('href', '/otro')
  })
})
