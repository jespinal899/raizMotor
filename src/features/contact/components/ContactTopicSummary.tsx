import type { ContactTopic } from '@/features/contact/types/contact.types'

interface ContactTopicSummaryProps {
  topic: ContactTopic
}

/** Recuerda al visitante sobre qué propiedad o plan está consultando. */
const ContactTopicSummary = ({ topic: { label, title, detail } }: ContactTopicSummaryProps) => {
  return (
    <div className="grid gap-0.5 rounded-2xl bg-muted/60 px-5 py-4">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="font-medium">{title}</p>
      {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
    </div>
  )
}

export default ContactTopicSummary
