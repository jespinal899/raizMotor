import { screen } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'

/** Los campos y el botón de la cotización, buscados como los percibe quien usa el formulario. */
export const quoteForm = {
  form: () => screen.getByRole('form', { name: 'Cotizar esta propiedad' }),
  fullName: () => screen.getByRole('textbox', { name: 'Nombre y apellido' }),
  email: () => screen.getByRole('textbox', { name: 'Correo' }),
  phone: () => screen.getByRole('textbox', { name: 'Teléfono' }),
  terms: () => screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }),
  submitButton: () => screen.getByRole('button', { name: /^Cotizar$|Enviando/ }),
}

const VALID_APPLICANT = { fullName: 'Ana Mejía', email: 'ana@gmail.com', phone: '99999999' }

/** Pega cada dato de una vez y acepta los términos: escribirlos tecla a tecla haría lentas las pruebas. */
export const fillQuoteForm = async (user: UserEvent, applicant: Partial<typeof VALID_APPLICANT> = {}) => {
  const values = { ...VALID_APPLICANT, ...applicant }

  for (const field of ['fullName', 'email', 'phone'] as const) {
    await user.click(quoteForm[field]())
    await user.paste(values[field])
  }
  await user.click(quoteForm.terms())
}
