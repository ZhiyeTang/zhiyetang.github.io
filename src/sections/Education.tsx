import { education } from '../data';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function Education() {
  const { language, t } = useLanguage();
  const { ref, className } = useScrollAnimation();

  return (
    <section id="education" className="py-20 bg-[#FAFAF7]">
      <div ref={ref} className={className}>
        <div className="max-w-4xl mx-auto px-6">

          <div className="text-center mb-12">
            <h2 className="text-3xl font-display text-warm-gray-900 mb-3">
              {t('section_education')}
            </h2>
            <div className="divider-gold w-24 mx-auto" />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {education.map((edu, index) => (
              <div
                key={index}
                className="bg-[#F0EDE6] rounded-xl p-6 border border-amber-900/10 hover:border-amber-300 hover:shadow-md hover:shadow-amber-100/60 transition-all duration-300"
              >
                {edu.logo ? (
                  <div className="w-12 h-12 mb-4 flex items-center justify-center bg-white rounded-lg p-1">
                    <img src={edu.logo} alt={edu.school[language]} className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-sage-100 border border-sage-200 flex items-center justify-center text-lg mb-4">
                    🎓
                  </div>
                )}


                <h3 className="text-xl font-display text-warm-gray-900 mb-1">
                  {edu.school[language]}
                </h3>


                <p className="text-amber-600 mb-2">
                  {edu.degree[language]}
                </p>


                <p className="text-warm-gray-400 text-sm mb-2">{edu.period}</p>

                {edu.gpa && (
                  <p className="text-sage-600 text-sm font-medium">
                    GPA: {edu.gpa}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
