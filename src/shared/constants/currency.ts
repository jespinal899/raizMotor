/**
 * Tipo de cambio de referencia del Banco Central de Honduras: lempiras por dólar, y el día en que se
 * publicó. Los anuncios guardan su precio en dólares, y con él se calcula el importe aproximado en
 * lempiras que se muestra al lado.
 *
 * Mientras no haya un servidor que lo consulte, se actualiza a mano: el valor y su fecha.
 */
export const EXCHANGE_RATE = {
  lempirasPerDollar: 26.89,
  asOf: '2026-10-02',
} as const
