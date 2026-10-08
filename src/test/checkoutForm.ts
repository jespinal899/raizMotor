import { screen } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'

export const CARD = 'Tarjeta de débito o crédito'
export const TRANSFER = 'Transferencia o depósito'

/** Los campos y botones para contratar un plan, buscados como los percibe quien usa el formulario. */
export const checkoutForm = {
  form: () => screen.getByRole('form', { name: 'Formulario para contratar el plan' }),
  firstName: () => screen.getByRole('textbox', { name: 'Nombre' }),
  lastName: () => screen.getByRole('textbox', { name: 'Apellido' }),
  document: () => screen.getByRole('textbox', { name: /^DNI o RTN/ }),
  phone: () => screen.getByRole('textbox', { name: 'Celular' }),
  email: () => screen.getByRole('textbox', { name: 'Correo' }),
  method: (name: string) => screen.getByRole('radio', { name }),
  terms: () => screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }),
  next: () => screen.getByRole('button', { name: 'Siguiente' }),
  back: () => screen.getByRole('button', { name: 'Atrás' }),
  send: () => screen.getByRole('button', { name: 'Enviar solicitud por WhatsApp' }),
  pay: () => screen.getByRole('button', { name: /^Pagar L/ }),
  /** El título de un paso; aparece cuando se llega a él. */
  step: (position: number, title: string) =>
    screen.findByRole('heading', { level: 2, name: `Paso ${position} de 3: ${title}` }),
}

export const VALID_PERSON = { firstName: 'Ana', lastName: 'Mejía', document: '', phone: '99999999', email: 'ana@gmail.com' }

type Person = typeof VALID_PERSON

/** Pega cada dato de una vez: escribirlos tecla a tecla haría lentas las pruebas. */
export const fillPerson = async (user: UserEvent, person: Partial<Person> = {}) => {
  const values = { ...VALID_PERSON, ...person }

  for (const field of Object.keys(values) as (keyof Person)[]) {
    if (!values[field]) continue
    await user.click(checkoutForm[field]())
    await user.paste(values[field])
  }
}

/** Completa el paso de los datos y pasa al del pago. */
export const completePersonStep = async (user: UserEvent, person: Partial<Person> = {}) => {
  await fillPerson(user, person)
  await user.click(checkoutForm.next())
  await checkoutForm.step(2, 'Pago')
}

interface CheckoutAnswers extends Partial<Person> {
  method?: string
}

/** Recorre los dos primeros pasos y deja el formulario en la confirmación. */
export const reachConfirmation = async (user: UserEvent, { method = CARD, ...person }: CheckoutAnswers = {}) => {
  await completePersonStep(user, person)
  await user.click(checkoutForm.method(method))
  await user.click(checkoutForm.next())
  await checkoutForm.step(3, 'Confirmación')
}
