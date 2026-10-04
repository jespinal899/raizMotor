import { MAX_PRICE_OPTIONS, PROPERTY_TYPES } from '@/features/properties/data/propertyOptions.data'
import type { PropertyOperation, PropertyType } from '@/features/properties/types/property.types'
import { formatPrice } from '@/shared/utils/format'

export interface SelectOption {
  value: string
  label: string
}

/** Valor del desplegable que significa "sin filtrar por este campo". */
export const ANY_OPTION = 'todos'

/** Dos filas completas en la grilla de tres columnas. */
export const RESULTS_PER_PAGE = 6

const DEFAULT_PRICE_OPERATION: PropertyOperation = 'venta'

export const TYPE_OPTIONS: SelectOption[] = [
  { value: ANY_OPTION, label: 'Todos los tipos' },
  ...(Object.keys(PROPERTY_TYPES) as PropertyType[]).map((type) => ({
    value: type,
    label: PROPERTY_TYPES[type].plural,
  })),
]

export const getMaxPriceOptions = (operation: PropertyOperation | undefined): SelectOption[] => [
  { value: ANY_OPTION, label: 'Sin límite' },
  ...MAX_PRICE_OPTIONS[operation ?? DEFAULT_PRICE_OPERATION].map((price) => ({
    value: String(price),
    label: `Hasta ${formatPrice(price)}`,
  })),
]

/** Devuelve el valor a mostrar en el desplegable, o "sin filtrar" si no está entre las opciones. */
export const toOptionValue = (options: SelectOption[], selected: string | number | undefined): string => {
  const value = String(selected)
  return options.some((option) => option.value === value) ? value : ANY_OPTION
}
