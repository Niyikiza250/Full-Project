import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import i18n from './i18n/config'
import { getDefaultLanguageSetting } from './api/systemSettings'
import { setSystemDefaultLanguage } from './lib/language'

async function bootstrap() {
  try {
    const defaultLanguage = await getDefaultLanguageSetting()
    if (defaultLanguage) {
      setSystemDefaultLanguage(defaultLanguage)
      if (i18n.language !== defaultLanguage) {
        await i18n.changeLanguage(defaultLanguage)
      }
    }
  } catch {
    // Keep the cached fallback language when shared settings are unavailable.
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
