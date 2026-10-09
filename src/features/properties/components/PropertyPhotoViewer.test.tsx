import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PropertyPhotoViewer from '@/features/properties/components/PropertyPhotoViewer'

const IMAGES = ['https://example.com/1.jpg', 'https://example.com/2.jpg', 'https://example.com/3.jpg']
const TITLE = 'Casa de prueba'
/** Como el dedo o el botón principal del ratón: el único con el que se desliza. */
const POINTER = { isPrimary: true, button: 0, pointerId: 1 }

interface Viewing {
  images?: string[]
  selected?: number
}

const setup = async ({ images = IMAGES, selected = 0 }: Viewing = {}) => {
  const onSelect = vi.fn()
  render(
    <PropertyPhotoViewer images={images} title={TITLE} selected={selected} isOpen onSelect={onSelect} onClose={vi.fn()} />,
  )

  return { onSelect, viewer: await screen.findByRole('dialog', { name: `Fotos de ${TITLE}` }) }
}

/** Arrastra sobre el visor, desde el centro, la distancia indicada y suelta. */
const swipe = (surface: Element, x: number, y = 0) => {
  fireEvent.pointerDown(surface, { ...POINTER, clientX: 400, clientY: 300 })
  fireEvent.pointerMove(surface, { ...POINTER, clientX: 400 + x, clientY: 300 + y })
  fireEvent.pointerUp(surface, { ...POINTER, clientX: 400 + x, clientY: 300 + y })
}

describe('PropertyPhotoViewer: deslizar', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('deslizar hacia la izquierda pasa a la foto siguiente', async () => {
    // Arrange
    const { onSelect, viewer } = await setup({ selected: 0 })

    // Act
    swipe(viewer, -150)

    // Assert
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(1)
  })

  it('deslizar hacia la derecha vuelve a la foto anterior', async () => {
    // Arrange
    const { onSelect, viewer } = await setup({ selected: 1 })

    // Act
    swipe(viewer, 150)

    // Assert
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(0)
  })

  it('en la primera foto, deslizar hacia la derecha da la vuelta hasta la última, como la flecha', async () => {
    // Arrange
    const { onSelect, viewer } = await setup({ selected: 0 })

    // Act
    swipe(viewer, 150)

    // Assert
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(IMAGES.length - 1)
  })

  it('también se desliza desde la propia foto, sin que el navegador la arrastre como imagen', async () => {
    // Arrange
    const { onSelect } = await setup({ selected: 0 })
    const photo = screen.getByRole('img', { name: `${TITLE}, foto 1 de 3` })

    // Act
    swipe(photo, -150)

    // Assert
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(1)
    expect(photo).toHaveAttribute('draggable', 'false')
  })

  it('mientras se arrastra, la foto acompaña al dedo', async () => {
    // Arrange
    const { viewer } = await setup()
    const photo = screen.getByRole('img', { name: `${TITLE}, foto 1 de 3` })
    fireEvent.pointerDown(viewer, { ...POINTER, clientX: 400, clientY: 300 })

    // Act
    fireEvent.pointerMove(viewer, { ...POINTER, clientX: 330, clientY: 300 })

    // Assert
    expect(photo).toHaveStyle({ transform: 'translateX(-70px)' })
  })

  it.each([
    { when: 'un toque sobre la foto', x: 0, y: 0 },
    { when: 'un arrastre corto', x: -20, y: 0 },
    { when: 'un gesto hacia abajo', x: -60, y: 200 },
  ])('$when no cambia de foto', async ({ x, y }) => {
    // Arrange
    const { onSelect, viewer } = await setup()

    // Act
    swipe(viewer, x, y)

    // Assert
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('arrastrar desde una flecha no desliza: la flecha sigue siendo un botón', async () => {
    // Arrange
    const { onSelect } = await setup()

    // Act
    swipe(screen.getByRole('button', { name: 'Foto siguiente' }), -150)

    // Assert
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('tiene ya descargadas las fotos de al lado, para que al deslizar no haya que esperarlas', async () => {
    // Arrange
    const selected = 0

    // Act
    const { viewer } = await setup({ selected })

    // Assert
    const downloaded = [...viewer.querySelectorAll('img')].map((photo) => photo.getAttribute('src'))
    expect(downloaded).toEqual([IMAGES[0], IMAGES[1], IMAGES[2]])
    expect(screen.getAllByRole('img')).toHaveLength(1)
  })

  it('con la foto ampliada con dos dedos, el dedo la recorre en lugar de pasar a otra', async () => {
    // Arrange
    vi.stubGlobal('visualViewport', Object.assign(new EventTarget(), { scale: 2 }))
    const { onSelect, viewer } = await setup()

    // Act
    swipe(viewer, -150)

    // Assert
    expect(onSelect).not.toHaveBeenCalled()
    expect(viewer.className).not.toContain('touch-pan-y')
  })

  it('con la foto ampliada, las flechas siguen pasando de foto', async () => {
    // Arrange
    vi.stubGlobal('visualViewport', Object.assign(new EventTarget(), { scale: 2 }))
    const { onSelect } = await setup()

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }))

    // Assert
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(1)
  })

  it('con una sola foto no hay a dónde deslizar', async () => {
    // Arrange
    const { onSelect, viewer } = await setup({ images: [IMAGES[0]] })

    // Act
    swipe(viewer, -150)

    // Assert
    expect(onSelect).not.toHaveBeenCalled()
  })
})
