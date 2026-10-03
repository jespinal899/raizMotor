import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { formatPageTitle, usePageTitle } from '@/hooks/usePageTitle'
import { BRAND } from '@/shared/constants/brand'

describe('formatPageTitle', () => {
  it('añade el nombre de la marca al título de la página', () => {
    // Arrange
    const title = 'Casas en venta'

    // Act
    const formatted = formatPageTitle(title)

    // Assert
    expect(formatted).toBe(`Casas en venta | ${BRAND.name}`)
  })

  it('usa solo la marca cuando no hay título', () => {
    // Arrange
    const title = undefined

    // Act
    const formatted = formatPageTitle(title)

    // Assert
    expect(formatted).toBe(BRAND.name)
  })
})

describe('usePageTitle', () => {
  it('pone el título en la pestaña', () => {
    // Arrange
    const title = 'Contacto'

    // Act
    renderHook(() => usePageTitle(title))

    // Assert
    expect(document.title).toBe(`Contacto | ${BRAND.name}`)
  })

  it('actualiza la pestaña cuando el título cambia', () => {
    // Arrange
    const { rerender } = renderHook(({ title }) => usePageTitle(title), { initialProps: { title: 'Casas' } })

    // Act
    rerender({ title: 'Terrenos' })

    // Assert
    expect(document.title).toBe(`Terrenos | ${BRAND.name}`)
  })

  it('deja solo la marca al desmontarse', () => {
    // Arrange
    const { unmount } = renderHook(() => usePageTitle('Contacto'))

    // Act
    unmount()

    // Assert
    expect(document.title).toBe(BRAND.name)
  })
})
