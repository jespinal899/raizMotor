import { EXCHANGE_RATE } from '@/shared/constants/currency'

/** Formato regional de Honduras: coma para los miles y punto para los decimales. */
const LOCALE = 'es-HN'

const numberFormatter = new Intl.NumberFormat(LOCALE)
const amountFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 })
const exactAmountFormatter = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Entre el símbolo y la cifra, para que no se separen en dos líneas. */
const NON_BREAKING_SPACE = ' '

const withSymbol = (symbol: string, amount: number, formatter: Intl.NumberFormat = amountFormatter) =>
  `${symbol}${NON_BREAKING_SPACE}${formatter.format(amount)}`

/** Un precio en dólares, sin decimales: "$ 285,000". */
export const formatPrice = (dollars: number) => withSymbol('$', dollars)

/** Lo que vale en lempiras un importe en dólares, redondeado al lempira. */
export const toLempiras = (dollars: number, rate: number = EXCHANGE_RATE.lempirasPerDollar) =>
  Math.round(dollars * rate)

/** Un importe en lempiras, sin decimales: "L 599". */
export const formatLempiras = (lempiras: number) => withSymbol('L', lempiras)

/** Un importe en lempiras con sus centavos, como en un cobro: "L 688.85". */
export const formatLempirasExact = (lempiras: number) => withSymbol('L', lempiras, exactAmountFormatter)

/** Un precio en dólares convertido a lempiras: "L 7,663,650". Es aproximado: depende del tipo de cambio. */
export const formatPriceInLempiras = (dollars: number, rate?: number) => formatLempiras(toLempiras(dollars, rate))

// Las partes se piden una a una: el estilo "largo" de la región escribe el día con un cero delante.
const longDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/**
 * Una fecha `AAAA-MM-DD` con el mes en letras: "2 de octubre de 2026". Se lee como día del calendario,
 * sin hora, para que no cambie según la zona horaria de quien la ve.
 */
export const formatLongDate = (isoDate: string) => longDateFormatter.format(new Date(`${isoDate}T00:00:00Z`))

/** Una cantidad con su separador de miles. */
export const formatNumber = (value: number) => numberFormatter.format(value)

export const formatArea = (squareMeters: number) => `${formatNumber(squareMeters)} m²`
