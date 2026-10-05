/** Promesa que la prueba resuelve cuando quiere, para observar el estado mientras está pendiente. */
export const deferred = () => {
  let finish: () => void = () => {}
  const promise = new Promise<void>((resolve) => {
    finish = resolve
  })

  return { promise, finish }
}
