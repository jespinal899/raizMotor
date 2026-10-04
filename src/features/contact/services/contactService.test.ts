import { describe, expect, it } from 'vitest'
import {
  ContactUnavailableError,
  contactService,
  createPendingContactService,
} from '@/features/contact/services/contactService'
import type { ContactMessage } from '@/features/contact/types/contact.types'

const MESSAGE: ContactMessage = {
  name: 'Ana',
  email: 'ana@gmail.com',
  phone: '',
  description: 'Quiero publicar mi casa.',
}

describe('createPendingContactService', () => {
  it('rechaza el envío indicando que aún no está configurado, en lugar de fingirlo', async () => {
    // Arrange
    const service = createPendingContactService()

    // Act
    const sending = service.send(MESSAGE)

    // Assert
    await expect(sending).rejects.toBeInstanceOf(ContactUnavailableError)
  })
})

describe('ContactUnavailableError', () => {
  it('es un Error con nombre propio, para distinguirlo de un fallo de red', () => {
    // Arrange: no necesita datos

    // Act
    const error = new ContactUnavailableError()

    // Assert
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('ContactUnavailableError')
  })
})

describe('contactService', () => {
  it('mientras no se configure el correo, el servicio de la aplicación no entrega mensajes', async () => {
    // Arrange
    const service = contactService

    // Act
    const sending = service.send(MESSAGE)

    // Assert
    await expect(sending).rejects.toBeInstanceOf(ContactUnavailableError)
  })
})
