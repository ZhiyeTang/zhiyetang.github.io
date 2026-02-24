import { useState } from 'react';
import { patents } from '../data';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

function PatentCard({ patent }: { patent: (typeof patents)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const { language, t } = useLanguage();

  return (
    <div className="bg-white rounded border border-amber-900/10 p-6 hover:border-amber-900/20 hover:shadow-[0_4px_20px_rgba(184,134,74,0.08)] transition-all duration-300">
      <h3 className="font-display text-lg text-warm-gray-900 mb-2 leading-snug">
        {patent.title[language]}
      </h3>

      <p className="text-sm text-warm-gray-600 mb-2">
        {patent.inventors.map((inventor, i) => (
          <span key={inventor}>
            {inventor === 'Zhiye Tang' || inventor === '唐致烨' ? (
              <span className="text-amber-600 font-medium">{inventor}</span>
            ) : (
              <span>{inventor}</span>
            )}
            {i < patent.inventors.length - 1 && <span className="text-warm-gray-400">, </span>}
          </span>
        ))}
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-sage-600 font-mono text-sm bg-sage-50 px-3 py-1 rounded">
          {patent.patentNumber}
        </span>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-amber-600 hover:text-amber-700 transition-colors duration-200 font-medium"
      >
        {expanded ? t('patents_hide_description') : t('patents_show_description')}
      </button>

      {expanded && (
        <p className="mt-3 text-sm text-warm-gray-500 leading-relaxed border-t border-amber-900/8 pt-3">
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
    <section id="patents" className="py-20 bg-[#FAFAF7]">
      <div ref={ref} className={`max-w-4xl mx-auto px-6 ${className}`}>
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl text-warm-gray-900 mb-4">{t('section_patents')}</h2>
          <div className="divider-gold mx-auto" />
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
