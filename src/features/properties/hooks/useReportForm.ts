import { ReportThrottledError, ReportUnavailableError } from '@/features/properties/services/reportErrors'
import type { ReportDetails, ReportFailure, ReportFormValues } from '@/features/properties/types/report.types'
import { isReportReason } from '@/features/properties/utils/propertyGuards'
import { validateReport } from '@/features/properties/utils/reportValidation'
import { useAttemptForm } from '@/hooks/useAttemptForm'

interface ReportFormOptions {
  /** Se resuelve cuando el reporte queda entregado. La clave identifica el envío, para no registrarlo dos veces. */
  onSubmit: (report: ReportDetails, operationKey: string) => Promise<void>
}

const EMPTY_REPORT: ReportFormValues = { reason: '', details: '' }

const toFailureStatus = (reason: unknown): ReportFailure => {
  if (reason instanceof ReportUnavailableError) return 'unavailable'

  return reason instanceof ReportThrottledError ? 'throttled' : 'failed'
}

export const useReportForm = ({ onSubmit }: ReportFormOptions) => {
  const { values, errors, status, change, validateFields, attempt } = useAttemptForm<
    ReportFormValues,
    'sending',
    ReportFailure,
    'sent'
  >({
    initialValues: EMPTY_REPORT,
    validate: validateReport,
    toFailure: toFailureStatus,
    succeeded: 'sent',
  })

  const submit = async () => {
    const { reason, details } = values
    // La validación ya exige un motivo de la lista; comprobarlo aquí además se lo dice al compilador.
    if (!validateFields() || !isReportReason(reason)) return

    await attempt('sending', (operationKey) => onSubmit({ reason, details: details.trim() }, operationKey))
  }

  return { values, errors, status, change, submit }
}
