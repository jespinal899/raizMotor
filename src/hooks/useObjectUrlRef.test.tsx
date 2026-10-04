import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useObjectUrlRef } from '@/hooks/useObjectUrlRef'
import { buildImageFile } from '@/test/factories'

const Preview = ({ file }: { file: File }) => {
  const previewRef = useObjectUrlRef(file)

  return <img ref={previewRef} alt="Vista previa" />
}

const image = () => screen.getByRole('img', { name: 'Vista previa' })

describe('useObjectUrlRef', () => {
  it('muestra el archivo en la imagen mediante una dirección temporal', () => {
    // Arrange
    const photo = buildImageFile({ name: 'fachada.jpg' })
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fachada')

    // Act
    render(<Preview file={photo} />)

    // Assert
    expect(create).toHaveBeenCalledExactlyOnceWith(photo)
    expect(image()).toHaveAttribute('src', 'blob:fachada')
  })

  it('no vuelve a crear la dirección mientras el archivo sea el mismo', () => {
    // Arrange
    const photo = buildImageFile({ name: 'fachada.jpg' })
    const create = vi.spyOn(URL, 'createObjectURL')
    const { rerender } = render(<Preview file={photo} />)

    // Act
    rerender(<Preview file={photo} />)

    // Assert
    expect(create).toHaveBeenCalledOnce()
  })

  it('libera la dirección cuando la imagen deja de mostrarse', () => {
    // Arrange
    const photo = buildImageFile({ name: 'fachada.jpg' })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fachada')
    const revoke = vi.spyOn(URL, 'revokeObjectURL')
    const { unmount } = render(<Preview file={photo} />)

    // Act
    unmount()

    // Assert
    expect(revoke).toHaveBeenCalledExactlyOnceWith('blob:fachada')
  })

  it('al cambiar de archivo libera la dirección anterior y muestra la nueva', () => {
    // Arrange
    const first = buildImageFile({ name: 'fachada.jpg' })
    const second = buildImageFile({ name: 'sala.jpg' })
    const revoke = vi.spyOn(URL, 'revokeObjectURL')
    const { rerender } = render(<Preview file={first} />)

    // Act
    rerender(<Preview file={second} />)

    // Assert
    expect(revoke).toHaveBeenCalledExactlyOnceWith('blob:fachada.jpg')
    expect(image()).toHaveAttribute('src', 'blob:sala.jpg')
  })
})
