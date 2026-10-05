import { expect } from 'vitest'

/** Clave fija para llamar a un servicio en una prueba. */
export const TEST_OPERATION_KEY = '0123456789abcdef0123456789abcdef'

/** Coincide con cualquier clave de operación: en una prueba importa que se envíe, no cuál sea. */
export const anyOperationKey = (): string => expect.stringMatching(/^[0-9a-f]{32}$/)
