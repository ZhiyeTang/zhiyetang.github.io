import { useState } from 'react';
import { publications } from '../data';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

function PublicationCard({ pub }: { pub: (typeof publications)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const { language, t } = useLanguage();

  return (
    <div className="bg-white rounded border border-amber-900/10 p-6 hover:border-amber-900/20 hover:shadow-[0_4px_20px_rgba(184,134,74,0.08)] transition-all duration-300">
      <h3 className="font-display text-lg text-warm-gray-900 mb-2 leading-snug">{pub.title}</h3>

      <p className="text-sm text-warm-gray-600 mb-2">
        {pub.authors.map((author, i) => (
          <span key={author}>
            {author === 'Zhiye Tang' ? (
              <span className="text-amber-600 font-medium">{author}</span>
            ) : (
              <span>{author}</span>
            )}
            {i < pub.authors.length - 1 && <span className="text-warm-gray-400">, </span>}
          </span>
        ))}
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-sage-600 text-sm italic">{pub.venue}</span>
        <span className="text-warm-gray-400 text-sm">{pub.year}</span>
        {pub.doi && (
          <a
            href={`https://doi.org/${pub.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-warm-gray-400 hover:text-amber-600 transition-colors duration-200 underline underline-offset-2"
          >
            DOI: {pub.doi}
          </a>
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-amber-600 hover:text-amber-700 transition-colors duration-200 font-medium"
      >
        {expanded ? t('publications_hide_abstract') : t('publications_show_abstract')}
      </button>

      {expanded && (
        <p className="mt-3 text-sm text-warm-gray-500 leading-relaxed border-t border-amber-900/8 pt-3">
          {pub.abstract[language]}
        </p>
      )}
    </div>
  );
}

export function Publications() {
  const { t } = useLanguage();
  const { ref, className } = useScrollAnimation();

  return (
    <section id="publications" className="py-20 bg-[#F0EDE6]">
      <div ref={ref} className={`max-w-4xl mx-auto px-6 ${className}`}>
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl text-warm-gray-900 mb-4">{t('section_publications')}</h2>
          <div className="divider-gold mx-auto" />
        </div>

        <div className="flex flex-col gap-6">
          {publications.map((pub, index) => (
            <PublicationCard key={pub.doi || index} pub={pub} />
          ))}
        </div>
      </div>
    </section>
  );
}
