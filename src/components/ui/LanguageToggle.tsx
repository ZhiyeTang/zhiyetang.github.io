import { useLanguage } from '../../i18n'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        onClick={() => setLanguage('en')}
        className={`transition-colors duration-200 ${
          language === 'en'
            ? 'text-amber-600 font-medium'
            : 'text-warm-gray-400 hover:text-warm-gray-700'
        }`}
      >
        EN
      </button>
      <span className="text-warm-gray-300 select-none">|</span>
      <button
        onClick={() => setLanguage('zh')}
        className={`transition-colors duration-200 ${
          language === 'zh'
            ? 'text-amber-600 font-medium'
            : 'text-warm-gray-400 hover:text-warm-gray-700'
        }`}
      >
        中
      </button>
    </div>
  )
}
