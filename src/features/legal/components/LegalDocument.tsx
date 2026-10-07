import { Info } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import StatusAlert from '@/components/StatusAlert'
import TextLink from '@/components/TextLink'
import Container from '@/components/layout/Container'
import type { LegalDocumentContent } from '@/features/legal/types/legal.types'
import { usePageTitle } from '@/hooks/usePageTitle'
import { formatLongDate } from '@/shared/utils/format'

const PRELIMINARY_NOTE = {
  title: 'Versión preliminar',
  description:
    'Este texto describe cómo funciona hoy el sitio, que está en desarrollo. Está pendiente de revisión legal antes del lanzamiento.',
}

interface LegalDocumentProps {
  document: LegalDocumentContent
}

/** Página de un texto legal: su título, cuándo se revisó y sus secciones numeradas. */
const LegalDocument = ({ document: { title, summary, updatedOn, sections, related } }: LegalDocumentProps) => {
  usePageTitle(title)

  return (
    // Más estrecho que el resto del sitio: es texto corrido, y en líneas largas cuesta leerlo.
    <Container as="article" className="grid max-w-3xl gap-8 py-10">
      <div className="grid gap-3">
        <PageHeader title={title} description={summary} />
        <p className="text-sm text-muted-foreground">Última actualización: {formatLongDate(updatedOn)}</p>
      </div>

      <StatusAlert role="note" icon={Info} {...PRELIMINARY_NOTE} />

      {sections.map(({ id, title: sectionTitle, paragraphs, items }, position) => (
        <section key={id} aria-labelledby={id} className="grid gap-3">
          <h2 id={id} className="font-heading text-xl font-semibold tracking-tight">
            {position + 1}. {sectionTitle}
          </h2>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="leading-relaxed text-pretty text-muted-foreground">
              {paragraph}
            </p>
          ))}
          {items && (
            <ul className="grid list-disc gap-2 pl-5 leading-relaxed text-muted-foreground marker:text-primary">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <p className="border-t pt-6">
        <TextLink to={related.to}>{related.label}</TextLink>
      </p>
    </Container>
  )
}

export default LegalDocument
