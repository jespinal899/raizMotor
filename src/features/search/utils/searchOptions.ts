import {
  MAX_PRICE_OPTIONS,
  MIN_PRICE_OPTIONS,
  PROPERTY_SORTS,
  PROPERTY_TYPES,
} from '@/features/properties/data/propertyOptions.data'
import type { PropertyOperation, PropertySort, PropertyType } from '@/features/properties/types/property.types'
import type { SelectOption } from '@/shared/types/common.types'
import { formatPrice } from '@/shared/utils/format'

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

/** Opciones de precio de la escala de la operación: "Desde $ 500", "Hasta $ 1,500"… */
const toPriceOptions = (
  scales: Record<PropertyOperation, number[]>,
  operation: PropertyOperation | undefined,
  { any, each }: { any: string; each: string },
): SelectOption[] => [
  { value: ANY_OPTION, label: any },
  ...scales[operation ?? DEFAULT_PRICE_OPERATION].map((price) => ({
    value: String(price),
    label: `${each} ${formatPrice(price)}`,
  })),
]

export const getMinPriceOptions = (operation: PropertyOperation | undefined): SelectOption[] =>
  toPriceOptions(MIN_PRICE_OPTIONS, operation, { any: 'Sin mínimo', each: 'Desde' })

export const getMaxPriceOptions = (operation: PropertyOperation | undefined): SelectOption[] =>
  toPriceOptions(MAX_PRICE_OPTIONS, operation, { any: 'Sin límite', each: 'Hasta' })

/** Opciones de una cantidad mínima: "1 o más", "2 o más"… hasta `highest`. */
const toMinimumOptions = (highest: number): SelectOption[] => [
  { value: ANY_OPTION, label: 'Cualquiera' },
  ...Array.from({ length: highest }, (_, position) => ({
    value: String(position + 1),
    label: `${position + 1} o más`,
  })),
]

export const BEDROOM_OPTIONS = toMinimumOptions(4)

export const BATHROOM_OPTIONS = toMinimumOptions(3)

export const SORT_OPTIONS: SelectOption[] = [
  { value: ANY_OPTION, label: 'Predeterminado' },
  ...(Object.keys(PROPERTY_SORTS) as PropertySort[]).map((sort) => ({ value: sort, label: PROPERTY_SORTS[sort] })),
]

/** El número de la opción elegida, o ningún filtro si es la de "sin filtrar". */
export const toOptionalNumber = (value: string): number | undefined =>
  value === ANY_OPTION ? undefined : Number(value)

/** Devuelve el valor a mostrar en el desplegable, o "sin filtrar" si no está entre las opciones. */
export const toOptionValue = (options: SelectOption[], selected: string | number | undefined): string => {
  const value = String(selected)
  return options.some((option) => option.value === value) ? value : ANY_OPTION
}
