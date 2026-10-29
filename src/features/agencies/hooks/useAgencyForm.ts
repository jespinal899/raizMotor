import { useState } from 'react'
import { AgencyPlanRequiredError, AgencySlugTakenError } from '@/features/agencies/services/agencyErrors'
import type { Agency, AgencyProfile } from '@/features/agencies/types/agency.types'
import { checkLogo, toLink, toSlug, validateAgency } from '@/features/agencies/utils/agencyFormRules'
import type { AgencyFormValues } from '@/features/agencies/utils/agencyFormRules'
import { useAttemptForm } from '@/hooks/useAttemptForm'
import { formatLocalPhone, toInternationalPhone } from '@/shared/utils/honduranPhone'

export type AgencyFormFailure = 'failed' | 'slugTaken' | 'planRequired'

const toFailure = (reason: unknown): AgencyFormFailure => {
  if (reason instanceof AgencySlugTakenError) return 'slugTaken'
  if (reason instanceof AgencyPlanRequiredError) return 'planRequired'

  return 'failed'
}

const toValues = (agency?: Agency): AgencyFormValues => ({
  kind: agency?.kind ?? 'inmobiliaria',
  name: agency?.name ?? '',
  slug: agency?.slug ?? '',
  description: agency?.description ?? '',
  city: agency?.city ?? '',
  // El teléfono se guarda completo, pero se escribe como en el registro: solo el número local.
  phone: agency?.phone ? formatLocalPhone(agency.phone) : '',
  email: agency?.email ?? '',
  website: agency?.website ?? '',
  facebook: agency?.facebook ?? '',
  instagram: agency?.instagram ?? '',
})

interface AgencyFormOptions {
  /** La inmobiliaria como está guardada; sin valor, todavía no la creó. */
  agency?: Agency
  /** Guarda el perfil y lo devuelve como quedó; se rechaza si no se pudo. */
  onSubmit: (profile: AgencyProfile) => Promise<Agency>
}

/** El formulario de «Mi inmobiliaria»: su perfil público y su logo. */
export const useAgencyForm = ({ agency, onSubmit }: AgencyFormOptions) => {
  const { values, errors, status, change, validateFields, attempt } = useAttemptForm<
    AgencyFormValues,
    'saving',
    AgencyFormFailure,
    'saved'
  >({ initialValues: toValues(agency), validate: validateAgency, toFailure, succeeded: 'saved' })
  const [saved, setSaved] = useState(agency)
  /** Un archivo es un logo nuevo; `null`, quitar el guardado; sin valor, dejarlo como está. */
  const [logo, setLogo] = useState<File | null>()
  const [logoError, setLogoError] = useState<string>()
  // Mientras nadie la haya escrito a mano, la dirección sigue al nombre. La de un perfil ya guardado no cambia sola.
  const [slugEdited, setSlugEdited] = useState(agency !== undefined)

  const changeName = (name: string) => {
    change('name', name)
    if (!slugEdited) change('slug', toSlug(name))
  }

  const changeSlug = (slug: string) => {
    setSlugEdited(true)
    change('slug', slug.toLowerCase())
  }

  const chooseLogo = (file: File) => {
    const problem = checkLogo(file)
    setLogoError(problem)
    if (!problem) setLogo(file)
  }

  const removeLogo = () => {
    setLogoError(undefined)
    setLogo(null)
  }

  /** Lo que se ve como logo: el elegido, ninguno si se quitó, o el que está guardado. */
  const logoPreview = logo === undefined ? saved?.logoUrl : (logo ?? undefined)

  const submit = async () => {
    if (!validateFields() || logoError) return

    await attempt('saving', async () => {
      const result = await onSubmit({
        kind: values.kind,
        name: values.name.trim(),
        slug: values.slug,
        description: values.description.trim(),
        city: values.city.trim(),
        phone: values.phone.trim() ? toInternationalPhone(values.phone) : '',
        email: values.email.trim(),
        website: toLink(values.website),
        facebook: toLink(values.facebook),
        instagram: toLink(values.instagram),
        ...(logo !== undefined && { logo }),
      })
      setSaved(result)
      setLogo(undefined)
    })
  }

  return { values, errors, status, saved, logoPreview, logoError, change, changeName, changeSlug, chooseLogo, removeLogo, submit }
}

export type AgencyForm = ReturnType<typeof useAgencyForm>
