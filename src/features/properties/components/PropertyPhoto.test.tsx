import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PropertyPhoto from '@/features/properties/components/PropertyPhoto'
import { buildImageFile } from '@/test/factories'

const ALT = 'Fachada de la casa'
const photo = () => screen.getByRole('img', { name: ALT })

describe('PropertyPhoto', () => {
  it('con una dirección web la muestra tal cual, sin crear direcciones temporales', () => {
    // Arrange
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL')
    const url = 'https://example.com/fachada.jpg'

    // Act
    render(<PropertyPhoto source={url} alt={ALT} />)

    // Assert
    expect(photo()).toHaveAttribute('src', url)
    expect(createObjectUrl).not.toHaveBeenCalled()
  })

  it('con un archivo guardado en el navegador lo muestra mediante una dirección temporal', () => {
    // Arrange
    const file = buildImageFile({ name: 'fachada.jpg' })

    // Act
    render(<PropertyPhoto source={file} alt={ALT} />)

    // Assert
    expect(photo()).toHaveAttribute('src', 'blob:fachada.jpg')
  })

  it('libera la dirección temporal cuando la foto deja de mostrarse', () => {
    // Arrange
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL')
    const { unmount } = render(<PropertyPhoto source={buildImageFile({ name: 'fachada.jpg' })} alt={ALT} />)

    // Act
    unmount()

    // Assert
    expect(revokeObjectUrl).toHaveBeenCalledExactlyOnceWith('blob:fachada.jpg')
  })

  it('al cambiar de archivo libera la dirección anterior y muestra el nuevo', () => {
    // Arrange
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL')
    const { rerender } = render(<PropertyPhoto source={buildImageFile({ name: 'fachada.jpg' })} alt={ALT} />)

    // Act
    rerender(<PropertyPhoto source={buildImageFile({ name: 'patio.jpg' })} alt={ALT} />)

    // Assert
    expect(photo()).toHaveAttribute('src', 'blob:patio.jpg')
    expect(revokeObjectUrl).toHaveBeenCalledExactlyOnceWith('blob:fachada.jpg')
  })

  it('pasa a la imagen el resto de sus atributos', () => {
    // Arrange
    const url = 'https://example.com/fachada.jpg'

    // Act
    render(<PropertyPhoto source={url} alt={ALT} loading="lazy" className="size-full object-cover" />)

    // Assert
    expect(photo()).toHaveAttribute('loading', 'lazy')
    expect(photo()).toHaveClass('size-full', 'object-cover')
  })
})
