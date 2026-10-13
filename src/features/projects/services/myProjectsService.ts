import { createSupabaseMyProjectsGateway } from '@/features/projects/services/myProjectsGateway'
import type { MyProjectsGateway, ProjectChanges } from '@/features/projects/services/myProjectsGateway'
import { toProject } from '@/features/projects/services/projectService'
import type { Project } from '@/features/projects/types/project.types'
import type { ProjectFormValues, ProjectSubmission } from '@/features/projects/types/projectForm.types'
import { PublicationLimitError, PublicationSignInRequiredError } from '@/features/properties/services/publicationErrors'
import type { PublicationPhoto } from '@/features/properties/types/publication.types'
import { photoExtension, resizePhoto } from '@/features/properties/utils/photoResize'
import { supabase } from '@/lib/supabaseClient'
import { formatLocalPhone } from '@/shared/utils/honduranPhone'

/** Lo que una inmobiliaria hace con sus proyectos desde «Mis publicaciones». */
export interface MyProjectsService {
  /** Sus proyectos, del más reciente al más antiguo, con su estado. */
  listOwn(): Promise<Project[]>
  /** Cuántos proyectos puede tener publicados a la vez: 0 sin un plan de inmobiliaria. */
  getLimit(): Promise<number>
  /** Los datos de un proyecto propio para corregirlo; `undefined` si no existe o no es de esta cuenta. */
  getForEdit(id: string): Promise<ProjectFormValues | undefined>
  /** Publica un proyecto nuevo y devuelve su identificador. Repetirlo con la misma clave no crea otro. */
  create(project: ProjectSubmission, operationKey: string): Promise<string>
  update(id: string, project: ProjectSubmission, operationKey: string): Promise<void>
  unpublish(id: string): Promise<void>
  republish(id: string): Promise<void>
  remove(id: string): Promise<void>
}

/** Código con el que la base de datos dice que el plan de la cuenta no admite más proyectos. */
const LIMIT_REACHED = 'RZ001'
const NOT_EDITABLE = 'El proyecto no existe o no es de esta cuenta.'

const hasCode = (reason: unknown, code: string) =>
  typeof reason === 'object' && reason !== null && 'code' in reason && reason.code === code

const translatingFailure = async <T>(action: () => Promise<T>): Promise<T> => {
  try {
    return await action()
  } catch (reason) {
    throw hasCode(reason, LIMIT_REACHED) ? new PublicationLimitError() : reason
  }
}

const toChanges = (project: ProjectSubmission, photos: string[]): ProjectChanges => ({
  name: project.name,
  developer_name: project.developerName,
  developer_phone: project.developerPhone,
  description: project.description,
  kind: project.kind,
  stage: project.stage,
  delivery_date: project.deliveryDate ?? null,
  price_from: project.priceFrom,
  units_total: project.unitsTotal ?? null,
  department: project.department,
  city: project.city,
  neighborhood: project.neighborhood,
  address: project.address,
  latitude: project.coordinates.lat,
  longitude: project.coordinates.lng,
  amenities: project.amenities,
  photos,
  video_url: project.videoUrl ?? null,
})

const toModelChanges = ({ models }: ProjectSubmission) =>
  models.map(({ name, bedrooms, bathrooms, area, priceFrom }) => ({
    name,
    bedrooms: bedrooms ?? null,
    bathrooms: bathrooms ?? null,
    area,
    price_from: priceFrom,
  }))

interface MyProjectsOptions {
  gateway: MyProjectsGateway
  /** Deja la foto lista para subirla: reducida, para que el catálogo no pese. */
  preparePhoto: (photo: File) => Promise<Blob>
}

