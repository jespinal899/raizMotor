import { describe, expect, it } from 'vitest'
import { contactChatUrl } from '@/features/contact/utils/contactChat'
import type { ContactTopic } from '@/features/contact/types/contact.types'
import { BRAND } from '@/shared/constants/brand'
import { CONTACT } from '@/shared/constants/contact'

const chatText = (url: string) => new URL(url).searchParams.get('text')

describe('contactChatUrl', () => {
  it('abre el chat con el teléfono del sitio', () => {
    // Arrange: consulta general

    // Act
    const url = contactChatUrl()

    // Assert
    expect(new URL(url).pathname).toBe(`/${CONTACT.phone.e164.replace('+', '')}`)
    expect(chatText(url)).toBe(`Hola, tengo una consulta sobre ${BRAND.name}.`)
  })

  it('con una propiedad, escribe la consulta y su enlace', () => {
    // Arrange
    const topic: ContactTopic = {
      id: 'propiedad:casa-1',
      label: 'Consulta sobre la propiedad',
      title: 'Casa con jardín',
      defaultDescription: 'Me interesa la propiedad "Casa con jardín". ¿Sigue disponible?',
      reference: 'https://sitio/propiedad/casa-1',
    }

    // Act
    const url = contactChatUrl(topic)

    // Assert
    expect(chatText(url)).toBe('Me interesa la propiedad "Casa con jardín". ¿Sigue disponible?\nhttps://sitio/propiedad/casa-1')
  })

  it('con un plan, sin enlace, escribe solo la consulta', () => {
    // Arrange
    const topic: ContactTopic = {
      id: 'plan:inmobiliaria-plus',
      label: 'Consulta sobre el plan',
      title: 'Inmobiliaria Plus',
      defaultDescription: 'Me interesa el plan Inmobiliaria Plus. ¿Me pueden dar más información?',
    }

    // Act
    const url = contactChatUrl(topic)

    // Assert
    expect(chatText(url)).toBe('Me interesa el plan Inmobiliaria Plus. ¿Me pueden dar más información?')
  })
})
