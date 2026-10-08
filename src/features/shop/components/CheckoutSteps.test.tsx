import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CheckoutSteps from '@/features/shop/components/CheckoutSteps'
import type { PaymentMode } from '@/features/shop/data/paymentMode'
import { AGENT_PLANS } from '@/features/shop/data/plans.data'
import { planRequestService } from '@/features/shop/services/planRequestService'
import {
  CARD,
  TRANSFER,
  checkoutForm,
  completePersonStep,
  fillPerson,
  reachConfirmation,
} from '@/test/checkoutForm'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/shop/services/planRequestService', () => ({ planRequestService: { open: vi.fn() } }))

const [PRO] = AGENT_PLANS
const CHAT_URL = 'https://wa.me/50489150271?text=solicitud'
const open = vi.mocked(planRequestService.open)

const setup = (paymentMode: PaymentMode = 'whatsapp') => {
  renderWithRouter(<CheckoutSteps plan={PRO} paymentMode={paymentMode} />)

  return { user: userEvent.setup() }
}

// El símbolo y la cifra van separados por un espacio de no separación.
const textOf = (element: HTMLElement) => element.textContent?.replace(/\s+/g, ' ').trim() ?? ''

// Recorrer los pasos lleva varias interacciones: se da más margen que el de una prueba normal.
describe('CheckoutSteps', { timeout: 20_000 }, () => {
  beforeEach(() => {
    open.mockReset()
    open.mockReturnValue(CHAT_URL)
  })

  it('anuncia los tres pasos y empieza por los datos de la persona', async () => {
    // Arrange: formulario recién abierto

    // Act
    setup()

    // Assert
    const steps = within(screen.getByRole('navigation', { name: 'Pasos para contratar' })).getAllByRole('listitem')
    const expectedSteps = ['Paso 1: Tus datos', 'Paso 2: Pago', 'Paso 3: Confirmación']
    expect(steps).toHaveLength(expectedSteps.length)
    steps.forEach((step, position) => expect(step).toHaveTextContent(expectedSteps[position]))
    expect(steps[0]).toHaveAttribute('aria-current', 'step')
    expect(await checkoutForm.step(1, 'Tus datos')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Atrás' })).not.toBeInTheDocument()
  })

  it('el paso 1 pide nombre y apellido por separado, el DNI o RTN como opcional, el celular y el correo', () => {
    // Arrange: formulario recién abierto

    // Act
    setup()

    // Assert
    expect(checkoutForm.firstName()).toHaveAttribute('autocomplete', 'given-name')
    expect(checkoutForm.lastName()).toHaveAttribute('autocomplete', 'family-name')
    expect(checkoutForm.document()).toHaveAccessibleName(/opcional/)
    expect(checkoutForm.phone()).toHaveAttribute('type', 'tel')
    expect(checkoutForm.email()).toHaveAttribute('type', 'email')
  })

  it('no deja pasar del paso 1 sin los datos y señala lo que falta, salvo el documento', async () => {
    // Arrange
    const { user } = setup()

    // Act
    await user.click(checkoutForm.next())

    // Assert
    expect(checkoutForm.firstName()).toHaveAccessibleDescription('Escribe tu nombre.')
    expect(checkoutForm.lastName()).toHaveAccessibleDescription('Escribe tu apellido.')
    expect(checkoutForm.phone()).toHaveAccessibleDescription('Escribe tu celular.')
    expect(checkoutForm.email()).toHaveAccessibleDescription('Escribe tu correo.')
    expect(checkoutForm.document()).not.toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Revisa los campos marcados antes de continuar.')).toBeInTheDocument()
  })

  it('si se escribe el documento, debe tener forma de DNI o de RTN', async () => {
    // Arrange
    const { user } = setup()
    await fillPerson(user, { document: '0801-1990' })

    // Act
    await user.click(checkoutForm.next())

    // Assert
    expect(checkoutForm.document()).toHaveAccessibleDescription('Escribe los 13 dígitos del DNI o los 14 del RTN.')
  })

  it('el paso 2 resume el plan con su total al mes y pide la forma de pago', async () => {
    // Arrange
    const { user } = setup()

    // Act
    await completePersonStep(user)

    // Assert
    const summary = screen.getByRole('region', { name: 'Resumen de tu plan' })
    expect(within(summary).getByText('Agente Pro')).toBeInTheDocument()
    expect(textOf(within(summary).getByText('Total al mes').nextElementSibling as HTMLElement)).toBe('L 688.85')
    expect(checkoutForm.method(CARD)).toHaveAccessibleDescription(/enlace de pago seguro/)
    expect(checkoutForm.method(TRANSFER)).toHaveAccessibleDescription(/cuenta en BAC Credomatic/)
  })

  it('no deja pasar del paso 2 sin elegir cómo pagar', async () => {
    // Arrange
    const { user } = setup()
    await completePersonStep(user)

    // Act
    await user.click(checkoutForm.next())

    // Assert
    expect(screen.getByRole('radiogroup', { name: 'Forma de pago' })).toHaveAccessibleDescription(
      'Elige cómo quieres pagar.',
    )
  })

  it('se puede volver al paso anterior sin perder lo escrito', async () => {
    // Arrange
    const { user } = setup()
    await completePersonStep(user)

    // Act
    await user.click(checkoutForm.back())

    // Assert
    expect(await checkoutForm.step(1, 'Tus datos')).toBeInTheDocument()
    expect(checkoutForm.firstName()).toHaveValue('Ana')
    expect(checkoutForm.phone()).toHaveValue('9999-9999')
  })

  it('el paso 3 muestra la solicitud completa para revisarla antes de enviarla', async () => {
    // Arrange
    const { user } = setup()

    // Act
    await reachConfirmation(user, { document: '0801199012345', method: TRANSFER })

    // Assert
    const review = screen.getByRole('region', { name: 'Revisa tu solicitud' })
    const rows = within(review)
      .getAllByRole('term')
      .map((term) => `${term.textContent}: ${textOf(term.nextElementSibling as HTMLElement)}`)
    expect(rows).toEqual([
      'Plan: Agente Pro',
      'Total al mes: L 688.85',
      'Forma de pago: Transferencia o depósito',
      'Nombre: Ana Mejía',
      'Documento: DNI 0801199012345',
      'Celular: +504 9999-9999',
      'Correo: ana@gmail.com',
    ])
  })

  it('sin aceptar los términos no abre WhatsApp', async () => {
    // Arrange
    const { user } = setup()
    await reachConfirmation(user)

    // Act
    await user.click(checkoutForm.send())

    // Assert
    expect(open).not.toHaveBeenCalled()
    expect(checkoutForm.terms()).toHaveAccessibleDescription('Acepta los términos y condiciones para continuar.')
  })

  it('con los términos aceptados abre WhatsApp con la solicitud del plan', async () => {
    // Arrange
    const { user } = setup()
    await reachConfirmation(user, { method: TRANSFER })
    await user.click(checkoutForm.terms())

    // Act
    await user.click(checkoutForm.send())

    // Assert
    expect(open).toHaveBeenCalledExactlyOnceWith(PRO, {
      firstName: 'Ana',
      lastName: 'Mejía',
      document: '',
      phone: '+50499999999',
      email: 'ana@gmail.com',
      paymentMethod: 'transferencia',
    })
  })

  it('después recuerda que falta enviar el mensaje y ofrece abrir el chat de nuevo, sin dar nada por recibido', async () => {
    // Arrange
    const { user } = setup()
    await reachConfirmation(user)
    await user.click(checkoutForm.terms())

    // Act
    await user.click(checkoutForm.send())

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Falta un paso: envía el mensaje en WhatsApp')
    expect(screen.getByRole('status')).toHaveTextContent('Hasta que lo envíes no nos llega')
    expect(screen.getByRole('link', { name: 'Abrir WhatsApp de nuevo' })).toHaveAttribute('href', CHAT_URL)
    expect(screen.queryByText(/recibimos|pago exitoso|plan activado/i)).not.toBeInTheDocument()
  })

  it('en el sitio publicado, pagar con tarjeta también termina en WhatsApp: no hay pantalla de pago', async () => {
    // Arrange
    const { user } = setup('whatsapp')

    // Act
    await reachConfirmation(user, { method: CARD })

    // Assert
    expect(checkoutForm.send()).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Número de tarjeta' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Demostración/)).not.toBeInTheDocument()
  })
})

describe('CheckoutSteps: demostración del pago con tarjeta', { timeout: 20_000 }, () => {
  const fillCard = async (user: ReturnType<typeof userEvent.setup>) => {
    const answers = {
      'Número de tarjeta': '4242424242424242',
      Vencimiento: '1230',
      'Código de seguridad': '123',
      'Nombre del titular': 'Ana Mejía',
    }

    for (const [name, value] of Object.entries(answers)) {
      await user.click(screen.getByRole('textbox', { name }))
      await user.paste(value)
    }
  }

  beforeEach(() => {
    open.mockReset()
  })

  it('con tarjeta, el paso 3 es una pantalla de pago marcada como demostración que no cobra nada', async () => {
    // Arrange
    const { user } = setup('demo')

    // Act
    await reachConfirmation(user, { method: CARD })

    // Assert
    expect(screen.getByRole('note')).toHaveTextContent('Demostración del pago con tarjeta')
    expect(screen.getByRole('note')).toHaveTextContent('No se hace ningún cobro')
    expect(screen.getByRole('textbox', { name: 'Número de tarjeta' })).toHaveAttribute('autocomplete', 'off')
    expect(textOf(checkoutForm.pay())).toBe('Pagar L 688.85')
  })

  it('no pasa a la confirmación de muestra sin los datos de la tarjeta', async () => {
    // Arrange
    const { user } = setup('demo')
    await reachConfirmation(user, { method: CARD })
    await user.click(checkoutForm.terms())

    // Act
    await user.click(checkoutForm.pay())

    // Assert
    expect(screen.getByRole('textbox', { name: 'Número de tarjeta' })).toHaveAccessibleDescription(
      'Escribe los 16 dígitos de la tarjeta.',
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('al pulsar pagar muestra la confirmación de muestra, que dice que no se hizo ningún cobro, y no abre WhatsApp', async () => {
    // Arrange
    const { user } = setup('demo')
    await reachConfirmation(user, { method: CARD })
    await fillCard(user)
    await user.click(checkoutForm.terms())

    // Act
    await user.click(checkoutForm.pay())

    // Assert
    const receipt = await screen.findByRole('status')
    expect(receipt).toHaveTextContent('Pago de demostración')
    expect(receipt).toHaveTextContent('No se hizo ningún cobro')
    expect(textOf(receipt)).toContain('Tarjeta terminada en 4242')
    expect(textOf(receipt)).toContain('L 688.85')
    expect(open).not.toHaveBeenCalled()
  })

  it('con transferencia, el paso 3 sigue siendo la solicitud por WhatsApp', async () => {
    // Arrange
    const { user } = setup('demo')

    // Act
    await reachConfirmation(user, { method: TRANSFER })

    // Assert
    expect(checkoutForm.send()).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Número de tarjeta' })).not.toBeInTheDocument()
  })
})
