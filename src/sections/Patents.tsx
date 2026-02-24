import { useState } from 'react';
import { patents } from '../data';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

function PatentCard({ patent }: { patent: (typeof patents)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const { language, t } = useLanguage();

  return (
    <div className="bg-[#111827] rounded-xl p-6 border border-gray-800 hover:border-gray-600 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-white mb-2">
        {patent.title[language]}
      </h3>

      <p className="text-sm text-gray-300 mb-2">
        {patent.inventors.map((inventor, i) => (
          <span key={inventor}>
            {inventor === 'Zhiye Tang' || inventor === '唐致烨' ? (
              <strong className="text-primary">{inventor}</strong>
            ) : (
              <span>{inventor}</span>
            )}
            {i < patent.inventors.length - 1 && <span className="text-gray-500">, </span>}
          </span>
        ))}
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-secondary text-sm font-mono bg-[#0a0a0f] px-3 py-1 rounded">
          {patent.patentNumber}
        </span>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-secondary hover:text-primary transition-colors duration-200 font-medium"
      >
        {expanded ? t('patents_hide_description') : t('patents_show_description')}
      </button>

      {expanded && (
        <p className="mt-3 text-sm text-gray-400 leading-relaxed border-t border-gray-700 pt-3">
          {patent.description[language]}
        </p>
      )}
    </div>
  );
}

export function Patents() {
  const { t } = useLanguage();
  const { ref, className } = useScrollAnimation();

  return (
    <section id="patents" className="py-20 bg-[#0a0a0f]">
      <div ref={ref} className={`max-w-4xl mx-auto px-6 ${className}`}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">{t('section_patents')}</h2>
          <div className="mx-auto w-16 h-1 rounded-full bg-gradient-to-r from-primary to-secondary" />
        </div>

        <div className="flex flex-col gap-6">
          {patents.map((patent, index) => (
            <PatentCard key={patent.patentNumber || index} patent={patent} />
          ))}
        </div>
      </div>
    </section>
  );
}
