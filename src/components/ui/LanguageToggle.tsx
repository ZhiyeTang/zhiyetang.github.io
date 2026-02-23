import { useLanguage } from '../../i18n'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setLanguage('en')}
        className={`transition-all duration-300 ${
          language === 'en'
            ? 'bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        EN
      </button>
      <span className="text-gray-400">/</span>
      <button
        onClick={() => setLanguage('zh')}
        className={`transition-all duration-300 ${
          language === 'zh'
            ? 'bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        中
      </button>
    </div>
  )
}
