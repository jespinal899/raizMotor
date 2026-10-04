import { LogIn } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Container from '@/components/layout/Container'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import LoginForm from '@/features/auth/components/LoginForm'
import { authService } from '@/features/auth/services/authService'
import type { LoginCredentials } from '@/features/auth/types/auth.types'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

const TITLE = 'Iniciar sesión'

const LoginPage = () => {
  const navigate = useNavigate()

  usePageTitle(TITLE)

  const signIn = async (credentials: LoginCredentials) => {
    await authService.login(credentials)
    await navigate(ROUTES.home, { replace: true })
  }

  return (
    <Container className="grid justify-items-center py-10 md:py-16">
      <Card className="w-full max-w-md animate-fade-up gap-6 [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
        <CardHeader className="justify-items-center gap-3 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <LogIn className="size-6" aria-hidden="true" />
          </span>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{TITLE}</h1>
          <CardDescription>Accede a tu cuenta para publicar y gestionar tus propiedades.</CardDescription>
        </CardHeader>

        <CardContent>
          <LoginForm onSubmit={signIn} />
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-center text-sm text-muted-foreground">
            ¿Necesitas ayuda para entrar?{' '}
            <Link
              to={ROUTES.contact}
              className="rounded font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Contáctanos
            </Link>
          </p>
        </CardFooter>
      </Card>
    </Container>
  )
}

export default LoginPage
