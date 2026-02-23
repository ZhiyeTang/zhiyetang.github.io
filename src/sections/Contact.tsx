import { contact } from '../data'
import { useLanguage } from '../i18n/useLanguage'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const cards = [
  {
    emoji: '📧',
    labelKey: 'contact_email' as const,
    display: 'zhiyetang2022@foxmail.com',
    href: `mailto:${contact.email}`,
    gradient: 'from-primary/20 to-primary/5',
    border: 'hover:border-primary/50',
  },
  {
    emoji: '🐙',
    labelKey: 'contact_github' as const,
    display: '@ZhiyeTang',
    href: contact.github,
    gradient: 'from-secondary/20 to-secondary/5',
    border: 'hover:border-secondary/50',
  },
]

export function Contact() {
  const { t } = useLanguage()
  const { ref, className } = useScrollAnimation()

  return (
    <section id="contact" className="py-20 bg-[#111827]">
      <div ref={ref} className={`max-w-5xl mx-auto px-6 ${className}`}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t('section_contact')}
          </h2>
          <div className="w-16 h-1 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary mb-4" />
          <p className="text-gray-400 text-lg">{t('contact_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {cards.map((card) => (
            <a
              key={card.labelKey}
              href={card.href}
              target={card.href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className={`bg-[#0a0a0f] rounded-xl p-8 border border-gray-800 ${card.border} transition-all duration-300 text-center group block hover:-translate-y-1`}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
                {card.emoji}
              </div>
              <p className="text-white font-semibold mb-2">{t(card.labelKey)}</p>
              <p className="text-gray-400 text-sm group-hover:text-primary transition-colors duration-300 break-all">
                {card.display}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
