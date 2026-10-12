import type { ProjectKind, ProjectStage } from '@/features/projects/types/project.types'

export const PROJECT_KINDS: Record<ProjectKind, { label: string; plural: string }> = {
  residencial: { label: 'Residencial', plural: 'Residenciales' },
  torre: { label: 'Torre de apartamentos', plural: 'Torres de apartamentos' },
  condominio: { label: 'Condominio', plural: 'Condominios' },
  lotificacion: { label: 'Lotificación', plural: 'Lotificaciones' },
}

export const PROJECT_STAGES: Record<ProjectStage, { label: string; description: string }> = {
  preventa: { label: 'Preventa', description: 'En planos: se reserva antes de empezar la obra.' },
  construccion: { label: 'En construcción', description: 'La obra ya avanza.' },
  entrega_inmediata: { label: 'Entrega inmediata', description: 'Terminado y listo para entregar.' },
}

/** Precios máximos que ofrece el filtro del catálogo, en USD. */
export const PROJECT_MAX_PRICES = [75000, 100000, 150000, 200000, 300000]
