import { contact } from '../data'
import { useLanguage } from '../i18n/useLanguage'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const cards = [
  {
    emoji: '📧',
    labelKey: 'contact_email' as const,
    display: 'zhiyetang2022@foxmail.com',
    href: `mailto:${contact.email}`,
    iconBg: 'bg-amber-50',
    border: 'hover:border-amber-400/50',
  },
  {
    emoji: '🐙',
    labelKey: 'contact_github' as const,
    display: '@ZhiyeTang',
    href: contact.github,
    iconBg: 'bg-sage-50',
    border: 'hover:border-amber-400/50',
  },
  {
    emoji: '💼',
    labelKey: 'contact_linkedin' as const,
    display: '@zhiye-tang',
    href: contact.linkedin,
    iconBg: 'bg-amber-50',
    border: 'hover:border-amber-400/50',
  },
]

export function Contact() {
  const { t } = useLanguage()
  const { ref, className } = useScrollAnimation()

  return (
    <section id="contact" className="py-20 bg-[#F0EDE6]">
      <div ref={ref} className={`max-w-5xl mx-auto px-6 ${className}`}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display text-warm-gray-900 mb-3">
            {t('section_contact')}
          </h2>
          <div className="divider-gold w-24 mx-auto mb-4" />
          <p className="text-warm-gray-500 text-lg">{t('contact_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {cards.map((card) => (
            <a
              key={card.labelKey}
              href={card.href}
              target={card.href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className={`bg-white rounded-xl p-8 border border-amber-900/10 ${card.border} transition-all duration-300 text-center group block hover:-translate-y-1 hover:shadow-md`}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${card.iconBg} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
                {card.emoji}
              </div>
              <p className="text-warm-gray-900 font-medium mb-2">{t(card.labelKey)}</p>
              <p className="text-warm-gray-500 text-sm group-hover:text-amber-600 transition-colors duration-300 break-all">
                {card.display}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
