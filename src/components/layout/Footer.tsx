import { Link } from 'react-router-dom'
import Container from '@/components/layout/Container'
import Logo from '@/components/layout/Logo'
import { FOOTER_SECTIONS } from '@/components/layout/navigation'
import { BRAND } from '@/shared/constants/brand'

const CURRENT_YEAR = new Date().getFullYear()

const Footer = () => {
  return (
    <footer className="border-t bg-muted/40">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div className="grid content-start gap-4 sm:col-span-2 lg:col-span-1">
          <Logo className="justify-self-start" />
          <p className="max-w-xs text-sm text-muted-foreground">{BRAND.tagline}</p>
        </div>

        {FOOTER_SECTIONS.map(({ title, links }) => (
          <nav key={title} aria-label={title} className="grid content-start gap-3">
            <h2 className="text-sm font-semibold">{title}</h2>
            <ul className="grid gap-2">
              {links.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="rounded text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <div className="border-t">
        <Container className="py-5">
          <p className="text-sm text-muted-foreground">
            © {CURRENT_YEAR} {BRAND.name}. Todos los derechos reservados.
          </p>
        </Container>
      </div>
    </footer>
  )
}

export default Footer
