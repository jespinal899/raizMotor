import TextLink from '@/components/TextLink'
import { ROUTES } from '@/shared/constants/routes'

interface PlanHelpProps {
  question?: string
  /** El texto del enlace. */
  action?: string
  to?: string
}

/** Para quien duda: le ofrece escribir. Sin más datos, pregunta qué plan conviene y lleva al contacto. */
const PlanHelp = ({
  question = '¿No sabes cuál te conviene?',
  action = 'Escríbenos y te ayudamos a elegir',
  to = ROUTES.contact,
}: PlanHelpProps) => {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
      {question} <TextLink to={to}>{action}</TextLink>
    </p>
  )
}

export default PlanHelp
