import { experience } from '../data';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function Experience() {
  const { language, t } = useLanguage();
  const { ref, className } = useScrollAnimation();

  return (
    <section id="experience" className="py-20 bg-[#F0EDE6]">
      <div ref={ref} className={className}>

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display text-warm-gray-900 mb-4">
            {t('section_experience')}
          </h2>
          <div className="divider-gold w-24 mx-auto" />
        </div>


        <div className="relative max-w-3xl mx-auto px-4">

          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-200 to-amber-100" />

          {experience.map((exp, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={index} className="relative flex items-start mb-12 last:mb-0">

                <div className="w-4 h-4 rounded-full bg-amber-500 absolute left-2 md:left-1/2 -translate-x-1/2 mt-1.5 z-10 ring-2 ring-[#F0EDE6]" />


                <div
                  className={`
                    bg-white rounded-xl p-6 border border-amber-900/10
                    hover:border-amber-300 hover:shadow-md hover:shadow-amber-100/60 transition-all duration-300
                    ml-10 md:ml-0 md:w-5/12
                    ${isEven ? 'md:mr-auto md:ml-0' : 'md:ml-auto'}
                  `}
                >
                  {exp.logo ? (
                    <div className="w-12 h-12 mb-3 flex items-center justify-center bg-[#F0EDE6] rounded-lg p-1 border border-gray-200">
                      <img src={exp.logo} alt={exp.company[language]} className="max-w-full max-h-full object-contain" onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<span class="text-2xl">💼</span>';
                      }} />
                    </div>
                  ) : null}
                  <p className="text-warm-gray-400 text-sm mb-1">{exp.period}</p>
                  <h3 className="text-lg font-display text-warm-gray-900">{exp.company[language]}</h3>
                  <p className="text-amber-600 text-sm font-medium mb-3">{exp.role[language]}</p>
                  <p className="text-warm-gray-500 text-sm leading-relaxed">{exp.description[language]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
