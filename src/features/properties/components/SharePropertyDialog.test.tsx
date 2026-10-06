import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SharePropertyDialog from '@/features/properties/components/SharePropertyDialog'
import type { Property } from '@/features/properties/types/property.types'
import { buildProperty } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

const PROPERTY = buildProperty({
  id: 'casa-1',
  title: 'Casa amplia con patio',
  operation: 'venta',
  price: 145000,
  district: 'Colonia Trejo',
  city: 'San Pedro Sula',
  image: 'https://example.com/portada.jpg',
})
const LINK = `${window.location.origin}/propiedad/casa-1`

/** Abre la ventana como lo haría una persona: con el botón de compartir. */
const openDialog = async (property: Property = PROPERTY) => {
  const user = userEvent.setup()
  renderWithRouter(<SharePropertyDialog property={property} />)
  await user.click(screen.getByRole('button', { name: 'Compartir' }))

  return { user, dialog: await screen.findByRole('dialog', { name: 'Compartir ficha' }) }
}

const textOf = (element: HTMLElement) => element.textContent?.replace(/\s+/g, ' ').trim()

describe('SharePropertyDialog', () => {
  it('hasta que se pulsa "Compartir" no muestra la ventana', () => {
    // Arrange: ficha recién abierta

    // Act
    renderWithRouter(<SharePropertyDialog property={PROPERTY} />)

    // Assert
    expect(screen.getByRole('button', { name: 'Compartir' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('el botón es solo el icono, y se llama "Compartir" para quien no lo ve', () => {
    // Arrange: ficha recién abierta

    // Act
    renderWithRouter(<SharePropertyDialog property={PROPERTY} />)

    // Assert
    const share = screen.getByRole('button', { name: 'Compartir' })
    expect(share.textContent).toBe('')
    expect(share).toHaveAttribute('title', 'Compartir')
  })

  it('presenta la ficha que se va a compartir: foto principal, título, ubicación y precio', async () => {
    // Arrange: propiedad del catálogo

    // Act
    const { dialog } = await openDialog()

    // Assert
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/portada.jpg')
    expect(within(dialog).getByText('Casa amplia con patio')).toBeInTheDocument()
    expect(within(dialog).getByText('Colonia Trejo, San Pedro Sula')).toBeInTheDocument()
    expect(textOf(within(dialog).getByText(/145,000/))).toBe('$ 145,000')
  })

  it('ofrece enviarla por WhatsApp con el resumen y el enlace de la ficha', async () => {
    // Arrange: propiedad del catálogo

    // Act
    const { dialog } = await openDialog()

    // Assert
    const whatsApp = within(dialog).getByRole('link', { name: 'WhatsApp' })
    const message = new URL(whatsApp.getAttribute('href') ?? '').searchParams.get('text') ?? ''
    expect(whatsApp).toHaveAttribute('href', expect.stringContaining('https://wa.me/'))
    expect(message.replace(/[^\S\n]+/g, ' ')).toBe(`Casa amplia con patio · $ 145,000 · Colonia Trejo, San Pedro Sula\n${LINK}`)
  })

  it('WhatsApp se abre en otra pestaña, sin dar a esa página acceso a esta', async () => {
    // Arrange: propiedad del catálogo

    // Act
    const { dialog } = await openDialog()

    // Assert
    const whatsApp = within(dialog).getByRole('link', { name: 'WhatsApp' })
    expect(whatsApp).toHaveAttribute('target', '_blank')
    expect(whatsApp).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('deja el enlace de la ficha a la vista', async () => {
    // Arrange: propiedad del catálogo

    // Act
    const { dialog } = await openDialog()

    // Assert
    const link = within(dialog).getByRole('textbox', { name: 'Enlace de la ficha' })
    expect(link).toHaveValue(LINK)
    expect(link).toHaveAttribute('readonly')
  })

  it('copia el enlace de la ficha y lo confirma', async () => {
    // Arrange
    const { user, dialog } = await openDialog()

    // Act
    await user.click(within(dialog).getByRole('button', { name: 'Copiar enlace' }))

    // Assert
    expect(await navigator.clipboard.readText()).toBe(LINK)
    expect(await within(dialog).findByRole('status')).toHaveTextContent('Enlace copiado.')
  })

  it('si el navegador no deja copiar, lo dice y pide copiarlo a mano', async () => {
    // Arrange
    const { user, dialog } = await openDialog()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new DOMException('Sin permiso', 'NotAllowedError'))

    // Act
    await user.click(within(dialog).getByRole('button', { name: 'Copiar enlace' }))

    // Assert
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'No pudimos copiarlo. Selecciona el enlace y cópialo a mano.',
    )
  })

  it('en un anuncio guardado solo en este navegador advierte de que el enlace no servirá a otras personas', async () => {
    // Arrange
    const local = buildProperty({ ...PROPERTY, localOnly: true })

    // Act
    const { dialog } = await openDialog(local)

    // Assert
    const note = within(dialog).getByRole('note')
    expect(note).toHaveTextContent('Quien reciba el enlace no podrá ver este anuncio')
    expect(note).toHaveTextContent('Está guardado solo en este navegador.')
  })

  it('en una propiedad del catálogo no hace esa advertencia', async () => {
    // Arrange: propiedad del catálogo

    // Act
    const { dialog } = await openDialog()

    // Assert
    expect(within(dialog).queryByRole('note')).not.toBeInTheDocument()
  })

  it('se cierra con su botón "Cerrar" y, al volver a abrirla, ya no dice que el enlace se copió', async () => {
    // Arrange
    const { user, dialog } = await openDialog()
    await user.click(within(dialog).getByRole('button', { name: 'Copiar enlace' }))
    await within(dialog).findByRole('status')

    // Act
    await user.click(within(dialog).getByRole('button', { name: 'Cerrar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Compartir' }))

    // Assert
    const reopened = await screen.findByRole('dialog', { name: 'Compartir ficha' })
    expect(within(reopened).queryByRole('status')).not.toBeInTheDocument()
  })
})
