/** Almacén en memoria con la forma del `localStorage` del navegador, para probar sin tocar el de verdad. */
export const memoryStorage = (initial: Record<string, string> = {}): Storage => {
  const entries = new Map(Object.entries(initial))

  return {
    get length() {
      return entries.size
    },
    key: (position) => [...entries.keys()][position] ?? null,
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => {
      entries.set(key, value)
    },
    removeItem: (key) => {
      entries.delete(key)
    },
    clear: () => entries.clear(),
  }
}
