import { experience } from '../data';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function Experience() {
  const { language, t } = useLanguage();
  const { ref, className } = useScrollAnimation();

  return (
    <section id="experience" className="py-20 bg-[#111827]">
      <div ref={ref} className={className}>

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white inline-block relative">
            {t('section_experience')}
            <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full" />
          </h2>
        </div>


        <div className="relative max-w-3xl mx-auto px-4">

          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-secondary" />

          {experience.map((exp, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={index} className="relative flex items-start mb-12 last:mb-0">

                <div className="w-4 h-4 rounded-full bg-primary absolute left-2 md:left-1/2 -translate-x-1/2 mt-1.5 z-10 ring-2 ring-[#111827]" />


                <div
                  className={`
                    bg-[#0a0a0f] rounded-xl p-6 border border-gray-800
                    ml-10 md:ml-0 md:w-5/12
                    ${isEven ? 'md:mr-auto md:ml-0' : 'md:ml-auto'}
                  `}
                >
                  <p className="text-gray-400 text-sm mb-1">{exp.period}</p>
                  <h3 className="text-lg font-semibold text-white">{exp.company[language]}</h3>
                  <p className="text-primary text-sm font-medium mb-3">{exp.role[language]}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{exp.description[language]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
