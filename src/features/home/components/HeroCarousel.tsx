import CarouselArrow from '@/features/home/components/CarouselArrow'
import CarouselDots from '@/features/home/components/CarouselDots'
import CarouselProgress from '@/features/home/components/CarouselProgress'
import HeroSlide from '@/features/home/components/HeroSlide'
import { HERO_SLIDES } from '@/features/home/data/heroSlides.data'
import { useCarousel } from '@/features/home/hooks/useCarousel'

const AUTOPLAY_MS = 6000

const HeroCarousel = () => {
  const { index, paused, goTo, next, prev, rootProps } = useCarousel({
    count: HERO_SLIDES.length,
    autoplayMs: AUTOPLAY_MS,
  })

  return (
    <section
      {...rootProps}
      aria-roledescription="carrusel"
      aria-label="Destacados"
      className="relative h-125 touch-pan-y overflow-hidden bg-slate-950 md:h-150"
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

      <CarouselArrow direction="prev" onClick={prev} />
      <CarouselArrow direction="next" onClick={next} />
      <CarouselDots count={HERO_SLIDES.length} activeIndex={index} onSelect={goTo} />
      <CarouselProgress cycleKey={index} durationMs={AUTOPLAY_MS} paused={paused} />
    </section>
  )
}

export default HeroCarousel
