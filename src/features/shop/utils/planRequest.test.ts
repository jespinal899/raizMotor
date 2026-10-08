import { describe, expect, it } from 'vitest'
import { AGENT_PLANS } from '@/features/shop/data/plans.data'
import type { PlanRequest } from '@/features/shop/types/checkout.types'
import {
  buildPlanRequestMessage,
  describePlanRequest,
  planRequestChatUrl,
  toPlanRequest,
} from '@/features/shop/utils/planRequest'
import { BRAND } from '@/shared/constants/brand'
import { CONTACT } from '@/shared/constants/contact'

const [PRO, ELITE] = AGENT_PLANS

const buildRequest = (overrides: Partial<PlanRequest> = {}): PlanRequest => ({
  firstName: 'Ana',
  lastName: 'Mejía',
  document: '',
  phone: '+50499999999',
  email: 'ana@gmail.com',
  paymentMethod: 'tarjeta',
  ...overrides,
})

// El símbolo y la cifra van separados por un espacio de no separación.
const withPlainSpaces = (text: string) => text.replace(/[^\S\n]/g, ' ')
const asLines = (rows: { label: string; value: string }[]) =>
  rows.map(({ label, value }) => withPlainSpaces(`${label}: ${value}`))

describe('toPlanRequest', () => {
  it('deja los datos listos para enviar: sin espacios sobrantes, el documento en dígitos y el celular completo', () => {
    // Arrange
    const written = {
      firstName: '  Ana   María ',
      lastName: ' Mejía  López ',
      document: '0801-1990-12345',
      phone: '9999-9999',
      email: ' ana@gmail.com ',
      paymentMethod: 'transferencia' as const,
      acceptsTerms: true,
    }

    // Act
    const request = toPlanRequest(written, written.paymentMethod)

    // Assert
    expect(request).toEqual({
      firstName: 'Ana María',
      lastName: 'Mejía López',
      document: '0801199012345',
      phone: '+50499999999',
      email: 'ana@gmail.com',
      paymentMethod: 'transferencia',
    })
  })
})

describe('describePlanRequest', () => {
  it('dice qué plan se pide, cuánto se paga al mes, cómo y quién lo pide', () => {
    // Arrange
    const request = buildRequest()

    // Act
    const rows = describePlanRequest(PRO, request)

    // Assert
    expect(asLines(rows)).toEqual([
      'Plan: Agente Pro',
      'Total al mes: L 688.85',
      'Forma de pago: Tarjeta de débito o crédito',
      'Nombre: Ana Mejía',
      'Celular: +504 9999-9999',
      'Correo: ana@gmail.com',
    ])
  })

  it('si la persona dio su documento, lo incluye diciendo si es DNI o RTN', () => {
    // Arrange
    const requests = [buildRequest({ document: '0801199012345' }), buildRequest({ document: '08011990123456' })]

    // Act
    const documents = requests.map((request) => asLines(describePlanRequest(PRO, request))[4])

    // Assert
    expect(documents).toEqual(['Documento: DNI 0801199012345', 'Documento: RTN 08011990123456'])
  })

  it('refleja el plan y la forma de pago elegidos', () => {
    // Arrange
    const request = buildRequest({ paymentMethod: 'transferencia' })

    // Act
    const lines = asLines(describePlanRequest(ELITE, request))

    // Assert
    expect(lines.slice(0, 3)).toEqual([
      'Plan: Agente Élite',
      'Total al mes: L 1,148.85',
      'Forma de pago: Transferencia o depósito',
    ])
  })
})

describe('buildPlanRequestMessage', () => {
  it('saluda diciendo qué se quiere y, debajo, lleva la misma solicitud que se revisó en pantalla', () => {
    // Arrange
    const request = buildRequest({ document: '0801199012345' })

    // Act
    const message = buildPlanRequestMessage(PRO, request)

    // Assert
    expect(withPlainSpaces(message)).toBe(
      [`Hola, quiero contratar un plan de ${BRAND.name}.`, '', ...asLines(describePlanRequest(PRO, request))].join('\n'),
    )
  })
})

describe('planRequestChatUrl', () => {
  it('abre el chat de WhatsApp del sitio con la solicitud ya escrita', () => {
    // Arrange
    const request = buildRequest()

    // Act
    const url = new URL(planRequestChatUrl(PRO, request))

    // Assert
    expect(`${url.origin}${url.pathname}`).toBe(`https://wa.me/${CONTACT.phone.e164.replace('+', '')}`)
    expect(url.searchParams.get('text')).toBe(buildPlanRequestMessage(PRO, request))
  })
})
