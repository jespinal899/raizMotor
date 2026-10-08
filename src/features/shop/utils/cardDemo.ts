import { required, validate } from '@/shared/utils/validators'
import type { FieldErrors } from '@/shared/utils/validators'

/** Lo que se escribe en la pantalla de pago de demostración. No se guarda ni se envía. */
export interface CardDemoValues {
  number: string
  /** Mes y año: MM/AA. */
  expiry: string
  securityCode: string
  holder: string
}

export type CardDemoErrors = FieldErrors<CardDemoValues>

const CARD_DIGITS = 16
const GROUP_SIZE = 4
const EXPIRY_DIGITS = 4
const MIN_CODE_DIGITS = 3
const MAX_CODE_DIGITS = 4
const EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/

const digitsOf = (text: string, max: number) => text.replace(/\D/g, '').slice(0, max)

/** El número como se lee en una tarjeta, también a medio escribir: solo dígitos, de cuatro en cuatro. */
export const formatCardNumber = (text: string): string =>
  (digitsOf(text, CARD_DIGITS).match(new RegExp(`.{1,${GROUP_SIZE}}`, 'g')) ?? []).join(' ')

/** El vencimiento como mes y año, también a medio escribir: "12/30". */
export const formatCardExpiry = (text: string): string => {
  const digits = digitsOf(text, EXPIRY_DIGITS)

  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

export const formatSecurityCode = (text: string): string => digitsOf(text, MAX_CODE_DIGITS)

/** Comprueba solo la forma de los datos: es una demostración y ninguna tarjeta se consulta ni se cobra. */
export const validateCardDemo = (values: CardDemoValues): CardDemoErrors => ({
  number:
    digitsOf(values.number, CARD_DIGITS).length === CARD_DIGITS
      ? undefined
      : `Escribe los ${CARD_DIGITS} dígitos de la tarjeta.`,
  expiry: EXPIRY_PATTERN.test(values.expiry) ? undefined : 'Escribe el vencimiento como MM/AA.',
  securityCode:
    values.securityCode.length >= MIN_CODE_DIGITS
      ? undefined
      : `Escribe los ${MIN_CODE_DIGITS} o ${MAX_CODE_DIGITS} dígitos del código.`,
  holder: validate(values.holder, [required('Escribe el nombre como aparece en la tarjeta.')]),
})

/** Los cuatro últimos dígitos: lo único de la tarjeta que se muestra después. */
export const lastCardDigits = (number: string): string => digitsOf(number, CARD_DIGITS).slice(-GROUP_SIZE)
