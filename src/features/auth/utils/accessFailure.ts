type ErrorClass = abstract new () => Error

/** Qué estado del formulario explica cada motivo de rechazo conocido. */
export type KnownFailures<Failure> = [reason: ErrorClass, failure: Failure][]

/**
 * Traduce el motivo de un rechazo al estado que lo explica en el formulario. Lo que no se reconoce
 * —un fallo de red, un error inesperado— queda como el fallo genérico.
 */
export const toFailure =
  <Failure>(known: KnownFailures<Failure>, unknown: Failure) =>
  (reason: unknown): Failure =>
    known.find(([KnownError]) => reason instanceof KnownError)?.[1] ?? unknown
