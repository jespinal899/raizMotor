interface FieldErrorProps {
  /** El control lo referencia con `aria-describedby`. */
  id: string
  message?: string
}

const FieldError = ({ id, message }: FieldErrorProps) => {
  if (!message) return null

  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  )
}

export default FieldError
