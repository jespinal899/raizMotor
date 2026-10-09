import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import PropertyGallery from '@/features/properties/components/PropertyGallery'
import { buildImageFile } from '@/test/factories'

const IMAGES = ['https://example.com/1.jpg', 'https://example.com/2.jpg', 'https://example.com/3.jpg']
const TEN_IMAGES = Array.from({ length: 10 }, (_, position) => `https://example.com/${position + 1}.jpg`)
const TITLE = 'Casa de prueba'

const mainPhoto = () => screen.getByRole('img', { name: /Casa de prueba, foto/ })
const thumbnails = () => screen.getAllByRole('button', { name: /^Ver foto \d+$/ })
const moreTile = (remaining: number) => screen.getByRole('button', { name: `Ver ${remaining} fotos más` })
const enlargeButton = () => screen.getByRole('button', { name: /^Ver a pantalla completa/ })
const viewer = () => screen.findByRole('dialog', { name: 'Fotos de Casa de prueba' })

/** Lo que enseña el visor: la foto, su contador y sus flechas, buscados dentro de él. */
const inViewer = (dialog: HTMLElement) => ({
  photo: () => within(dialog).getByRole('img', { name: /Casa de prueba, foto/ }),
  next: () => within(dialog).getByRole('button', { name: 'Foto siguiente' }),
  previous: () => within(dialog).getByRole('button', { name: 'Foto anterior' }),
  close: () => within(dialog).getByRole('button', { name: 'Cerrar' }),
})

