import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StepBackButtonProps {
  onClick: () => void
}

/** Vuelve al paso anterior de un formulario por pasos, sin enviarlo. */
const StepBackButton = ({ onClick }: StepBackButtonProps) => {
  return (
    <Button type="button" variant="outline" size="lg" onClick={onClick} className="h-11 px-5 text-base">
      <ArrowLeft />
      Atrás
    </Button>
  )
}

export default StepBackButton
