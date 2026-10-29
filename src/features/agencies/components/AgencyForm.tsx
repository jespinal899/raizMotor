import type { FormEvent } from 'react'
import { CircleAlert, CircleCheck, Save } from 'lucide-react'
import FormField from '@/components/FormField'
import FormSelect from '@/components/FormSelect'
import PhoneField from '@/components/PhoneField'
import StatusAlert from '@/components/StatusAlert'
import type { StatusAlertContent } from '@/components/StatusAlert'
import SubmitButton from '@/components/SubmitButton'
import TextField from '@/components/TextField'
import TextLink from '@/components/TextLink'
import { FieldGroup } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import LogoPicker from '@/features/agencies/components/LogoPicker'
import { useAgencyForm } from '@/features/agencies/hooks/useAgencyForm'
import type { AgencyFormFailure } from '@/features/agencies/hooks/useAgencyForm'
import type { Agency, AgencyKind, AgencyProfile } from '@/features/agencies/types/agency.types'
import {
  MAX_AGENCY_DESCRIPTION_LENGTH,
  MAX_AGENCY_NAME_LENGTH,
  MAX_SLUG_LENGTH,
} from '@/features/agencies/utils/agencyFormRules'
import { ADVERTISER_KINDS } from '@/features/properties/data/propertyOptions.data'
import { useAbsoluteUrl } from '@/hooks/useAbsoluteUrl'
import { agencyPath } from '@/shared/constants/routes'

const KIND_OPTIONS = (['inmobiliaria', 'constructora'] as const).map((kind) => ({ value: kind, label: ADVERTISER_KINDS[kind] }))

const FAILURES: Record<AgencyFormFailure, StatusAlertContent> = {
  failed: {
    icon: CircleAlert,
    title: 'No pudimos guardar tu inmobiliaria',
    description: 'Sigue como estaba. Inténtalo de nuevo en unos minutos.',
    variant: 'destructive',
  },
  slugTaken: {
    icon: CircleAlert,
    title: 'Esa dirección ya la usa otra inmobiliaria',
    description: 'Elige otra dirección para tu página, por ejemplo con el nombre de tu ciudad.',
    variant: 'destructive',
  },
  planRequired: {
    icon: CircleAlert,
    title: 'Tu plan no incluye perfil de inmobiliaria',
    description: 'El perfil con logo es parte de los planes para inmobiliarias.',
    variant: 'destructive',
  },
}

interface AgencyFormProps {
  agency?: Agency
  onSubmit: (profile: AgencyProfile) => Promise<Agency>
}

/** El perfil público de la inmobiliaria: con él sale en sus anuncios, en sus proyectos y en su página. */
const AgencyForm = ({ agency, onSubmit }: AgencyFormProps) => {
  const form = useAgencyForm({ agency, onSubmit })
  const { values, errors, status, saved, logoPreview, logoError, change } = form
  const pageUrl = useAbsoluteUrl(agencyPath(values.slug || 'tu-inmobiliaria'))
  const isSaving = status === 'saving'
  const failure = status === 'saving' || status === 'saved' || status === 'idle' ? undefined : FAILURES[status]

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void form.submit()
  }

  return (
    <form noValidate aria-label="Perfil de tu inmobiliaria" onSubmit={handleSubmit}>
      <FieldGroup>
        <LogoPicker
          logo={logoPreview}
          name={values.name}
          error={logoError}
          onChoose={form.chooseLogo}
          onRemove={form.removeLogo}
          disabled={isSaving}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Nombre comercial"
            error={errors.name}
            value={values.name}
            onChange={form.changeName}
            maxLength={MAX_AGENCY_NAME_LENGTH}
            autoComplete="organization"
            readOnly={isSaving}
          />
          <FormSelect
            label="Tipo"
            placeholder="Elige el tipo"
            options={KIND_OPTIONS}
            value={values.kind}
            onChange={(kind) => change('kind', kind as AgencyKind)}
            disabled={isSaving}
          />
        </div>

        <div className="grid gap-2">
          <TextField
            label="Dirección de tu página"
            error={errors.slug}
            value={values.slug}
            onChange={form.changeSlug}
            maxLength={MAX_SLUG_LENGTH}
            autoCapitalize="none"
            spellCheck={false}
            readOnly={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            Tu página será {pageUrl}
          </p>
        </div>

        <FormField label="Descripción" hint="opcional" error={errors.description}>
          {(control) => (
            <Textarea
              {...control}
              rows={5}
              maxLength={MAX_AGENCY_DESCRIPTION_LENGTH}
              placeholder="Quiénes son, en qué zonas trabajan y qué tipo de propiedades venden o alquilan."
              value={values.description}
              onChange={(event) => change('description', event.target.value)}
              readOnly={isSaving}
              className="min-h-32"
            />
          )}
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Ciudad"
            hint="opcional"
            error={errors.city}
            value={values.city}
            onChange={(city) => change('city', city)}
            placeholder="San Pedro Sula"
            readOnly={isSaving}
          />
          <PhoneField
            label="WhatsApp de la inmobiliaria (opcional)"
            error={errors.phone}
            value={values.phone}
            onChange={(phone) => change('phone', phone)}
            readOnly={isSaving}
          />
          <TextField
            label="Correo"
            hint="opcional"
            type="email"
            error={errors.email}
            value={values.email}
            onChange={(email) => change('email', email)}
            autoComplete="email"
            readOnly={isSaving}
          />
          <TextField
            label="Sitio web"
            hint="opcional"
            error={errors.website}
            value={values.website}
            onChange={(website) => change('website', website)}
            placeholder="www.tuinmobiliaria.hn"
            inputMode="url"
            autoCapitalize="none"
            readOnly={isSaving}
          />
          <TextField
            label="Facebook"
            hint="opcional"
            error={errors.facebook}
            value={values.facebook}
            onChange={(facebook) => change('facebook', facebook)}
            placeholder="facebook.com/tuinmobiliaria"
            inputMode="url"
            autoCapitalize="none"
            readOnly={isSaving}
          />
          <TextField
            label="Instagram"
            hint="opcional"
            error={errors.instagram}
            value={values.instagram}
            onChange={(instagram) => change('instagram', instagram)}
            placeholder="instagram.com/tuinmobiliaria"
            inputMode="url"
            autoCapitalize="none"
            readOnly={isSaving}
          />
        </div>

        <SubmitButton isSubmitting={isSaving} icon={Save} submittingLabel="Guardando…">
          Guardar
        </SubmitButton>

        {status === 'saved' && saved && (
          <div className="grid gap-2">
            <StatusAlert
              icon={CircleCheck}
              title="Tu inmobiliaria se guardó"
              description="Tus anuncios y proyectos ya salen con este nombre y este logo."
              role="status"
            />
            <TextLink to={agencyPath(saved.slug)} className="justify-self-start">
              Ver mi página
            </TextLink>
          </div>
        )}
        {failure && <StatusAlert {...failure} />}
      </FieldGroup>
    </form>
  )
}

export default AgencyForm
