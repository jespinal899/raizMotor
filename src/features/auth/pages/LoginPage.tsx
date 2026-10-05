import { LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TextLink from '@/components/TextLink'
import Container from '@/components/layout/Container'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import LoginForm from '@/features/auth/components/LoginForm'
import { authService } from '@/features/auth/services/authService'
import { usePageTitle } from '@/hooks/usePageTitle'
import { BRAND } from '@/shared/constants/brand'
import { ROUTES } from '@/shared/constants/routes'

const LoginPage = () => {
  const navigate = useNavigate()

  usePageTitle('Iniciar sesión')

  /** Se entre con correo o con Google, al iniciar la sesión se va al inicio. */
  const enter = async (signIn: () => Promise<void>) => {
    await signIn()
    await navigate(ROUTES.home, { replace: true })
  }

  return (
    <Container className="grid justify-items-center py-10 md:py-16">
      <Card className="w-full max-w-md animate-fade-up gap-6 [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
        <CardHeader className="justify-items-center gap-3 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <LogIn className="size-6" aria-hidden="true" />
          </span>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">¡Bienvenido a {BRAND.name}!</h1>
          <CardDescription>Inicia sesión para publicar y gestionar tus propiedades.</CardDescription>
        </CardHeader>

        <CardContent>
          <LoginForm
            onSubmit={(credentials) => enter(() => authService.login(credentials))}
            onGoogleSignIn={() => enter(() => authService.loginWithGoogle())}
          />
        </CardContent>

        <CardFooter className="justify-center">
          <p className="flex flex-wrap items-center justify-center gap-x-1.5 text-sm text-muted-foreground">
            {/* El espacio separa la pregunta del enlace para quien lo escucha o lo copia; a la vista lo hace `gap`. */}
            ¿No tienes cuenta?{' '}
            <TextLink to={ROUTES.register}>Regístrate</TextLink>
          </p>
        </CardFooter>
      </Card>
    </Container>
  )
}

export default LoginPage
