import { cn } from '@/lib/utils'

interface CarouselDotsProps {
  count: number
  activeIndex: number
  onSelect: (index: number) => void
}

const CarouselDots = ({ count, activeIndex, onSelect }: CarouselDotsProps) => {
  return (
    <div className="absolute bottom-6 left-5 z-20 flex items-center md:left-1/2 md:-translate-x-1/2">
      {Array.from({ length: count }, (_, position) => {
        const active = position === activeIndex

        return (
          <button
            key={position}
            type="button"
            onClick={() => onSelect(position)}
            aria-label={`Ir al slide ${position + 1}`}
            aria-current={active ? 'true' : undefined}
            className="group grid h-6 place-items-center rounded-full px-1 outline-none focus-visible:ring-3 focus-visible:ring-white/60"
          >
            <span
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                active ? 'w-7 bg-white' : 'w-2 bg-white/50 group-hover:bg-white/80',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export default CarouselDots