/** Abre el visor como lo haría una persona: pulsando la foto grande. */
const openViewer = async (images: string[] = IMAGES) => {
  const user = userEvent.setup()
  render(<PropertyGallery images={images} title={TITLE} />)
  await user.click(enlargeButton())
  const dialog = await viewer()
  // El visor recibe el foco un fotograma después de aparecer; hasta entonces el teclado no le llega.
  await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement))

  return { user, dialog, ...inViewer(dialog) }
}

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
    expect(thumbnails()).toHaveLength(3)
    expect(thumbnails()[0]).toHaveAttribute('aria-current', 'true')
    expect(thumbnails()[1]).not.toHaveAttribute('aria-current')
  })

  it('elegir una miniatura cambia la foto principal ahí mismo, sin abrir el visor', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<PropertyGallery images={IMAGES} title={TITLE} />)

    // Act
    await user.click(screen.getByRole('button', { name: 'Ver foto 3' }))

    // Assert
    expect(mainPhoto()).toHaveAttribute('src', IMAGES[2])
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver foto 3' })).toHaveAttribute('aria-current', 'true')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('con una sola foto no muestra miniaturas ni contador', () => {
    // Arrange
    const images = IMAGES.slice(0, 1)

    // Act
    render(<PropertyGallery images={images} title={TITLE} />)

    // Assert
    expect(mainPhoto()).toHaveAttribute('src', IMAGES[0])
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.queryByText('1 / 1')).not.toBeInTheDocument()
  })

  it('muestra también las fotos guardadas en este navegador y permite cambiar entre ellas', async () => {
    // Arrange
    const user = userEvent.setup()
    const images = [buildImageFile({ name: 'fachada.jpg' }), buildImageFile({ name: 'patio.jpg' })]
    render(<PropertyGallery images={images} title={TITLE} />)
    const firstShown = mainPhoto().getAttribute('src')

    // Act
    await user.click(screen.getByRole('button', { name: 'Ver foto 2' }))

    // Assert
    expect(firstShown).toBe('blob:fachada.jpg')
    expect(mainPhoto()).toHaveAttribute('src', 'blob:patio.jpg')
  })

  it('con cuatro fotos caben todas en la tira: no hace falta decir que hay más', () => {
    // Arrange
    const images = TEN_IMAGES.slice(0, 4)

    // Act
    render(<PropertyGallery images={images} title={TITLE} />)

    // Assert
    expect(thumbnails()).toHaveLength(4)
    expect(screen.queryByRole('button', { name: /fotos más/ })).not.toBeInTheDocument()
  })

  it('con más fotos de las que caben, la última casilla dice cuántas faltan', () => {
    // Arrange
    const images = TEN_IMAGES

    // Act
    render(<PropertyGallery images={images} title={TITLE} />)

    // Assert
    expect(thumbnails()).toHaveLength(3)
    expect(moreTile(7)).toHaveTextContent('+7')
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('en la ficha la foto grande no lleva flechas: el carrusel está en el visor', () => {
    // Arrange
    const images = IMAGES

    // Act
    render(<PropertyGallery images={images} title={TITLE} />)

    // Assert
    expect(screen.queryByRole('button', { name: 'Foto siguiente' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Foto anterior' })).not.toBeInTheDocument()
    expect(enlargeButton()).toHaveAccessibleName('Ver a pantalla completa: Casa de prueba, foto 1 de 3')
  })

  it('pulsar la foto grande abre el visor a pantalla completa en esa misma foto', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<PropertyGallery images={IMAGES} title={TITLE} />)
    await user.click(screen.getByRole('button', { name: 'Ver foto 2' }))

    // Act
    await user.click(enlargeButton())

    // Assert
    const dialog = await viewer()
    expect(inViewer(dialog).photo()).toHaveAttribute('src', IMAGES[1])
    expect(inViewer(dialog).photo()).toHaveAccessibleName('Casa de prueba, foto 2 de 3')
    expect(within(dialog).getByText('2 / 3')).toBeInTheDocument()
  })

  it('pulsar la casilla "+7" abre el visor en la primera foto que no cabía en la tira', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<PropertyGallery images={TEN_IMAGES} title={TITLE} />)

    // Act
    await user.click(moreTile(7))

    // Assert
    const dialog = await viewer()
    expect(inViewer(dialog).photo()).toHaveAttribute('src', TEN_IMAGES[3])
    expect(within(dialog).getByText('4 / 10')).toBeInTheDocument()
  })

  it('en el visor, la flecha "siguiente" pasa a la foto siguiente', async () => {
    // Arrange
    const { user, dialog, photo, next } = await openViewer()

    // Act
    await user.click(next())

    // Assert
    expect(photo()).toHaveAttribute('src', IMAGES[1])
    expect(within(dialog).getByText('2 / 3')).toBeInTheDocument()
  })

  it('en el visor, la flecha "anterior" desde la primera foto da la vuelta hasta la última', async () => {
    // Arrange
    const { user, dialog, photo, previous } = await openViewer()

    // Act
    await user.click(previous())

    // Assert
    expect(photo()).toHaveAttribute('src', IMAGES[2])
    expect(within(dialog).getByText('3 / 3')).toBeInTheDocument()
  })

  it('en el visor también se pasa de foto con las flechas del teclado', async () => {
    // Arrange
    const { user, photo } = await openViewer()

    // Act
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowLeft}')

    // Assert
    expect(photo()).toHaveAttribute('src', IMAGES[1])
  })

  it.each([
    { when: 'la foto siguiente entra por la derecha', control: 'next', side: 'right' },
    { when: 'la foto anterior entra por la izquierda', control: 'previous', side: 'left' },
  ] as const)('en el visor, $when', async ({ control, side }) => {
    // Arrange
    const { user, photo, ...controls } = await openViewer()

    // Act
    await user.click(controls[control]())

    // Assert
    expect(photo().className).toContain(`slide-in-from-${side}`)
  })

  it('al volver a abrir el visor, la foto aparece en su sitio, sin entrar desde un lado', async () => {
    // Arrange
    const { user, next, close } = await openViewer()
    await user.click(next())
    await user.click(close())
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    // Act
    await user.click(enlargeButton())

    // Assert
    const reopened = await viewer()
    expect(inViewer(reopened).photo().className).not.toContain('slide-in-from')
  })

  it('la X cierra el visor', async () => {
    // Arrange
    const { user, close } = await openViewer()

    // Act
    await user.click(close())

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('al cerrar el visor, la ficha se queda en la última foto que se vio', async () => {
    // Arrange
    const { user, next, close } = await openViewer(TEN_IMAGES)
    await user.click(next())
    await user.click(next())
    await user.click(next())

    // Act
    await user.click(close())

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(mainPhoto()).toHaveAttribute('src', TEN_IMAGES[3])
    expect(moreTile(7)).toHaveAttribute('aria-current', 'true')
    expect(thumbnails().every((thumbnail) => !thumbnail.hasAttribute('aria-current'))).toBe(true)
  })

  it('con una sola foto, el visor la amplía sin flechas ni contador', async () => {
    // Arrange
    const images = IMAGES.slice(0, 1)

    // Act
    const { dialog, photo } = await openViewer(images)

    // Assert
    expect(photo()).toHaveAttribute('src', IMAGES[0])
    expect(within(dialog).queryByRole('button', { name: /Foto (siguiente|anterior)/ })).not.toBeInTheDocument()
    expect(within(dialog).queryByText('1 / 1')).not.toBeInTheDocument()
  })
})
