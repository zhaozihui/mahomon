import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import KindlePage from './pages/kindle/KindlePage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KindlePage />
  </StrictMode>,
)
