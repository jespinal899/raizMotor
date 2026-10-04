interface FieldCaptionProps {
  label: string
  /** Aclaración junto a la etiqueta, p. ej. "opcional" o la unidad de medida. */
  hint?: string
}

/** Texto de la etiqueta de un campo, con su aclaración entre paréntesis. */
const FieldCaption = ({ label, hint }: FieldCaptionProps) => {
  return (
    <>
      {label}
      {hint && (
        <>
          {' '}
          <span className="font-normal text-muted-foreground">({hint})</span>
        </>
      )}
    </>
  )
}

export default FieldCaption
