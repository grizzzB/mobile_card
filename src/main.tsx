import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WEDDING_CONFIG } from './utils/constants/weddingInfo'

const { bride, groom } = WEDDING_CONFIG;
document.title = `${bride.self.name} ♥ ${groom.self.name} 결혼합니다`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
