const priceFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('es-PE')

export const formatPrice = (amount: number) => priceFormatter.format(amount)

/** Una cantidad con su separador de miles. */
export const formatNumber = (value: number) => numberFormatter.format(value)

export const formatArea = (squareMeters: number) => `${formatNumber(squareMeters)} m²`
