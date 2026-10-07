export interface LegalSection {
  /** Identifica el título de la sección dentro de la página. */
  id: string
  title: string
  paragraphs: string[]
  /** Puntos que se muestran como lista, después del texto. */
  items?: string[]
}

export interface LegalDocumentContent {
  title: string
  /** Una frase que dice de qué trata el documento. */
  summary: string
  /** Día de la última revisión, como `AAAA-MM-DD`. */
  updatedOn: string
  sections: LegalSection[]
  /** El otro documento legal, para pasar de uno a otro. */
  related: { label: string; to: string }
}
