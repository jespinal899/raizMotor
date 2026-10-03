export interface HeroAction {
  label: string
  to: string
}

export interface HeroSlide {
  id: string
  badge: string
  title: string
  description: string
  image: string
  primaryAction: HeroAction
  secondaryAction: HeroAction
}
