import { useState, useEffect } from 'react'
import { useLanguage } from '../../i18n'
import LanguageToggle from '../ui/LanguageToggle'

const navLinks = [
  { key: 'nav_about' as const, href: '#hero' },
  { key: 'nav_publications' as const, href: '#publications' },
  { key: 'nav_patents' as const, href: '#patents' },
  { key: 'nav_experience' as const, href: '#experience' },
  { key: 'nav_education' as const, href: '#education' },
  { key: 'nav_contact' as const, href: '#contact' },
]

export default function Navbar() {
  const { t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAFAF7]/90 backdrop-blur-md border-b border-amber-900/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a
            href="#hero"
            className="font-display text-xl text-warm-gray-900 tracking-tight hover:text-amber-700 transition-colors duration-200"
          >
            Zhiye Tang
          </a>

          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                className="relative text-warm-gray-600 hover:text-warm-gray-900 transition-colors duration-200 text-sm
                  after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1px]
                  after:bg-amber-500 after:transition-all after:duration-300
                  hover:after:w-full"
              >
                {t(key)}
              </a>
            ))}
            <LanguageToggle />
          </div>

          <button
            className="md:hidden text-warm-gray-600 hover:text-warm-gray-900 transition-colors"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="menu"
          >
            {menuOpen ? (
              <span className="text-2xl leading-none">&#x2715;</span>
            ) : (
              <span className="text-2xl leading-none">&#9776;</span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#FAFAF7]/97 backdrop-blur-md border-t border-amber-900/10 animate-slide-up">
          <div className="px-6 py-5 flex flex-col gap-5">
            {navLinks.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                className="text-warm-gray-600 hover:text-warm-gray-900 transition-colors text-sm"
                onClick={() => setMenuOpen(false)}
              >
                {t(key)}
              </a>
            ))}
            <div className="pt-3 border-t border-amber-900/10">
              <LanguageToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
