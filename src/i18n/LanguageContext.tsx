import { createContext, useState, useContext, ReactNode } from 'react'

export type Language = 'en' | 'zh'

const LANGUAGE_STORAGE_KEY = 'soul-portfolio.language'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
})

function readStoredLanguage(): Language {
  try {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      ?? localStorage.getItem('language')
    return storedLanguage === 'en' || storedLanguage === 'zh' ? storedLanguage : 'en'
  } catch {
    return 'en'
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(readStoredLanguage)

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    } catch {
      // Keep the in-memory preference when storage is unavailable.
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguageContext() {
  return useContext(LanguageContext)
}
