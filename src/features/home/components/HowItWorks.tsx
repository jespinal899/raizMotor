import { HOW_IT_WORKS_STEPS } from '@/features/home/data/howItWorks.data'
import { BRAND } from '@/shared/constants/brand'
import { SECTION_IDS } from '@/shared/constants/routes'

const TITLE_ID = `${SECTION_IDS.howItWorks}-titulo`

const HowItWorks = () => {
  return (
    // scroll-mt deja espacio para el header fijo cuando se llega por un enlace a esta sección.
    <section id={SECTION_IDS.howItWorks} aria-labelledby={TITLE_ID} className="scroll-mt-20 border-t">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-1.5">
          <h2 id={TITLE_ID} className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Cómo funciona {BRAND.name}
          </h2>
          <p className="text-muted-foreground">Buscar, contactar y publicar en un solo lugar.</p>
        </div>

        <ol className="grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map(({ icon: Icon, title, description }, position) => (
            <li key={title} className="grid content-start gap-3 rounded-2xl bg-muted/50 p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-lg font-semibold">
                {position + 1}. {title}
              </h3>
              <p className="text-sm text-pretty text-muted-foreground">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default HowItWorks
