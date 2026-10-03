import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import PropertyGallery from '@/features/properties/components/PropertyGallery'

const IMAGES = ['https://example.com/1.jpg', 'https://example.com/2.jpg', 'https://example.com/3.jpg']
const TITLE = 'Casa de prueba'

const mainPhoto = () => screen.getByRole('img', { name: /Casa de prueba, foto/ })

describe('PropertyGallery', () => {
  it('muestra la primera foto como principal', () => {
    // Arrange
    const images = IMAGES

    // Act
    render(<PropertyGallery images={images} title={TITLE} />)

    // Assert
    expect(mainPhoto()).toHaveAttribute('src', IMAGES[0])
    expect(mainPhoto()).toHaveAccessibleName('Casa de prueba, foto 1 de 3')
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('ofrece una miniatura por cada foto y marca la seleccionada', () => {
    // Arrange
    const images = IMAGES

    // Act
    render(<PropertyGallery images={images} title={TITLE} />)

    // Assert
    const thumbnails = screen.getAllByRole('button', { name: /Ver foto/ })
    expect(thumbnails).toHaveLength(3)
    expect(thumbnails[0]).toHaveAttribute('aria-current', 'true')
    expect(thumbnails[1]).not.toHaveAttribute('aria-current')
  })

  it('cambia la foto principal al elegir una miniatura', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<PropertyGallery images={IMAGES} title={TITLE} />)

    // Act
    await user.click(screen.getByRole('button', { name: 'Ver foto 3' }))

    // Assert
    expect(mainPhoto()).toHaveAttribute('src', IMAGES[2])
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver foto 3' })).toHaveAttribute('aria-current', 'true')
  })

  it('con una sola foto no muestra miniaturas ni contador', () => {
    // Arrange
    const images = IMAGES.slice(0, 1)

    // Act
    render(<PropertyGallery images={images} title={TITLE} />)

    // Assert
    expect(mainPhoto()).toHaveAttribute('src', IMAGES[0])
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByText('1 / 1')).not.toBeInTheDocument()
  })
})
