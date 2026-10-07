import TextLink from '@/components/TextLink'
import { ROUTES } from '@/shared/constants/routes'

/** Para quien duda entre planes: le ofrece escribir y que le ayuden a elegir. */
const PlanHelp = () => {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
      ¿No sabes cuál te conviene?{' '}
      <TextLink to={ROUTES.contact}>Escríbenos y te ayudamos a elegir</TextLink>
    </p>
  )
}

export default PlanHelp
