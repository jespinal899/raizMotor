import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HeroSlide from '@/features/home/components/HeroSlide'
import { HERO_SLIDES } from '@/features/home/data/heroSlides.data'
import { useCarousel } from '@/features/home/hooks/useCarousel'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS = 6000

const arrowStyle =
  'absolute bottom-5 z-20 rounded-full border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/25 hover:text-white md:top-1/2 md:bottom-auto md:size-11 md:-translate-y-1/2'

const HeroCarousel = () => {
  const { index, paused, goTo, next, prev, rootProps } = useCarousel(HERO_SLIDES.length)

  return (
    <section
      {...rootProps}
      aria-roledescription="carrusel"
      aria-label="Destacados"
      className="relative h-[500px] touch-pan-y overflow-hidden rounded-3xl bg-slate-950 shadow-xl md:h-[600px]"
    >
      {HERO_SLIDES.map((slide, position) => (
        <HeroSlide
          key={slide.id}
          slide={slide}
          active={position === index}
          label={`${position + 1} de ${HERO_SLIDES.length}`}
          priority={position === 0}
        />
      ))}

      <Button
        variant="ghost"
        size="icon-lg"
        onClick={prev}
        aria-label="Slide anterior"
        className={cn(arrowStyle, 'right-16 md:right-auto md:left-4')}
      >
        <ChevronLeft className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={next}
        aria-label="Slide siguiente"
        className={cn(arrowStyle, 'right-5 md:right-4')}
      >
        <ChevronRight className="size-5" />
      </Button>

      <div className="absolute bottom-6 left-5 z-20 flex items-center md:left-1/2 md:-translate-x-1/2">
        {HERO_SLIDES.map((slide, position) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(position)}
            aria-label={`Ir al slide ${position + 1}`}
            aria-current={position === index ? 'true' : undefined}
            className="group grid h-6 place-items-center rounded-full px-1 outline-none focus-visible:ring-3 focus-visible:ring-white/60"
          >
            <span
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                position === index ? 'w-7 bg-white' : 'w-2 bg-white/50 group-hover:bg-white/80',
              )}
            />
          </button>
        ))}
      </div>

      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-20 h-1 bg-white/20">
        {/* La barra también es el temporizador: al completarse avanza al siguiente slide. */}
        <div
          key={index}
          data-slot="carousel-progress"
          onAnimationEnd={next}
          style={{
            animationDuration: `${AUTOPLAY_MS}ms`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
          className="h-full origin-left animate-carousel-progress bg-primary-light"
        />
      </div>
    </section>
  )
}

export default HeroCarousel
