import PageHeader from '@/components/PageHeader'
import ExternalButtonLink from '@/components/ExternalButtonLink'
import Container from '@/components/layout/Container'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import ContactCard from '@/features/contact/components/ContactCard'
import ContactTopicSummary from '@/features/contact/components/ContactTopicSummary'
import { useContactTopic } from '@/features/contact/hooks/useContactTopic'
import { contactChatUrl } from '@/features/contact/utils/contactChat'
import WhatsAppIcon from '@/features/properties/components/WhatsAppIcon'
import { usePageTitle } from '@/hooks/usePageTitle'

/**
 * La consulta va por WhatsApp, ya escrita, mientras el formulario no tenga un servicio de correo que lo envíe:
 * así nadie llena un formulario que no llega a ningún lado. `ContactForm` vuelve aquí cuando lo tenga.
 */
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
            <Skeleton aria-busy="true" aria-label="Cargando consulta" className="h-40 rounded-2xl" />
          ) : (
            <Card className="justify-items-start gap-4 p-5 sm:p-6">
              <h2 className="font-heading text-xl font-semibold">Escríbenos por WhatsApp</h2>
              <p className="text-sm text-muted-foreground">
                Se abre el chat con tu consulta ya escrita: puedes cambiarla antes de enviarla.
              </p>
              <ExternalButtonLink href={contactChatUrl(topic)} size="lg" className="h-11 text-base">
                <WhatsAppIcon />
                Abrir WhatsApp
              </ExternalButtonLink>
            </Card>
          )}
        </div>

        <ContactCard />
      </div>
    </Container>
  )
}

export default ContactPage
