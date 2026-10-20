import { useRef } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import FormField from '@/components/FormField'
import FormSelect from '@/components/FormSelect'
import PhoneField from '@/components/PhoneField'
import TextField from '@/components/TextField'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PROJECT_KINDS, PROJECT_STAGES } from '@/features/projects/data/projectOptions.data'
import type { ProjectForm } from '@/features/projects/hooks/useProjectForm'
import type { ProjectKind, ProjectStage } from '@/features/projects/types/project.types'
import type { ProjectModelValues } from '@/features/projects/types/projectForm.types'
import {
  ADDRESS_FIELDS,
  EMPTY_MODEL,
  MAX_PROJECT_DESCRIPTION_LENGTH,
  MAX_PROJECT_MODELS,
  MAX_PROJECT_NAME_LENGTH,
  MAX_PROJECT_PHOTOS,
} from '@/features/projects/utils/projectFormRules'
import AddressConfirmation from '@/features/properties/components/AddressConfirmation'
import ImagePicker from '@/features/properties/components/ImagePicker'
import { DEPARTMENT_OPTIONS } from '@/features/properties/data/departments.data'
import { getCityOptions, isDepartmentId } from '@/features/properties/utils/departments'
import { MAX_ADDRESS_LENGTH, MAX_NEIGHBORHOOD_LENGTH } from '@/features/properties/utils/publicationValidation'

/** Lo que recibe cada pantalla del formulario de un proyecto. */
export interface ProjectScreenProps extends Pick<ProjectForm, 'values' | 'errors' | 'change' | 'validate'> {
  /** Lleva el foco al primer campo con error. */
  onInvalid: () => void
  /** La ubicación quedó confirmada en el mapa: se puede pasar a la pantalla siguiente. */
  onLocationConfirmed: () => void
}

const KIND_OPTIONS = (Object.keys(PROJECT_KINDS) as ProjectKind[]).map((kind) => ({ value: kind, label: PROJECT_KINDS[kind].label }))
const STAGE_OPTIONS = (Object.keys(PROJECT_STAGES) as ProjectStage[]).map((stage) => ({
  value: stage,
  label: PROJECT_STAGES[stage].label,
}))

/** Dónde se construye, con su punto confirmado en el mapa. */
export const ProjectLocationScreen = ({ values, errors, change, validate, onInvalid, onLocationConfirmed }: ProjectScreenProps) => {
  const fieldsRef = useRef<HTMLDivElement>(null)
  const hasDepartment = isDepartmentId(values.department)

  const canSearchAddress = () => {
    const isComplete = validate(ADDRESS_FIELDS)
    if (!isComplete) onInvalid()

    return isComplete
  }

  return (
    <>
      <div ref={fieldsRef} className="grid gap-5 sm:grid-cols-2">
        <FormSelect
          label="Departamento"
          placeholder="Selecciona un departamento"
          options={DEPARTMENT_OPTIONS}
          value={values.department}
          onChange={(department) => change('department', department)}
          error={errors.department}
        />
        <FormSelect
          label="Ciudad"
          placeholder={hasDepartment ? 'Selecciona una ciudad' : 'Elige primero el departamento'}
          options={getCityOptions(values.department)}
          value={values.city}
          onChange={(city) => change('city', city)}
          error={errors.city}
          disabled={!hasDepartment}
        />
        <TextField
          label="Colonia, barrio o aldea"
          maxLength={MAX_NEIGHBORHOOD_LENGTH}
          value={values.neighborhood}
          onChange={(neighborhood) => change('neighborhood', neighborhood)}
          error={errors.neighborhood}
        />
        <TextField
          label="Dirección"
          placeholder="Calle o referencia del acceso"
          maxLength={MAX_ADDRESS_LENGTH}
          value={values.address}
          onChange={(address) => change('address', address)}
          error={errors.address}
        />
      </div>
      <AddressConfirmation
        location={values}
        isConfirmed={values.coordinates !== null}
        error={errors.coordinates}
        canSearch={canSearchAddress}
        onConfirm={(point) => change('coordinates', point)}
        onConfirmed={onLocationConfirmed}
        focusAfterEdit={() => fieldsRef.current?.querySelector<HTMLElement>('[role="combobox"]') ?? null}
      />
    </>
  )
}

