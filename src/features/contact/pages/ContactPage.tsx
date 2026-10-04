import PageHeader from '@/components/PageHeader'
import Container from '@/components/layout/Container'
import { Skeleton } from '@/components/ui/skeleton'
import ContactCard from '@/features/contact/components/ContactCard'
import ContactForm from '@/features/contact/components/ContactForm'
import ContactTopicSummary from '@/features/contact/components/ContactTopicSummary'
import { useContactTopic } from '@/features/contact/hooks/useContactTopic'
import { contactService } from '@/features/contact/services/contactService'
import { usePageTitle } from '@/hooks/usePageTitle'

const ContactPage = () => {
  const { topic, isLoading } = useContactTopic()

  usePageTitle('Contáctenos')

  return (
    <Container className="grid gap-8 py-10">
      <PageHeader
        title="Contáctenos"
        description="Cuéntanos qué necesitas y te responderemos. También puedes llamarnos."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <div className="grid gap-5">
          {topic && <ContactTopicSummary topic={topic} />}
          {isLoading ? (
            <Skeleton aria-busy="true" aria-label="Cargando formulario" className="h-96 rounded-2xl" />
          ) : (
            // La clave reinicia el formulario cuando cambia el motivo de la consulta.
            <ContactForm
              key={topic?.id ?? 'general'}
              initialDescription={topic?.defaultDescription}
              onSubmit={(values) => contactService.send({ ...values, reference: topic?.reference })}
            />
          )}
        </div>

        <ContactCard />
      </div>
    </Container>
  )
}

export default ContactPage
