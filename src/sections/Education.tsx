import { education } from '../data';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function Education() {
  const { language, t } = useLanguage();
  const { ref, className } = useScrollAnimation();

  return (
    <section id="education" className="py-20 bg-[#0a0a0f]">
      <div ref={ref} className={className}>
        <div className="max-w-4xl mx-auto px-6">

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">
              {t('section_education')}
            </h2>
            <div className="h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary" />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {education.map((edu, index) => (
              <div
                key={index}
                className="bg-[#111827] rounded-xl p-6 border border-gray-800 hover:border-gray-600 transition-colors duration-300"
              >

                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl mb-4">
                  🎓
                </div>


                <h3 className="text-xl font-semibold text-white mb-1">
                  {edu.school[language]}
                </h3>


                <p className="text-primary mb-2">
                  {edu.degree[language]}
                </p>


                <p className="text-gray-400 text-sm mb-2">{edu.period}</p>


                <p className="text-secondary text-sm font-medium">
                  GPA: {edu.gpa}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