/** Lo que se ve primero del proyecto: su nombre, quién lo desarrolla, etapa, entrega, precio y descripción. */
export const ProjectInfoScreen = ({ values, errors, change }: ProjectScreenProps) => (
  <div className="grid gap-5 sm:grid-cols-2">
    <TextField
      label="Nombre del proyecto"
      maxLength={MAX_PROJECT_NAME_LENGTH}
      value={values.name}
      onChange={(name) => change('name', name)}
      error={errors.name}
    />
    <TextField
      label="Desarrolladora"
      hint="quien construye y vende"
      value={values.developerName}
      onChange={(developerName) => change('developerName', developerName)}
      error={errors.developerName}
    />
    <FormSelect
      label="Tipo de proyecto"
      placeholder="Elige el tipo"
      options={KIND_OPTIONS}
      value={values.kind}
      onChange={(kind) => change('kind', kind as ProjectKind)}
      error={errors.kind}
    />
    <FormSelect
      label="Etapa"
      placeholder="Elige la etapa"
      options={STAGE_OPTIONS}
      value={values.stage}
      onChange={(stage) => change('stage', stage as ProjectStage)}
      error={errors.stage}
    />
    <TextField
      label="Precio desde (USD)"
      hint="la unidad más barata"
      type="number"
      inputMode="decimal"
      min={1}
      value={values.priceFrom}
      onChange={(priceFrom) => change('priceFrom', priceFrom)}
      error={errors.priceFrom}
    />
    <TextField
      label="Unidades en total"
      hint="opcional"
      type="number"
      inputMode="numeric"
      min={1}
      value={values.unitsTotal}
      onChange={(unitsTotal) => change('unitsTotal', unitsTotal)}
      error={errors.unitsTotal}
    />
    <TextField
      label="Entrega estimada"
      hint="opcional"
      type="month"
      value={values.deliveryMonth}
      onChange={(deliveryMonth) => change('deliveryMonth', deliveryMonth)}
      error={errors.deliveryMonth}
    />
    <PhoneField
      label="WhatsApp para pedir información (opcional)"
      value={values.developerPhone}
      onChange={(developerPhone) => change('developerPhone', developerPhone)}
      error={errors.developerPhone}
    />
    <div className="sm:col-span-2">
      <FormField label="Descripción" error={errors.description}>
        {(control) => (
          <Textarea
            {...control}
            rows={6}
            maxLength={MAX_PROJECT_DESCRIPTION_LENGTH}
            placeholder="Qué se construye, cuántos niveles o etapas, cómo se reserva y qué tiene cerca."
            value={values.description}
            onChange={(event) => change('description', event.target.value)}
            className="min-h-36"
          />
        )}
      </FormField>
    </div>
  </div>
)

/** Los modelos de unidad: se agregan y se quitan; el primero va primero en la ficha. */
export const ProjectModelsScreen = ({ values, errors, change }: ProjectScreenProps) => {
  const { models } = values

  const update = (position: number, field: keyof ProjectModelValues, value: string) =>
    change(
      'models',
      models.map((model, index) => (index === position ? { ...model, [field]: value } : model)),
    )

  return (
    <div className="grid gap-4">
      <ol className="grid gap-4">
        {models.map((model, position) => (
          <li key={position} className="grid gap-4 rounded-xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-medium">Modelo {position + 1}</h4>
              {models.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Quitar el modelo ${position + 1}`}
                  onClick={() => change('models', models.filter((_, index) => index !== position))}
                >
                  <Trash2 />
                  Quitar
                </Button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <TextField
                label={`Nombre del modelo ${position + 1}`}
                placeholder="Modelo A"
                value={model.name}
                onChange={(value) => update(position, 'name', value)}
              />
              <TextField
                label="Habitaciones"
                type="number"
                inputMode="numeric"
                min={0}
                value={model.bedrooms}
                onChange={(value) => update(position, 'bedrooms', value)}
              />
              <TextField
                label="Baños"
                type="number"
                inputMode="numeric"
                min={0}
                value={model.bathrooms}
                onChange={(value) => update(position, 'bathrooms', value)}
              />
              <TextField
                label="Área (m²)"
                type="number"
                inputMode="decimal"
                min={1}
                value={model.area}
                onChange={(value) => update(position, 'area', value)}
              />
              <TextField
                label="Desde (USD)"
                type="number"
                inputMode="decimal"
                min={1}
                value={model.priceFrom}
                onChange={(value) => update(position, 'priceFrom', value)}
              />
            </div>
          </li>
        ))}
      </ol>

      {errors.models && (
        <p role="alert" className="text-sm text-destructive">
          {errors.models}
        </p>
      )}

      {models.length < MAX_PROJECT_MODELS && (
        <Button type="button" variant="outline" className="justify-self-start" onClick={() => change('models', [...models, EMPTY_MODEL])}>
          <Plus />
          Agregar otro modelo
        </Button>
      )}
    </div>
  )
}

/** Lo que comparte todo el proyecto, sus fotos y su video. */
export const ProjectExtrasScreen = ({ values, errors, change }: ProjectScreenProps) => (
  <div className="grid gap-5">
    <FormField label="Amenidades" hint="una por línea" error={errors.amenities}>
      {(control) => (
        <Textarea
          {...control}
          rows={5}
          placeholder={'Piscina\nGimnasio\nSeguridad 24 horas'}
          value={values.amenities}
          onChange={(event) => change('amenities', event.target.value)}
        />
      )}
    </FormField>
    <ImagePicker
      files={values.images}
      onChange={(images) => change('images', images)}
      error={errors.images}
      max={MAX_PROJECT_PHOTOS}
    />
    <TextField
      label="Video del proyecto"
      hint="opcional, enlace de YouTube u otro sitio"
      type="url"
      placeholder="https://"
      value={values.videoUrl}
      onChange={(videoUrl) => change('videoUrl', videoUrl)}
      error={errors.videoUrl}
    />
  </div>
)
