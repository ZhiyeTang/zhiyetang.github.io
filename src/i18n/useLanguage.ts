import { useLanguageContext } from './LanguageContext'
import { translations, TranslationKey } from './translations'

export function useLanguage() {
  const { language, setLanguage } = useLanguageContext()

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key
  }

  return { language, setLanguage, t }
}
