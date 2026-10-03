interface CarouselProgressProps {
  /** Cambia en cada ciclo para reiniciar la barra. */
  cycleKey: number
  durationMs: number
  paused: boolean
}

/** Indicador visual del tiempo que le queda al slide; el avance real lo decide `useAutoplay`. */
const CarouselProgress = ({ cycleKey, durationMs, paused }: CarouselProgressProps) => {
  return (
    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-20 h-1 bg-white/20">
      <div
        key={cycleKey}
        data-slot="carousel-progress"
        style={{
          animationDuration: `${durationMs}ms`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
        className="h-full origin-left animate-carousel-progress bg-primary-light"
      />
    </div>
  )
}

export default CarouselProgress
