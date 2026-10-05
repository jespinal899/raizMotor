import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Container from '@/components/layout/Container'
import { Card, CardContent } from '@/components/ui/card'
import { FieldDescription, FieldGroup } from '@/components/ui/field'

/** Recorte vertical, del alto de la tarjeta, de la foto que abre la portada. */
const SIDE_PHOTO = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&h=1400&fit=crop&q=75'
/** Ancho desde el que la tarjeta va en dos columnas: el `md` de Tailwind. */
const TWO_COLUMNS = '(min-width: 768px)'
/** Imagen vacía de un píxel: lo único que "carga" un móvil, donde la foto no se muestra. */
const NO_PHOTO = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

interface AuthCardProps {
  title: string
  description: string
  /** La otra pantalla de acceso, para quien llegó a la que no era: registrarse o iniciar sesión. */
  alternative: { question: string; action: string; to: string }
  children: ReactNode
}

/**
 * Tarjeta de las pantallas de acceso: iniciar sesión y registrarse se ven igual. Desde tabletas va en
 * dos columnas, con el contenido a la izquierda y una foto a la derecha; en móviles, solo el contenido.
 */
const AuthCard = ({ title, description, alternative, children }: AuthCardProps) => {
  return (
    <Container className="grid justify-items-center py-10 md:py-16">
      <Card className="w-full max-w-sm animate-fade-up overflow-hidden p-0 md:max-w-4xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <FieldGroup className="p-6 md:p-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="font-heading text-2xl font-bold">{title}</h1>
              <p className="text-balance text-muted-foreground">{description}</p>
            </div>

            {children}

            <FieldDescription className="text-center">
              {alternative.question} <Link to={alternative.to}>{alternative.action}</Link>
            </FieldDescription>
          </FieldGroup>

          <div className="relative hidden bg-muted md:block">
            {/* Es un adorno, sin texto alternativo. Ocultarla no evita que se descargue: por eso se pide por ancho. */}
            <picture>
              <source media={TWO_COLUMNS} srcSet={SIDE_PHOTO} />
              <img src={NO_PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </picture>
          </div>
        </CardContent>
      </Card>
    </Container>
  )
}

export default AuthCard
