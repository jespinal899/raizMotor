import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { HeroSlide as HeroSlideData } from '@/features/home/types/hero.types'
import { cn } from '@/lib/utils'

interface HeroSlideProps {
  slide: HeroSlideData
  active: boolean
  label: string
  priority?: boolean
}

const HeroSlide = ({ slide, active, label, priority = false }: HeroSlideProps) => {
  const Heading = priority ? 'h1' : 'h2'
  const enter = active && 'animate-fade-up'

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={label}
      inert={!active}
      data-active={active}
      className={cn(
        'absolute inset-0 transition-opacity duration-700 ease-in-out',
        active ? 'z-10 opacity-100' : 'opacity-0',
      )}
    >
      <img
        src={slide.image}
        alt=""
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-r from-slate-950/90 via-slate-950/70 to-slate-950/35" />

      <div className="relative flex h-full max-w-3xl flex-col items-start justify-center gap-4 px-6 pb-16 sm:px-10 md:gap-5 md:px-20">
        <Badge
          className={cn(
            'h-7 border-white/25 bg-white/15 px-3 font-semibold tracking-widest text-white backdrop-blur-sm',
            enter,
          )}
        >
          {slide.badge}
        </Badge>
        <Heading
          className={cn(
            'font-heading text-3xl font-semibold tracking-tight text-balance text-white [animation-delay:120ms] sm:text-4xl md:text-6xl',
            enter,
          )}
        >
          {slide.title}
        </Heading>
        <p
          className={cn(
            'max-w-xl text-sm text-pretty text-white/85 [animation-delay:240ms] sm:text-base md:text-lg',
            enter,
          )}
        >
          {slide.description}
        </p>
        <div className={cn('flex flex-wrap gap-3 pt-1 [animation-delay:360ms]', enter)}>
          <Button
            size="lg"
            nativeButton={false}
            render={<Link to={slide.primaryAction.to} />}
            className="h-10 px-4 shadow-lg shadow-slate-950/40 sm:h-11 sm:px-5 sm:text-base"
          >
            {slide.primaryAction.label}
          </Button>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link to={slide.secondaryAction.to} />}
            className="h-10 border-white/40 bg-white/10 px-4 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:h-11 sm:px-5 sm:text-base"
          >
            {slide.secondaryAction.label}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HeroSlide
