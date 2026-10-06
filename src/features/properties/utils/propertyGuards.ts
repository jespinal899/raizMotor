import { OPERATIONS, PROPERTY_TYPES } from '@/features/properties/data/propertyOptions.data'
import { REPORT_REASONS } from '@/features/properties/data/reportReasons.data'
import type { PropertyOperation, PropertyType } from '@/features/properties/types/property.types'
import type { ReportReason } from '@/features/properties/types/report.types'

// Object.hasOwn y no `in`: evita aceptar claves heredadas como "constructor" o "toString".
const isOwnKey = (record: object, value: unknown): value is string =>
  typeof value === 'string' && Object.hasOwn(record, value)

export const isPropertyOperation = (value: unknown): value is PropertyOperation => isOwnKey(OPERATIONS, value)

export const isPropertyType = (value: unknown): value is PropertyType => isOwnKey(PROPERTY_TYPES, value)

export const isReportReason = (value: unknown): value is ReportReason => isOwnKey(REPORT_REASONS, value)

export const findPropertyTypeBySlug = (slug: string | undefined): PropertyType | undefined =>
  Object.keys(PROPERTY_TYPES)
    .filter(isPropertyType)
    .find((type) => PROPERTY_TYPES[type].slug === slug)
