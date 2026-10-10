import { vi } from 'vitest'
import type {
  AdminAccount,
  AdminListing,
  AdminReport,
  AdminService,
} from '@/features/admin/types/admin.types'
import type { Paginated } from '@/shared/types/common.types'

export const pageOf = <T>(items: T[], total = items.length, page = 1): Paginated<T> => ({
  items,
  total,
  page,
  pageSize: 20,
  totalPages: Math.max(1, Math.ceil(total / 20)),
})

export const buildReport = (overrides: Partial<AdminReport> = {}): AdminReport => ({
  id: 'reporte-1',
  reason: 'fraud',
  details: 'Pide un depósito antes de mostrar la casa.',
  status: 'open',
  createdAt: '2026-10-11T15:30:00.000Z',
  property: { id: 'anuncio-1', title: 'Casa amplia con patio en Palmira', status: 'published' },
  ...overrides,
})

export const buildListing = (overrides: Partial<AdminListing> = {}): AdminListing => ({
  id: 'anuncio-1',
  title: 'Casa amplia con patio en Palmira',
  status: 'published',
  advertiserName: 'Ana Mejía',
  advertiserPhone: '+50499999999',
  city: 'Tegucigalpa (Distrito Central)',
  price: 145000,
  operation: 'venta',
  createdAt: '2026-10-09T12:00:00.000Z',
  ...overrides,
})

export const buildAccount = (overrides: Partial<AdminAccount> = {}): AdminAccount => ({
  id: 'cuenta-1',
  email: 'ana@ejemplo.hn',
  firstName: 'Ana',
  lastName: 'Mejía',
  phone: '+50499999999',
  maxPublications: 1,
  role: 'user',
  publishedCount: 1,
  createdAt: '2026-10-01T09:00:00.000Z',
  ...overrides,
})

/** Un servicio del panel de mentira: por defecto, la cuenta es del equipo y todas las listas están vacías. */
export const buildAdminService = (overrides: Partial<AdminService> = {}): AdminService => ({
  isAdmin: vi.fn(async () => true),
  listReports: vi.fn(async () => pageOf<AdminReport>([])),
  reviewReport: vi.fn(async () => {}),
  listListings: vi.fn(async () => pageOf<AdminListing>([])),
  setListingStatus: vi.fn(async () => {}),
  listAccounts: vi.fn(async () => pageOf<AdminAccount>([])),
  setPublicationLimit: vi.fn(async () => {}),
  ...overrides,
})
