import { Camera, Mail, Music2, Phone, Share2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { buildEmailHref, buildPhoneHref } from '@/features/contact/utils/contactLinks'
import { CONTACT } from '@/shared/constants/contact'

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  Instagram: Camera,
  TikTok: Music2,
}

const linkStyle =
  'rounded font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50'
const iconTile = 'grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary'
const itemLabel = 'text-xs font-medium tracking-wide text-muted-foreground uppercase'

const ComingSoon = () => <Badge variant="secondary">Próximamente</Badge>

const ContactCard = () => {
  const { phone, email, social } = CONTACT

  return (
    <Card className="gap-6 p-5 sm:p-6">
      <h2 className="font-heading text-xl font-semibold">Otras formas de contacto</h2>

      <ul className="grid gap-4">
        <li className="flex items-center gap-3">
          <span className={iconTile}>
            <Phone className="size-5" aria-hidden="true" />
          </span>
          <div className="grid gap-0.5">
            <span className={itemLabel}>Teléfono</span>
            <a href={buildPhoneHref(phone.e164)} className={linkStyle}>
              {phone.display}
            </a>
          </div>
        </li>
        <li className="flex items-center gap-3">
          <span className={iconTile}>
            <Mail className="size-5" aria-hidden="true" />
          </span>
          <div className="grid justify-items-start gap-0.5">
            <span className={itemLabel}>Correo</span>
            {email ? (
              <a href={buildEmailHref(email)} className={linkStyle}>
                {email}
              </a>
            ) : (
              <ComingSoon />
            )}
          </div>
        </li>
      </ul>

      <div className="grid gap-3 border-t pt-5">
        <h3 className={itemLabel}>Redes sociales</h3>
        <ul className="grid gap-3">
          {social.map(({ name, url }) => {
            const Icon = SOCIAL_ICONS[name] ?? Share2

            return (
              <li key={name} className="flex items-center gap-3 text-sm">
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className={linkStyle}>
                    {name}
                  </a>
                ) : (
                  <>
                    <span>{name}</span> <ComingSoon />
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </Card>
  )
}

export default ContactCard
