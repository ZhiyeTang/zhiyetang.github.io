import { personalInfo, contact } from '../data';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function Hero() {
  const { language, t } = useLanguage();
  const { ref, className } = useScrollAnimation();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] overflow-hidden"
    >

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div
        ref={ref}
        className={`relative z-10 flex flex-col items-center text-center px-6 gap-6 ${className}`}
      >

        <img src="/hero.png" alt={personalInfo.name} className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover shadow-2xl shadow-primary/30 ring-4 ring-primary/30" />

        <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          {language === 'en' ? personalInfo.name : '唐致烨'}
        </h1>

        <p className="text-xl text-gray-300 font-medium">
          {t('hero_title')}
        </p>

        <p className="text-gray-400 max-w-2xl text-center leading-relaxed">
          {personalInfo.bio[language]}
        </p>

        <div className="flex flex-wrap gap-4 justify-center mt-2">
          <a
            href="#publications"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
          >
            {t('hero_cta_projects')}
          </a>
          <a
            href="#contact"
            className="px-8 py-3 rounded-full border border-primary/50 text-gray-300 font-semibold hover:border-primary hover:text-white transition-colors"
          >
            {t('hero_cta_contact')}
          </a>
        </div>

        <div className="flex gap-6 mt-2">
          <a
            href={contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-primary transition-colors text-sm font-medium"
          >
            GitHub
          </a>
          <a
            href={`mailto:${contact.email}`}
            className="text-gray-400 hover:text-primary transition-colors text-sm font-medium"
          >
            Email
          </a>
        </div>
      </div>

      <a
        href="#publications"
        aria-label={t('hero_scroll')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 hover:text-primary transition-colors animate-bounce"
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
