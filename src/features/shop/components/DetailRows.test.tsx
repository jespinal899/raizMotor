import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DetailRows from '@/features/shop/components/DetailRows'

describe('DetailRows', () => {
  it('muestra cada dato con su valor, en el orden recibido', () => {
    // Arrange
    const rows = [
      { label: 'Plan', value: 'Agente Pro' },
      { label: 'Forma de pago', value: 'Transferencia o depósito' },
    ]

    // Act
    render(<DetailRows rows={rows} />)

    // Assert
    const shown = screen.getAllByRole('term').map((term) => `${term.textContent}: ${term.nextElementSibling?.textContent}`)
    expect(shown).toEqual(['Plan: Agente Pro', 'Forma de pago: Transferencia o depósito'])
  })
})
