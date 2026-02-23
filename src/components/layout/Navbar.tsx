import { useState, useEffect } from 'react'
import { useLanguage } from '../../i18n'
import LanguageToggle from '../ui/LanguageToggle'

const navLinks = [
  { key: 'nav_about' as const, href: '#hero' },
  { key: 'nav_skills' as const, href: '#skills' },
  { key: 'nav_projects' as const, href: '#projects' },
  { key: 'nav_publications' as const, href: '#publications' },
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
        scrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a
            href="#hero"
            className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold text-xl"
          >
            Jeric
          </a>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                {t(key)}
              </a>
            ))}
            <LanguageToggle />
          </div>

          <button
            className="md:hidden text-gray-300 hover:text-white transition-colors"
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
        <div className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-md border-t border-gray-800">
          <div className="px-4 py-4 flex flex-col gap-4">
            {navLinks.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                className="text-gray-300 hover:text-white transition-colors text-sm"
                onClick={() => setMenuOpen(false)}
              >
                {t(key)}
              </a>
            ))}
            <div className="pt-2 border-t border-gray-800">
              <LanguageToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
