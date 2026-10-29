import { Globe, House, Mail, MapPin, MessageCircle, SearchX, TriangleAlert } from 'lucide-react'
import { useParams } from 'react-router-dom'
import ButtonLink from '@/components/ButtonLink'
import EmptyState from '@/components/EmptyState'
import ExternalButtonLink from '@/components/ExternalButtonLink'
import PageLoading from '@/components/PageLoading'
import PageMessage from '@/components/PageMessage'
import Container from '@/components/layout/Container'
import AgencyLogo from '@/features/agencies/components/AgencyLogo'
import VerifiedBadge from '@/features/agencies/components/VerifiedBadge'
import { agencyService } from '@/features/agencies/services/agencyService'
import type { AgencyService } from '@/features/agencies/services/agencyService'
import type { Agency } from '@/features/agencies/types/agency.types'
import ProjectCollection from '@/features/projects/components/ProjectCollection'
import { projectService } from '@/features/projects/services/projectService'
import type { ProjectService } from '@/features/projects/services/projectService'
import PropertyCollection from '@/features/properties/components/PropertyCollection'
import { ADVERTISER_KINDS } from '@/features/properties/data/propertyOptions.data'
import { propertyService } from '@/features/properties/services/propertyService'
import type { PropertyService } from '@/features/properties/services/propertyService'
import { useAbsoluteUrl } from '@/hooks/useAbsoluteUrl'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES, agencyPath } from '@/shared/constants/routes'
import { toParagraphs } from '@/shared/utils/text'
import { whatsAppUrl } from '@/shared/utils/whatsApp'

const NOT_FOUND_TITLE = 'Esta inmobiliaria no está disponible'

/** Los botones para escribirle o visitarla, solo los de los datos que dio. */
const AgencyContacts = ({ agency }: { agency: Agency }) => {
  const pageUrl = useAbsoluteUrl(agencyPath(agency.slug))
  const links = [
    agency.website && { href: agency.website, label: 'Sitio web' },
    agency.facebook && { href: agency.facebook, label: 'Facebook' },
    agency.instagram && { href: agency.instagram, label: 'Instagram' },
  ].filter((link) => !!link)

  if (!agency.phone && !agency.email && links.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {agency.phone && (
        <ExternalButtonLink href={whatsAppUrl(`Hola, vi su página en DomusRaíz: ${pageUrl}`, agency.phone)} size="lg" className="h-11">
          <MessageCircle />
          Escribir por WhatsApp
        </ExternalButtonLink>
      )}
      {agency.email && (
        <ExternalButtonLink href={`mailto:${agency.email}`} variant="outline" size="lg" className="h-11">
          <Mail />
          {agency.email}
        </ExternalButtonLink>
      )}
      {links.map(({ href, label }) => (
        <ExternalButtonLink key={label} href={href} variant="outline" size="lg" className="h-11">
          <Globe />
          {label}
        </ExternalButtonLink>
      ))}
    </div>
  )
}

interface AgencyPageProps {
  agencies?: AgencyService
  properties?: PropertyService
  projects?: ProjectService
}

/** La página pública de una inmobiliaria: quién es, cómo escribirle y todo lo que tiene publicado. */
const AgencyPage = ({ agencies = agencyService, properties = propertyService, projects = projectService }: AgencyPageProps) => {
  const { slug = '' } = useParams()
  const { data, isLoading, error } = useAsyncData(async () => {
    const page = await agencies.getPage(slug)
    if (!page) return undefined

    const [listings, developments] = await Promise.all([
      properties.getByOwner(page.ownerId),
      projects.getByOwner(page.ownerId),
    ])

    return { agency: page.agency, listings, developments }
  }, `agency:${slug}`)
  const isMissing = !isLoading && !error && !data

  usePageTitle(isMissing ? NOT_FOUND_TITLE : data?.agency.name)

  if (error) {
    return (
      <PageMessage icon={TriangleAlert} title="No pudimos cargar la inmobiliaria" description="Inténtalo de nuevo en unos minutos." />
    )
  }

  if (isLoading) return <PageLoading />

  if (!data) {
    return (
      <PageMessage icon={SearchX} title={NOT_FOUND_TITLE} description="Puede que el enlace esté incompleto o que ya no publique en el sitio.">
        <ButtonLink to={ROUTES.properties}>Ver todas las propiedades</ButtonLink>
      </PageMessage>
    )
  }

  const { agency, listings, developments } = data

  return (
    <Container className="grid gap-10 py-10">
      <header className="grid gap-6">
        <div className="flex flex-wrap items-center gap-5">
          <AgencyLogo agency={agency} alt={`Logo de ${agency.name}`} className="size-24 rounded-2xl text-2xl sm:size-28" />
          <div className="grid min-w-0 gap-1.5">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">{agency.name}</h1>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
              <span>{ADVERTISER_KINDS[agency.kind]}</span>
              {agency.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" aria-hidden="true" />
                  {agency.city}
                </span>
              )}
              {agency.verified && <VerifiedBadge className="text-sm" />}
            </p>
          </div>
        </div>

        {agency.description && (
          <div className="grid max-w-3xl gap-3 leading-relaxed text-pretty text-muted-foreground">
            {toParagraphs(agency.description).map((paragraph, position) => (
              <p key={position} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        <AgencyContacts agency={agency} />
      </header>

      <section aria-labelledby="propiedades-de-la-inmobiliaria" className="grid gap-5">
        <h2 id="propiedades-de-la-inmobiliaria" className="font-heading text-2xl font-semibold tracking-tight">
          Propiedades <span className="text-muted-foreground">({listings.length})</span>
        </h2>
        <PropertyCollection
          properties={listings}
          isLoading={false}
          emptyState={
            <EmptyState icon={House} title="Todavía no tiene propiedades publicadas" description="Vuelve pronto para ver sus anuncios." />
          }
        />
      </section>

      {developments.length > 0 && (
        <section aria-labelledby="proyectos-de-la-inmobiliaria" className="grid gap-5">
          <h2 id="proyectos-de-la-inmobiliaria" className="font-heading text-2xl font-semibold tracking-tight">
            Proyectos <span className="text-muted-foreground">({developments.length})</span>
          </h2>
          <ProjectCollection projects={developments} isLoading={false} />
        </section>
      )}
    </Container>
  )
}

export default AgencyPage
