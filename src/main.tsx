import './portfolio.css'
import { createRoot } from 'react-dom/client'
import { LanguageProvider } from './i18n/LanguageContext'
import SoulPortfolio from './SoulPortfolio'

createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <SoulPortfolio />
  </LanguageProvider>,
)
