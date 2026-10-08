import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CheckoutSteps from '@/features/shop/components/CheckoutSteps'
import type { PaymentMode } from '@/features/shop/data/paymentMode'
import { AGENT_PLANS } from '@/features/shop/data/plans.data'
import { planRequestService } from '@/features/shop/services/planRequestService'
import { CARD, TRANSFER, checkoutForm, completePersonStep, fillPerson, reachPayment } from '@/test/checkoutForm'
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

/** Los datos de una lista, cada uno con su valor. */
const rowsOf = (container: HTMLElement) =>
  within(container)
    .getAllByRole('term')
    .map((term) => `${term.textContent}: ${textOf(term.nextElementSibling as HTMLElement)}`)

const COST_ROWS = ['Subtotal: L 599.00', 'ISV (15 %): L 89.85', 'Total: L 688.85']

// Recorrer los pasos lleva varias interacciones: se da más margen que el de una prueba normal.
describe('CheckoutSteps', { timeout: 20_000 }, () => {
  beforeEach(() => {
    open.mockReset()
    open.mockReturnValue(CHAT_URL)
  })

  it('anuncia los tres pasos, numerados y en orden, y empieza por los datos de suscripción', async () => {
    // Arrange
    const expectedSteps = ['Paso 1: Datos de suscripción', 'Paso 2: Resumen', 'Paso 3: Medio de pago']

    // Act
    setup()

    // Assert
    const steps = within(screen.getByRole('navigation', { name: 'Pasos para contratar' })).getAllByRole('listitem')
    expect(steps).toHaveLength(expectedSteps.length)
    steps.forEach((step, position) => expect(step).toHaveTextContent(expectedSteps[position]))
    expect(steps[0]).toHaveAttribute('aria-current', 'step')
    expect(screen.queryByRole('button', { name: 'Atrás' })).not.toBeInTheDocument()
  })

  it('el paso no repite su nombre a la vista: ya lo dice el indicador, y el rótulo queda solo para lectores de pantalla', async () => {
    // Arrange: formulario recién abierto

    // Act
    setup()

    // Assert
    expect(await checkoutForm.step(1, 'Datos de suscripción')).toHaveClass('sr-only')
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

  it('junto a los datos de suscripción va el resumen de compra, todavía sin casillas', () => {
    // Arrange: formulario recién abierto

    // Act
    setup()

    // Assert
    expect(textOf(checkoutForm.summary())).toContain('Agente Pro L 599 + ISV')
    expect(within(checkoutForm.summary()).getByText('Suscripción mensual')).toBeInTheDocument()
    expect(rowsOf(checkoutForm.summary())).toEqual(COST_ROWS)
    expect(within(checkoutForm.summary()).queryByRole('checkbox')).not.toBeInTheDocument()
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

  it('el paso 2 es el detalle de compra: el plan de pago mensual, con su facturación y su precio sin impuesto', async () => {
    // Arrange
    const { user } = setup()

    // Act
    await completePersonStep(user)

    // Assert
    const detail = screen.getByRole('region', { name: 'Detalle de compra' })
    expect(within(detail).getByText('Revisa los detalles de tu suscripción.')).toBeInTheDocument()
    const billing = [...(within(detail).getByText('Mensual').parentElement as HTMLElement).children]
    expect(billing.map((line) => textOf(line as HTMLElement))).toEqual([
      'Mensual',
      'Facturación mensual',
      'L 599 + ISV',
    ])
    expect(screen.queryByRole('region', { name: 'Tus datos' })).not.toBeInTheDocument()
  })

  it('en el paso 2 el resumen de compra lleva la casilla del código de descuento y la de los términos', async () => {
    // Arrange
    const { user } = setup()

    // Act
    await completePersonStep(user)

    // Assert
    expect(rowsOf(checkoutForm.summary())).toEqual(COST_ROWS)
    expect(within(checkoutForm.summary()).getAllByRole('checkbox')).toEqual([
      checkoutForm.hasDiscountCode(),
      checkoutForm.terms(),
    ])
    expect(within(checkoutForm.summary()).getByRole('link', { name: 'Términos y Condiciones de uso' })).toHaveAttribute(
      'href',
      '/terminos',
    )
  })

  it('sin aceptar los términos no se pasa al pago', async () => {
    // Arrange
    const { user } = setup()
    await completePersonStep(user)

    // Act
    await user.click(checkoutForm.next())

    // Assert
    expect(checkoutForm.terms()).toHaveAccessibleDescription('Acepta los términos y condiciones para continuar.')
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
  })

  it('marcar que se tiene un código muestra dónde escribirlo; aplicarlo no cambia el total: todavía no hay códigos', async () => {
    // Arrange
    const { user } = setup()
    await completePersonStep(user)
    await user.click(checkoutForm.hasDiscountCode())
    await user.type(checkoutForm.coupon(), 'PROMO10')

    // Act
    await user.click(checkoutForm.applyCoupon())

    // Assert
    expect(checkoutForm.coupon()).toHaveAccessibleDescription('Ese código de descuento no es válido.')
    expect(rowsOf(checkoutForm.summary())).toEqual(COST_ROWS)
    expect(open).not.toHaveBeenCalled()
  })

  it('se puede volver al paso anterior sin perder lo escrito', async () => {
    // Arrange
    const { user } = setup()
    await completePersonStep(user)

    // Act
    await user.click(checkoutForm.back())

    // Assert
    expect(await checkoutForm.step(1, 'Datos de suscripción')).toBeInTheDocument()
    expect(checkoutForm.firstName()).toHaveValue('Ana')
    expect(checkoutForm.phone()).toHaveValue('9999-9999')
  })

  it('el paso 3 se titula "Medios de pago" y ofrece la tarjeta o la transferencia bancaria, con el resumen al lado', async () => {
    // Arrange
    const { user } = setup()

    // Act
    await reachPayment(user)

    // Assert
    const payment = screen.getByRole('region', { name: 'Medios de pago' })
    expect(within(payment).getByText('Elige cómo quieres pagar.')).toBeInTheDocument()
    expect(checkoutForm.methods()).toHaveAccessibleName('Selecciona el medio de pago que deseas usar')
    expect(checkoutForm.method(CARD)).toHaveAccessibleDescription(/enlace de pago seguro/)
    expect(checkoutForm.method(TRANSFER)).toHaveAccessibleDescription(/cuenta en BAC Credomatic/)
    expect(rowsOf(checkoutForm.summary())).toEqual(COST_ROWS)
    expect(within(checkoutForm.summary()).queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('sin elegir el medio de pago no abre WhatsApp', async () => {
    // Arrange
    const { user } = setup()
    await reachPayment(user)

    // Act
    await user.click(checkoutForm.send())

    // Assert
    expect(open).not.toHaveBeenCalled()
    expect(checkoutForm.methods()).toHaveAccessibleDescription('Elige cómo quieres pagar.')
  })

  it('con el medio de pago elegido abre WhatsApp con la solicitud del plan', async () => {
    // Arrange
    const { user } = setup()
    await reachPayment(user)
    await user.click(checkoutForm.method(TRANSFER))

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
    await reachPayment(user)
    await user.click(checkoutForm.method(CARD))

    // Act
    await user.click(checkoutForm.send())

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Falta un paso: envía el mensaje en WhatsApp')
    expect(screen.getByRole('status')).toHaveTextContent('Hasta que lo envíes no nos llega')
    expect(screen.getByRole('link', { name: 'Abrir WhatsApp de nuevo' })).toHaveAttribute('href', CHAT_URL)
    expect(screen.queryByText(/recibimos|pago exitoso|plan activado/i)).not.toBeInTheDocument()
  })

  it('en el sitio publicado, elegir tarjeta no abre ninguna pantalla de pago ni habla de suscribir una tarjeta', async () => {
    // Arrange
    const { user } = setup('whatsapp')
    await reachPayment(user)

    // Act
    await user.click(checkoutForm.method(CARD))

    // Assert
    expect(checkoutForm.send()).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Número de tarjeta' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Demostración|Suscribe tu tarjeta/)).not.toBeInTheDocument()
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

  it('el paso 3 invita a suscribir la tarjeta y a elegir cuál usar', async () => {
    // Arrange
    const { user } = setup('demo')

    // Act
    await reachPayment(user)

    // Assert
    const payment = screen.getByRole('region', { name: 'Medios de pago' })
    expect(within(payment).getByText('Suscribe tu tarjeta de forma rápida y fácil.')).toBeInTheDocument()
    expect(checkoutForm.methods()).toHaveAccessibleName('Selecciona la tarjeta que deseas usar')
  })

  it('al elegir tarjeta aparece la pantalla de pago, marcada como demostración que no cobra nada', async () => {
    // Arrange
    const { user } = setup('demo')
    await reachPayment(user)

    // Act
    await user.click(checkoutForm.method(CARD))

    // Assert
    expect(screen.getByRole('note')).toHaveTextContent('Demostración del pago con tarjeta')
    expect(screen.getByRole('note')).toHaveTextContent('No se hace ningún cobro')
    expect(screen.getByRole('textbox', { name: 'Número de tarjeta' })).toHaveAttribute('autocomplete', 'off')
    expect(textOf(checkoutForm.pay())).toBe('Pagar L 688.85')
  })

  it('no pasa a la confirmación de muestra sin los datos de la tarjeta', async () => {
    // Arrange
    const { user } = setup('demo')
    await reachPayment(user)
    await user.click(checkoutForm.method(CARD))

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
    await reachPayment(user)
    await user.click(checkoutForm.method(CARD))
    await fillCard(user)

    // Act
    await user.click(checkoutForm.pay())

    // Assert
    const receipt = await screen.findByRole('status')
    expect(receipt).toHaveTextContent('Pago de demostración')
    expect(receipt).toHaveTextContent('No se hizo ningún cobro')
    expect(rowsOf(receipt)).toEqual([
      'Plan: Agente Pro',
      'Total al mes: L 688.85',
      'Forma de pago: Tarjeta terminada en 4242',
    ])
    expect(open).not.toHaveBeenCalled()
  })

  it('con transferencia no hay pantalla de pago: la solicitud sale por WhatsApp', async () => {
    // Arrange
    const { user } = setup('demo')
    await reachPayment(user)

    // Act
    await user.click(checkoutForm.method(TRANSFER))

    // Assert
    expect(checkoutForm.send()).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Número de tarjeta' })).not.toBeInTheDocument()
  })
})
