import { Copy, EyeOff, MapPin, Share2 } from 'lucide-react'
import ExternalButtonLink from '@/components/ExternalButtonLink'
import FormField from '@/components/FormField'
import StatusAlert from '@/components/StatusAlert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import PropertyPhoto from '@/features/properties/components/PropertyPhoto'
import PropertyPrice from '@/features/properties/components/PropertyPrice'
import WhatsAppIcon from '@/features/properties/components/WhatsAppIcon'
import type { Property } from '@/features/properties/types/property.types'
import { buildShareText, buildWhatsAppShareUrl } from '@/features/properties/utils/propertyShare'
import { useAbsoluteUrl } from '@/hooks/useAbsoluteUrl'
import { useClipboardCopy } from '@/hooks/useClipboardCopy'
import { propertyDetailPath } from '@/shared/constants/routes'

const actionSize = 'h-11 text-base'

interface SharePropertyProps {
  property: Property
}

/** Contenido de la ventana. Solo existe mientras está abierta: al cerrarla se olvida si el enlace se copió. */
const SharePropertyPanel = ({ property }: SharePropertyProps) => {
  const { id, title, district, city, image, localOnly } = property
  const link = useAbsoluteUrl(propertyDetailPath(id))
  const { status, copy } = useClipboardCopy(link)

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg">Compartir ficha</DialogTitle>
        <DialogDescription>Envíala por WhatsApp o copia su enlace.</DialogDescription>
      </DialogHeader>

      <div className="overflow-hidden rounded-xl border">
        {/* La foto es un adorno: el título que va debajo ya dice de qué propiedad se trata. */}
        <PropertyPhoto source={image} alt="" className="aspect-video w-full bg-muted object-cover" />
        <div className="grid gap-1.5 p-4">
          <p className="font-heading text-base leading-snug font-semibold">{title}</p>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {district}, {city}
          </p>
          <PropertyPrice property={property} />
        </div>
      </div>

      {localOnly && (
        <StatusAlert
          role="note"
          icon={EyeOff}
          title="Quien reciba el enlace no podrá ver este anuncio"
          description="Está guardado solo en este navegador."
        />
      )}

      <FormField label="Enlace de la ficha">
        {(control) => (
          <Input
            {...control}
            readOnly
            value={link}
            onFocus={(event) => event.target.select()}
            className="h-11 text-muted-foreground"
          />
        )}
      </FormField>

      <div className="grid gap-2 sm:grid-cols-2">
        <ExternalButtonLink
          href={buildWhatsAppShareUrl(buildShareText(property), link)}
          variant="outline"
          size="lg"
          className={actionSize}
        >
          <WhatsAppIcon />
          WhatsApp
        </ExternalButtonLink>
        <Button type="button" size="lg" onClick={() => void copy()} className={actionSize}>
          <Copy />
          Copiar enlace
        </Button>
      </div>

      {status === 'copied' && (
        <p role="status" className="text-sm font-medium text-primary">
          Enlace copiado.
        </p>
      )}
      {status === 'failed' && (
        <p role="alert" className="text-sm text-destructive">
          No pudimos copiarlo. Selecciona el enlace y cópialo a mano.
        </p>
      )}
    </>
  )
}

const SHARE_LABEL = 'Compartir'

/** Icono de compartir de la ficha y la ventana que abre, con WhatsApp y copiar enlace. */
const SharePropertyDialog = ({ property }: SharePropertyProps) => {
  return (
    <Dialog>
      {/* Solo el icono: el nombre lo llevan la etiqueta, para quien no ve la pantalla, y el texto al pasar el ratón. */}
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label={SHARE_LABEL}
            title={SHARE_LABEL}
            className="size-11"
          />
        }
      >
        <Share2 className="size-5" />
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <SharePropertyPanel property={property} />
      </DialogContent>
    </Dialog>
  )
}

export default SharePropertyDialog
