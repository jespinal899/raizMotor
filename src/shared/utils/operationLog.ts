/**
 * Recuerda las operaciones ya pedidas por su clave: repetir una entrega su mismo resultado en lugar de
 * ejecutarla otra vez. Una que falló no queda hecha, y reintentarla con la misma clave la ejecuta de nuevo.
 *
 * Es la memoria de un servicio mientras la página está abierta: sirve para el doble envío y el reintento,
 * no para reconocer una operación después de recargar.
 */
export const createOperationLog = <Result>() => {
  const requested = new Map<string, Promise<Result>>()

  return (operationKey: string, run: () => Promise<Result>): Promise<Result> => {
    const known = requested.get(operationKey)
    if (known) return known

    const operation = run()
    requested.set(operationKey, operation)
    operation.catch(() => requested.delete(operationKey))

    return operation
  }
}
