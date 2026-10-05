import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import TextLink from '@/components/TextLink'
import Container from '@/components/layout/Container'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'

interface AuthCardProps {
  icon: LucideIcon
  title: string
  description: string
  /** La otra pantalla de acceso, para quien llegó a la que no era: registrarse o iniciar sesión. */
  alternative: { question: string; action: string; to: string }
  children: ReactNode
}

/** Tarjeta de las pantallas de acceso: iniciar sesión y registrarse se ven igual. */
const AuthCard = ({ icon: Icon, title, description, alternative, children }: AuthCardProps) => {
  return (
    <Container className="grid justify-items-center py-10 md:py-16">
      <Card className="w-full max-w-md animate-fade-up gap-6 [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
        <CardHeader className="justify-items-center gap-3 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent>{children}</CardContent>

        <CardFooter className="justify-center">
          <p className="flex flex-wrap items-center justify-center gap-x-1.5 text-sm text-muted-foreground">
            {/* El espacio separa la pregunta del enlace para quien lo escucha o lo copia; a la vista lo hace `gap`. */}
            {alternative.question}{' '}
            <TextLink to={alternative.to}>{alternative.action}</TextLink>
          </p>
        </CardFooter>
      </Card>
    </Container>
  )
}

export default AuthCard
