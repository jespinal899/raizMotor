import { ISV_RATE } from '@/shared/constants/tax'

/** Lo que se paga cada mes por un plan, en lempiras. */
export interface PlanTotal {
  /** El precio del plan, sin impuesto. */
  price: number
  tax: number
  total: number
}

const toCents = (amount: number) => Math.round(amount * 100) / 100

/** Suma al precio mensual de un plan el impuesto sobre ventas, al centavo. */
export const toPlanTotal = (monthlyPrice: number, taxRate: number = ISV_RATE): PlanTotal => {
  const tax = toCents(monthlyPrice * taxRate)

  return { price: monthlyPrice, tax, total: toCents(monthlyPrice + tax) }
}
