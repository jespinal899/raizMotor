import type { Validator } from '@/shared/utils/validators'

/** Dígitos del documento nacional de identificación (DNI). */
const DNI_DIGITS = 13
/** Dígitos del registro tributario nacional (RTN): los del DNI y uno más. */
const RTN_DIGITS = 14

/** El documento sin guiones ni espacios, que es como se guarda o se envía. */
export const toDocumentDigits = (text: string): string => text.replace(/\D/g, '')

/**
 * Comprueba la forma del documento: el largo de un DNI o de un RTN. No puede saber si existe ni de quién
 * es.
 */
export const honduranDocument: Validator = (value) => {
  const { length } = toDocumentDigits(value)

  return length === DNI_DIGITS || length === RTN_DIGITS
    ? undefined
    : `Escribe los ${DNI_DIGITS} dígitos del DNI o los ${RTN_DIGITS} del RTN.`
}

/** El documento con su nombre, que se deduce de su largo: "DNI 0801199012345". */
export const describeDocument = (digits: string): string =>
  `${digits.length === RTN_DIGITS ? 'RTN' : 'DNI'} ${digits}`
