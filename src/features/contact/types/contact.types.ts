export interface ContactFormValues {
  name: string
  email: string
  /** Opcional: queda vacío si el visitante no lo indica. */
  phone: string
  description: string
}

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>

export interface ContactMessage extends ContactFormValues {
  /** Enlace a aquello por lo que se consulta, p. ej. la página de una propiedad. */
  reference?: string
}

/** Estado del envío: `unavailable` significa que el envío por correo aún no está configurado. */
export type ContactFormStatus = 'idle' | 'sending' | 'sent' | 'unavailable' | 'failed'

/** Motivo de la consulta cuando se llega desde una propiedad o un plan. */
export interface ContactTopic {
  /** Cambia con el motivo; sirve para reiniciar el formulario. */
  id: string
  label: string
  title: string
  detail?: string
  defaultDescription: string
  reference?: string
}
