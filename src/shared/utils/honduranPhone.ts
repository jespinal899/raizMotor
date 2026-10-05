import type { Validator } from '@/shared/utils/validators'

/** Prefijo internacional de Honduras. En los formularios va fijo: la persona solo escribe su número. */
export const HONDURAS_DIAL_CODE = '+504'

const DIAL_DIGITS = HONDURAS_DIAL_CODE.replace(/\D/g, '')
const LOCAL_DIGITS = 8
/** Los números del país se escriben en dos grupos: 9999-9999. */
const GROUP_SIZE = 4
/** Con qué empiezan los números del país: 2 los fijos; 3, 7, 8 y 9 los móviles. */
const FIRST_DIGITS = ['2', '3', '7', '8', '9']

const toLocalDigits = (text: string): string => {
  const digits = text.replace(/\D/g, '')
  // Quien pega el número completo trae también el prefijo del país: se descarta para no repetirlo.
  const hasDialCode = digits.length > LOCAL_DIGITS && digits.startsWith(DIAL_DIGITS)

  return (hasDialCode ? digits.slice(DIAL_DIGITS.length) : digits).slice(0, LOCAL_DIGITS)
}

/** El número local como se escribe en Honduras, también a medio escribir: solo dígitos y con su guion. */
export const formatLocalPhone = (text: string): string => {
  const digits = toLocalDigits(text)

  return digits.length > GROUP_SIZE ? `${digits.slice(0, GROUP_SIZE)}-${digits.slice(GROUP_SIZE)}` : digits
}

/** El número completo para guardarlo o enviarlo: prefijo del país y dígitos, sin separadores. */
export const toInternationalPhone = (local: string): string => `${HONDURAS_DIAL_CODE}${toLocalDigits(local)}`

/**
 * Comprueba la forma del número: su largo y que empiece como los del país. No puede saber si la
 * línea existe ni de quién es; eso solo lo confirma un código enviado a ese número.
 */
export const honduranPhone: Validator = (value) => {
  const digits = toLocalDigits(value)

  if (digits.length < LOCAL_DIGITS) return `Escribe los ${LOCAL_DIGITS} dígitos de tu número.`
  if (!FIRST_DIGITS.includes(digits[0])) {
    return `Revisa el número: en Honduras empiezan por ${FIRST_DIGITS.slice(0, -1).join(', ')} o ${FIRST_DIGITS.at(-1)}.`
  }

  return undefined
}
