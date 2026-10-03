const priceFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('es-PE')

export const formatPrice = (amount: number) => priceFormatter.format(amount)

export const formatArea = (squareMeters: number) => `${numberFormatter.format(squareMeters)} m²`
