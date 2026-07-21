import './index.css'
import ReactDOM from 'react-dom/client'
import App from './App'
import { LanguageProvider } from './i18n'

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>,
)
