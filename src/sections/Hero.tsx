import { personalInfo, contact } from '../data';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function Hero() {
  const { language, t } = useLanguage();
  const { ref, className } = useScrollAnimation();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center bg-mesh overflow-hidden"
    >
      <div
        ref={ref}
        className={`relative z-10 flex flex-col items-center text-center px-6 gap-7 py-24 ${className}`}
      >

        <img
          src="/hero.png"
          alt={personalInfo.name}
          className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover shadow-lg shadow-amber-900/15 ring-4 ring-amber-100"
        />

        <div className="flex flex-col items-center gap-3">
          <h1 className="font-display text-5xl md:text-7xl text-warm-gray-900 tracking-tight leading-tight">
            {language === 'en' ? personalInfo.name : '唐致烨'}
          </h1>

          <p className="font-sans text-xs text-warm-gray-500 tracking-[0.2em] uppercase mt-1">
            {t('hero_title')}
          </p>
        </div>

        <div className="divider-gold w-16 mx-auto" />

        <p className="font-sans text-warm-gray-500 max-w-xl text-center leading-relaxed text-base">
          {personalInfo.bio[language]}
        </p>

        <div className="flex flex-wrap gap-4 justify-center mt-1">
          <a
            href="#publications"
            className="px-7 py-2.5 rounded-md bg-amber-600 text-warm-gray-900 text-sm font-medium hover:bg-amber-700 hover:text-white transition-colors duration-200 shadow-sm"
          >
            {t('hero_cta_projects')}
          </a>
          <a
            href="#contact"
            className="px-7 py-2.5 rounded-md border border-amber-500 text-amber-700 text-sm font-medium hover:bg-amber-50 transition-colors duration-200"
          >
            {t('hero_cta_contact')}
          </a>
        </div>

        <div className="flex gap-6 mt-1">
          <a
            href={contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-warm-gray-400 hover:text-amber-600 transition-colors text-sm font-medium"
          >
            GitHub
          </a>
          <a
            href={`mailto:${contact.email}`}
            className="text-warm-gray-400 hover:text-amber-600 transition-colors text-sm font-medium"
          >
            Email
          </a>
        </div>
      </div>

      <a
        href="#publications"
        aria-label={t('hero_scroll')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-warm-gray-300 hover:text-amber-500 transition-colors animate-bounce"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </a>
    </section>
  );
}
