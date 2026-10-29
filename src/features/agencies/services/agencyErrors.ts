/** La dirección elegida ya la usa otra inmobiliaria. */
export class AgencySlugTakenError extends Error {
  constructor() {
    super('Esa dirección ya la usa otra inmobiliaria.')
    this.name = 'AgencySlugTakenError'
  }
}

/** La cuenta no tiene un plan de inmobiliaria: no puede crear su perfil. */
export class AgencyPlanRequiredError extends Error {
  constructor() {
    super('Tu plan no incluye perfil de inmobiliaria.')
    this.name = 'AgencyPlanRequiredError'
  }
}
