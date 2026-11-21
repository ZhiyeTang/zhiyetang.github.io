import './portfolio.css'
import ReactDOM from 'react-dom/client'
import App from './App'
import { LanguageProvider } from './i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>,
)
