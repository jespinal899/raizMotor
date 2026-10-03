import Container from '@/components/layout/Container'
import { HOW_IT_WORKS_STEPS } from '@/features/home/data/howItWorks.data'
import { BRAND } from '@/shared/constants/brand'
import { SECTION_IDS } from '@/shared/constants/routes'

const TITLE_ID = `${SECTION_IDS.howItWorks}-titulo`

const HowItWorks = () => {
  return (
    // scroll-mt deja espacio para el header fijo cuando se llega por un enlace a esta sección.
    <section id={SECTION_IDS.howItWorks} aria-labelledby={TITLE_ID} className="scroll-mt-20 border-t">
      <Container className="py-14">
        <h2 id={TITLE_ID} className="mb-8 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          En {BRAND.name} te ayudamos
        </h2>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map(({ icon: Icon, title, description }) => (
            <li key={title} className="grid content-start gap-3 rounded-2xl bg-muted/50 p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-lg font-semibold">{title}</h3>
              <p className="text-sm text-pretty text-muted-foreground">{description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

export default HowItWorks
