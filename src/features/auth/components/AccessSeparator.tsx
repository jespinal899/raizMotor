import { FieldSeparator } from '@/components/ui/field'

/** Línea que separa el formulario del acceso con Google, igual al iniciar sesión y al registrarse. */
const AccessSeparator = () => {
  return (
    // El texto tapa la línea con el color de la tarjeta, que es sobre lo que está, no con el de la página.
    <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">O continúa con</FieldSeparator>
  )
}

export default AccessSeparator
