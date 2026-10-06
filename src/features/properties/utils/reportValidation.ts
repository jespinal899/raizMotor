import type { ReportFormErrors, ReportFormValues } from '@/features/properties/types/report.types'
import { isReportReason } from '@/features/properties/utils/propertyGuards'
import { maxLength, required, validate } from '@/shared/utils/validators'
import type { Validator } from '@/shared/utils/validators'

/** Lo comparte el formulario, para que el campo y su regla no puedan decir cosas distintas. */
export const MAX_REPORT_DETAILS_LENGTH = 500

const DETAILS_LIMIT = maxLength(
  MAX_REPORT_DETAILS_LENGTH,
  `El comentario no puede pasar de ${MAX_REPORT_DETAILS_LENGTH} caracteres.`,
)

/** Con "Otro motivo" el comentario es lo único que dice qué pasa; con los demás, es opcional. */
const detailsRules = (reason: ReportFormValues['reason']): Validator[] =>
  reason === 'other' ? [required('Cuéntanos cuál es el motivo.'), DETAILS_LIMIT] : [DETAILS_LIMIT]

export const validateReport = (values: ReportFormValues): ReportFormErrors => ({
  reason: isReportReason(values.reason) ? undefined : 'Elige un motivo.',
  details: validate(values.details, detailsRules(values.reason)),
})
