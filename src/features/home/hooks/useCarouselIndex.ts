import { useCallback, useState } from 'react'

const wrap = (position: number, count: number) => ((position % count) + count) % count

export const useCarouselIndex = (count: number) => {
  const [index, setIndex] = useState(0)

  const goTo = useCallback((target: number) => setIndex(wrap(target, count)), [count])
  const next = useCallback(() => setIndex((current) => wrap(current + 1, count)), [count])
  const prev = useCallback(() => setIndex((current) => wrap(current - 1, count)), [count])

  return { index, goTo, next, prev }
}
