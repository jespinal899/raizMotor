import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ImagePicker from '@/features/properties/components/ImagePicker'
import { MAX_IMAGES } from '@/features/properties/utils/imageFiles'
import { buildImageFile } from '@/test/factories'

interface Overrides {
  files?: File[]
  error?: string
}

const setup = ({ files = [], error }: Overrides = {}) => {
  const onChange = vi.fn()
  render(<ImagePicker files={files} onChange={onChange} error={error} />)

  return { onChange }
}

const addInput = () => screen.getByLabelText('Agregar fotos')
const group = () => screen.getByRole('group', { name: /^Fotos/ })

describe('ImagePicker', () => {
  it('sin fotos, ofrece agregar varias a la vez y solo imágenes', () => {
    // Arrange: lista vacía

    // Act
    setup()

    // Assert
    expect(addInput()).toHaveAttribute('type', 'file')
    expect(addInput()).toHaveAttribute('multiple')
    expect(addInput()).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('al elegir fotos avisa con la lista nueva', async () => {
    // Arrange
    const user = userEvent.setup()
    const photos = [buildImageFile({ name: 'fachada.jpg' }), buildImageFile({ name: 'sala.jpg' })]
    const { onChange } = setup()

    // Act
    await user.upload(addInput(), photos)

    // Assert
    expect(onChange).toHaveBeenCalledExactlyOnceWith(photos)
  })

  it('muestra la vista previa de cada foto y marca la primera como portada', async () => {
    // Arrange
    const files = [buildImageFile({ name: 'fachada.jpg' }), buildImageFile({ name: 'sala.jpg' })]

    // Act
    setup({ files })

    // Assert
    const cover = await screen.findByRole('img', { name: 'Foto 1: fachada.jpg' })
    expect(cover).toHaveAttribute('src', 'blob:fachada.jpg')
    expect(screen.getByRole('img', { name: 'Foto 2: sala.jpg' })).toHaveAttribute('src', 'blob:sala.jpg')
    const [first, second] = within(group()).getAllByRole('listitem')
    expect(first).toHaveTextContent('Portada')
    expect(second).not.toHaveTextContent('Portada')
  })

  it('al quitar una foto avisa con las que quedan', async () => {
    // Arrange
    const user = userEvent.setup()
    const [cover, living] = [buildImageFile({ name: 'fachada.jpg' }), buildImageFile({ name: 'sala.jpg' })]
    const { onChange } = setup({ files: [cover, living] })

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar foto 1' }))

    // Assert
    expect(onChange).toHaveBeenCalledExactlyOnceWith([living])
  })

  it('explica por qué descarta un archivo y deja la lista como estaba', async () => {
    // Arrange
    const user = userEvent.setup({ applyAccept: false })
    const document = buildImageFile({ name: 'escritura.pdf', type: 'application/pdf' })
    const { onChange } = setup()

    // Act
    await user.upload(addInput(), document)

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('escritura.pdf no es una foto JPG, PNG o WebP.')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('agrega las fotos válidas aunque otras de la misma tanda se descarten', async () => {
    // Arrange
    const user = userEvent.setup({ applyAccept: false })
    const photo = buildImageFile({ name: 'fachada.jpg' })
    const document = buildImageFile({ name: 'plano.pdf', type: 'application/pdf' })
    const { onChange } = setup()

    // Act
    await user.upload(addInput(), [document, photo])

    // Assert
    expect(onChange).toHaveBeenCalledExactlyOnceWith([photo])
    expect(screen.getByRole('alert')).toHaveTextContent('plano.pdf no es una foto JPG, PNG o WebP.')
  })

  it('con el máximo de fotos deja de ofrecer agregar más', () => {
    // Arrange
    const files = Array.from({ length: MAX_IMAGES }, (_, index) => buildImageFile({ name: `foto-${index}.jpg` }))

    // Act
    setup({ files })

    // Assert
    expect(screen.queryByLabelText('Agregar fotos')).not.toBeInTheDocument()
    expect(screen.getByText(`Llegaste al máximo de ${MAX_IMAGES} fotos.`)).toBeInTheDocument()
  })

  it('con error, lo muestra y lo enlaza con el grupo de fotos', () => {
    // Arrange
    const error = 'Agrega al menos una foto.'

    // Act
    setup({ error })

    // Assert
    expect(group()).toHaveAttribute('aria-invalid', 'true')
    expect(group()).toHaveAccessibleDescription(error)
  })
})
