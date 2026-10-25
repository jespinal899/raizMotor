import { Share, SquarePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInstallApp } from '@/hooks/useInstallApp'
import { cn } from '@/lib/utils'
import { BRAND } from '@/shared/constants/brand'

interface InstallAppBannerProps {
  className?: string
}

/**
 * Invita a poner el sitio en la pantalla de inicio del teléfono, para abrirlo como una aplicación: con su
 * ícono y sin la barra del navegador. Queda justo encima de las pestañas de abajo y se puede cerrar.
 */
const InstallAppBanner = ({ className }: InstallAppBannerProps) => {
  const { way, install, dismiss } = useInstallApp()

  if (!way) return null

  return (
    <aside
      aria-label={`Instalar ${BRAND.name}`}
      className={cn(
        'fixed inset-x-3 bottom-tabbar z-40 mb-3 flex animate-fade-up items-start gap-3 rounded-2xl border bg-background p-3 shadow-lg',
        className,
      )}
    >
      <img src="/apple-touch-icon.png" alt="" className="size-11 shrink-0 rounded-xl" />
      <div className="grid flex-1 gap-1 text-sm">
        <p className="font-semibold">Instala {BRAND.name} en tu teléfono</p>
        {way === 'prompt' ? (
          <>
            <p className="text-muted-foreground">Ábrela desde tu pantalla de inicio, como una aplicación.</p>
            <Button size="sm" className="mt-1 justify-self-start" onClick={() => void install()}>
              Instalar
            </Button>
          </>
        ) : (
          <p className="text-muted-foreground">
            Toca <Share aria-label="Compartir" className="inline size-4 align-text-bottom text-primary" /> y luego{' '}
            <span className="whitespace-nowrap font-medium text-foreground">
              «Agregar a inicio» <SquarePlus aria-hidden className="inline size-4 align-text-bottom" />
            </span>
            .
          </p>
        )}
      </div>
      <Button variant="ghost" size="icon-sm" aria-label="Ahora no" onClick={dismiss} className="-mr-1 -mt-1">
        <X />
      </Button>
    </aside>
  )
}

export default InstallAppBanner
