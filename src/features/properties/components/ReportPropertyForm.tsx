import type { FormEvent } from 'react'
import { Flag } from 'lucide-react'
import ChoiceGroup from '@/components/ChoiceGroup'
import type { ChoiceOption } from '@/components/ChoiceGroup'
import FormField from '@/components/FormField'
import SubmitButton from '@/components/SubmitButton'
import { Textarea } from '@/components/ui/textarea'
import ReportFormAlert from '@/features/properties/components/ReportFormAlert'
import { REPORT_REASONS } from '@/features/properties/data/reportReasons.data'
import { useReportForm } from '@/features/properties/hooks/useReportForm'
import type { ReportDetails, ReportReason } from '@/features/properties/types/report.types'
import { MAX_REPORT_DETAILS_LENGTH } from '@/features/properties/utils/reportValidation'

const REASON_OPTIONS: ChoiceOption<ReportReason>[] = (Object.keys(REPORT_REASONS) as ReportReason[]).map((reason) => ({
  value: reason,
  label: REPORT_REASONS[reason],
}))

interface ReportPropertyFormProps {
  /** Se resuelve cuando el reporte queda entregado. La clave identifica el envío, para no registrarlo dos veces. */
  onSubmit: (report: ReportDetails, operationKey: string) => Promise<void>
}

/** Motivo y comentario con los que se reporta una publicación. */
const ReportPropertyForm = ({ onSubmit }: ReportPropertyFormProps) => {
  const { values, errors, status, change, submit } = useReportForm({ onSubmit })
  const isSending = status === 'sending'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  return (
    <form noValidate aria-label="Reporte de la publicación" onSubmit={handleSubmit} className="grid gap-5">
      {/* Una debajo de otra: son frases, y en dos columnas se partirían en varias líneas. */}
      <ChoiceGroup
        label="Motivo"
        options={REASON_OPTIONS}
        value={values.reason}
        onChange={(reason) => change('reason', reason)}
        error={errors.reason}
        className="grid-cols-1"
      />

      {/* Con "Otro motivo" deja de ser opcional: es lo único que dice qué pasa. */}
      <FormField
        label="Cuéntanos más"
        hint={values.reason === 'other' ? undefined : 'opcional'}
        error={errors.details}
      >
        {(control) => (
          <Textarea
            {...control}
            name="details"
            rows={3}
            maxLength={MAX_REPORT_DETAILS_LENGTH}
            placeholder="¿Qué viste en el anuncio?"
            value={values.details}
            onChange={(event) => change('details', event.target.value)}
            readOnly={isSending}
          />
        )}
      </FormField>

      {/* Ya enviado, repetirlo no mandaría nada: el botón vuelve a activarse al cambiar algún dato. */}
      <SubmitButton isSubmitting={isSending} disabled={status === 'sent'} icon={Flag} submittingLabel="Enviando…">
        Enviar reporte
      </SubmitButton>

      <ReportFormAlert status={status} />
    </form>
  )
}

export default ReportPropertyForm
