import { useState } from 'react';
import { publications } from '../data';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

function PublicationCard({ pub }: { pub: (typeof publications)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const { language, t } = useLanguage();

  return (
    <div className="bg-[#111827] rounded-xl p-6 border border-gray-800 hover:border-gray-600 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-white mb-2">{pub.title}</h3>

      <p className="text-sm text-gray-300 mb-2">
        {pub.authors.map((author, i) => (
          <span key={author}>
            {author === 'Zhiye Tang' ? (
              <strong className="text-primary">{author}</strong>
            ) : (
              <span>{author}</span>
            )}
            {i < pub.authors.length - 1 && <span className="text-gray-500">, </span>}
          </span>
        ))}
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-secondary text-sm italic">{pub.venue}</span>
        <span className="text-gray-400 text-sm">{pub.year}</span>
        {pub.doi && (
          <a
            href={`https://doi.org/${pub.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-primary transition-colors duration-200 underline underline-offset-2"
          >
            DOI: {pub.doi}
          </a>
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-secondary hover:text-primary transition-colors duration-200 font-medium"
      >
        {expanded ? t('publications_hide_abstract') : t('publications_show_abstract')}
      </button>

      {expanded && (
        <p className="mt-3 text-sm text-gray-400 leading-relaxed border-t border-gray-700 pt-3">
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
    <section id="publications" className="py-20 bg-[#0a0a0f]">
      <div ref={ref} className={`max-w-4xl mx-auto px-6 ${className}`}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">{t('section_publications')}</h2>
          <div className="mx-auto w-16 h-1 rounded-full bg-gradient-to-r from-primary to-secondary" />
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
