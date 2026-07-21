import { skills } from '../data';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useRef } from 'react';
import type { SkillGroup } from '../types';

function SkillGroupCard({ group }: { group: SkillGroup }) {
  const { language } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref);

  return (
    <div
      ref={ref}
      className={`bg-[#111827] rounded-xl p-6 ${
        isVisible
          ? 'opacity-100 translate-y-0 transition-all duration-700 ease-out'
          : 'opacity-0 translate-y-8'
      }`}
    >
      <h3 className="text-lg font-semibold text-white mb-5 tracking-wide">
        {group.category[language]}
      </h3>
      <div className="space-y-4">
        {group.items.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between mb-1.5">
              <span className="text-sm text-gray-300">{item.name}</span>
              <span className="text-sm text-gray-400">{item.proficiency}%</span>
            </div>
            <div className="bg-gray-700 rounded-full h-2">
              <div
                className={`bg-gradient-to-r from-primary to-secondary rounded-full h-2 transition-all duration-1000`}
                style={{ width: isVisible ? `${item.proficiency}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Skills() {
  const { t } = useLanguage();
  const { ref, className } = useScrollAnimation();

  return (
    <section id="skills" className="py-20 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-6">
        <div ref={ref} className={`text-center mb-14 ${className}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('section_skills')}
          </h2>
          <div className="mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-primary to-secondary" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skills.map((group) => (
            <SkillGroupCard key={group.category.en} group={group} />
          ))}
        </div>
      </div>
    </section>
  );
}
