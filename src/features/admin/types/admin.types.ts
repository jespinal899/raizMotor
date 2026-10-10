import type { PropertyOperation } from '@/features/properties/types/property.types'
import type { ReportReason } from '@/features/properties/types/report.types'
import type { PageRequest, Paginated } from '@/shared/types/common.types'

/** `open` espera revisión; `resolved` llevó a una medida; `dismissed` se revisó y no hacía falta ninguna. */
export type ReportStatus = 'open' | 'resolved' | 'dismissed'

/** Qué se decide al revisar un reporte. `hide_property` oculta el anuncio y resuelve todos sus reportes pendientes. */
export type ReportDecision = 'hide_property' | 'resolve' | 'dismiss'

/** Estado de un anuncio: en el catálogo, retirado por su dueño o retirado por el equipo. */
export type ListingStatus = 'published' | 'unpublished' | 'hidden'

export interface AdminReport {
  id: string
  reason: ReportReason
  details: string
  status: ReportStatus
  /** Fecha y hora ISO. */
  createdAt: string
  /** El anuncio reportado; `null` si ya no existe. */
  property: { id: string; title: string; status: ListingStatus } | null
}

export interface AdminListing {
  id: string
  title: string
  status: ListingStatus
  advertiserName: string
  advertiserPhone: string
  city: string
  price: number
  operation: PropertyOperation
  createdAt: string
}

export interface AdminAccount {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  /** Cuántos anuncios puede tener publicados a la vez. */
  maxPublications: number
  role: 'user' | 'admin'
  publishedCount: number
  createdAt: string
}

export interface ListingFilter {
  /** Sin él, todos. */
  status?: ListingStatus
  /** Un trozo del título. */
  search?: string
}

/** Lo que el panel de administración pide al servidor. Lo que cambia algo queda anotado con quién y cuándo. */
export interface AdminService {
  /** Si la cuenta con la sesión abierta es del equipo. Sin sesión, no. */
  isAdmin(): Promise<boolean>
  listReports(status: ReportStatus, page: PageRequest): Promise<Paginated<AdminReport>>
  reviewReport(reportId: string, decision: ReportDecision, note: string): Promise<void>
  listListings(filter: ListingFilter, page: PageRequest): Promise<Paginated<AdminListing>>
  /** Oculta un anuncio, o devuelve al catálogo uno que ocultó el equipo. */
  setListingStatus(propertyId: string, status: 'published' | 'hidden', note: string): Promise<void>
  /** Busca en el correo y en el nombre. */
  listAccounts(search: string, page: PageRequest): Promise<Paginated<AdminAccount>>
  setPublicationLimit(accountId: string, limit: number, note: string): Promise<void>
}
