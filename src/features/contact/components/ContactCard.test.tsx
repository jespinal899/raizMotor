import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ContactCard from '@/features/contact/components/ContactCard'
import { CONTACT } from '@/shared/constants/contact'

const itemOf = (text: string) => screen.getByText(text).closest('li') as HTMLElement

describe('ContactCard', () => {
  it('muestra el teléfono como enlace para llamar', () => {
    // Arrange
    const { display } = CONTACT.phone

    // Act
    render(<ContactCard />)

    // Assert
    expect(screen.getByRole('link', { name: display })).toHaveAttribute('href', 'tel:+50489150271')
  })

  it('anuncia el correo como próximo mientras no haya una dirección configurada', () => {
    // Arrange
    const emailIsPending = CONTACT.email === undefined

    // Act
    render(<ContactCard />)

    // Assert
    expect(emailIsPending).toBe(true)
    const item = itemOf('Correo')
    expect(within(item).getByText('Próximamente')).toBeInTheDocument()
    expect(within(item).queryByRole('link')).not.toBeInTheDocument()
  })

  it('anuncia como próximas las redes que aún no tienen cuenta, sin enlazarlas', () => {
    // Arrange
    const pendingNetworks = CONTACT.social.filter(({ url }) => !url).map(({ name }) => name)

    // Act
    render(<ContactCard />)

    // Assert
    expect(pendingNetworks).toEqual(['Instagram', 'TikTok'])
    pendingNetworks.forEach((name) => {
      const item = itemOf(name)
      expect(item).toHaveTextContent(`${name} Próximamente`)
      expect(within(item).queryByRole('link')).not.toBeInTheDocument()
    })
  })

  it('el único enlace disponible por ahora es el del teléfono', () => {
    // Arrange: correo y redes aún sin configurar

    // Act
    render(<ContactCard />)

    // Assert
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })
})
