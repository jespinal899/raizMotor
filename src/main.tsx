import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RaizMotor from './raizMotor'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RaizMotor />
  </StrictMode>,
)
