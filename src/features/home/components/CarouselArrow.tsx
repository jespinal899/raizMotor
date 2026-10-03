import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ARROWS = {
  prev: { label: 'Slide anterior', Icon: ChevronLeft, position: 'right-16 md:right-auto md:left-4' },
  next: { label: 'Slide siguiente', Icon: ChevronRight, position: 'right-5 md:right-4' },
} as const

interface CarouselArrowProps {
  direction: keyof typeof ARROWS
  onClick: () => void
}

const CarouselArrow = ({ direction, onClick }: CarouselArrowProps) => {
  const { label, Icon, position } = ARROWS[direction]

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'absolute bottom-5 z-20 rounded-full border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/25 hover:text-white md:top-1/2 md:bottom-auto md:size-11 md:-translate-y-1/2',
        position,
      )}
    >
      <Icon className="size-5" />
    </Button>
  )
}

export default CarouselArrow