export const createMyProjectsService = ({ gateway, preparePhoto }: MyProjectsOptions): MyProjectsService => {
  const requireUser = async () => {
    const ownerId = await gateway.currentUserId()
    if (!ownerId) throw new PublicationSignInRequiredError()

    return ownerId
  }

  /** El proyecto, si es de la cuenta con la sesión abierta. */
  const requireOwn = async (id: string) => {
    const [ownerId, found] = await Promise.all([requireUser(), gateway.findById(id)])
    if (!found || found.row.owner_id !== ownerId) throw new Error(NOT_EDITABLE)

    return { ownerId, ...found }
  }

  /**
   * Las rutas de las fotos, en el mismo orden. Las que ya tenía (por su dirección) conservan su ruta; las
   * nuevas se suben a la carpeta de la cuenta, con la clave de la operación: un reintento reemplaza las mismas.
   */
  const storePhotos = (ownerId: string, operationKey: string, images: PublicationPhoto[], kept = new Map<string, string>()) =>
    Promise.all(
      images.map(async (image, position) => {
        if (typeof image === 'string') {
          const saved = kept.get(image)
          if (!saved) throw new Error('Esa foto no pertenece al proyecto.')

          return saved
        }

        const photo = await preparePhoto(image)
        const path = `${ownerId}/${operationKey}/${position}.${photoExtension(photo.type)}`
        await gateway.uploadPhoto(path, photo)

        return path
      }),
    )

  const setStatus = async (id: string, status: 'published' | 'draft') => {
    const { row } = await requireOwn(id)
    if (row.status === 'hidden') throw new Error('El equipo del sitio retiró este proyecto.')

    await translatingFailure(() => gateway.setStatus(id, status))
  }

  return {
    listOwn: async () => {
      const ownerId = await gateway.currentUserId()
      if (!ownerId) return []

      return (await gateway.listByOwner(ownerId)).map((row) => ({ ...toProject(gateway, row), status: row.status }))
    },

    getLimit: async () => {
      const ownerId = await gateway.currentUserId()

      return (ownerId && (await gateway.findLimit(ownerId))) || 0
    },

    getForEdit: async (id) => {
      const ownerId = await gateway.currentUserId()
      const found = ownerId ? await gateway.findById(id) : undefined
      if (!found || found.row.owner_id !== ownerId) return undefined

      const { row, models } = found

      return {
        department: row.department,
        city: row.city,
        neighborhood: row.neighborhood,
        address: row.address,
        coordinates: { lat: row.latitude, lng: row.longitude },
        name: row.name,
        developerName: row.developer_name,
        developerPhone: row.developer_phone ? formatLocalPhone(row.developer_phone) : '',
        kind: row.kind,
        stage: row.stage,
        deliveryMonth: row.delivery_date?.slice(0, 7) ?? '',
        priceFrom: String(row.price_from),
        unitsTotal: row.units_total ? String(row.units_total) : '',
        description: row.description,
        models: models.map(({ name, bedrooms, bathrooms, area, price_from }) => ({
          name,
          bedrooms: bedrooms === null ? '' : String(bedrooms),
          bathrooms: bathrooms === null ? '' : String(bathrooms),
          area: String(area),
          priceFrom: String(price_from),
        })),
        amenities: row.amenities.join('\n'),
        images: row.photos.map(gateway.photoUrl),
        videoUrl: row.video_url ?? '',
      }
    },

    create: async (project, operationKey) => {
      const ownerId = await requireUser()
      const findSaved = () => gateway.findByOperationKey(ownerId, operationKey)

      await translatingFailure(async () => {
        if (!(await findSaved())) {
          const photos = await storePhotos(ownerId, operationKey, project.images)
          await gateway.insertOnce({ ...toChanges(project, photos), operation_key: operationKey })
        }
      })

      const created = await findSaved()
      if (!created) throw new Error('El proyecto no quedó guardado.')
      // Reintentar deja los mismos modelos: se reemplazan, no se suman.
      await gateway.replaceModels(created.id, toModelChanges(project))

      return created.id
    },

    update: async (id, project, operationKey) => {
      const { ownerId, row } = await requireOwn(id)
      const kept = new Map(row.photos.map((path) => [gateway.photoUrl(path), path]))
      const photos = await translatingFailure(async () => {
        const stored = await storePhotos(ownerId, operationKey, project.images, kept)
        await gateway.updateById(id, toChanges(project, stored))

        return stored
      })
      await gateway.replaceModels(id, toModelChanges(project))
      // Las que ya no usa se borran al final: si fallara, sobrarían archivos, no faltarían fotos.
      await gateway.removePhotos(row.photos.filter((path) => !photos.includes(path) && !/^https:\/\//.test(path)))
    },

    unpublish: (id) => setStatus(id, 'draft'),

    republish: (id) => setStatus(id, 'published'),

    remove: async (id) => {
      const { row } = await requireOwn(id)
      await gateway.deleteById(id)
      await gateway.removePhotos(row.photos.filter((path) => !/^https:\/\//.test(path)))
    },
  }
}

/** Sin Supabase no hay cuentas, y tampoco proyectos propios. */
export const myProjectsService: MyProjectsService | null = supabase
  ? createMyProjectsService({ gateway: createSupabaseMyProjectsGateway(supabase), preparePhoto: resizePhoto })
  : null
