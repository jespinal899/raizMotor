/** React Router espera el prefijo sin barra final: "/raizMotor/" → "/raizMotor", "/" → "/". */
export const toRouterBasename = (baseUrl: string) => baseUrl.replace(/\/+$/, '') || '/'
