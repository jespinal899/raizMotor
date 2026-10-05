import Container from '@/components/layout/Container'
import { BRAND } from '@/shared/constants/brand'
import { SECTION_IDS } from '@/shared/constants/routes'

const LABEL_ID = `${SECTION_IDS.about}-titulo`

const AboutUs = () => {
  return (
    // La sección se llama como el enlace que lleva a ella; `scroll-mt` deja sitio al header fijo al llegar.
    <section id={SECTION_IDS.about} aria-labelledby={LABEL_ID} className="scroll-mt-20 border-t bg-muted/40">
      <Container className="grid gap-6 py-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
        <div className="grid gap-3">
          <p id={LABEL_ID} className="text-sm font-semibold tracking-wide text-primary uppercase">
            Quiénes somos
          </p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            El puente entre tu propiedad y el inquilino perfecto.
          </h2>
        </div>

        <p className="text-lg text-pretty text-muted-foreground">
          {BRAND.name} nació para simplificar lo complejo. Somos la plataforma que reúne a propietarios, agentes e
          inquilinos en un solo lugar para publicar, encontrar y contactar propiedades de forma directa: sin papeleo,
          sin comisiones ocultas y con total transparencia.
        </p>
      </Container>
    </section>
  )
}

export default AboutUs
