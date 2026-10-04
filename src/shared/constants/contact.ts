export interface SocialNetwork {
  name: string
  /** Sin dirección, la red se muestra como "Próximamente". */
  url?: string
}

interface ContactDetails {
  phone: {
    display: string
    /** Formato internacional sin espacios, el que usan los enlaces tel:. */
    e164: string
  }
  /** Sin dirección, el correo se muestra como "Próximamente". */
  email?: string
  social: SocialNetwork[]
}

export const CONTACT: ContactDetails = {
  phone: {
    display: '+504 8915-0271',
    e164: '+50489150271',
  },
  social: [{ name: 'Instagram' }, { name: 'TikTok' }],
}
