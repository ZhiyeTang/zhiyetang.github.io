import { contact } from '../../data'

export default function Footer() {
  return (
    <footer className="bg-[#FAFAF7] border-t border-amber-900/10 py-6 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <a
            href={contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-warm-gray-500 hover:text-amber-600 transition-colors text-sm"
          >
            GitHub
          </a>
          <a
            href={`mailto:${contact.email}`}
            className="text-warm-gray-500 hover:text-amber-600 transition-colors text-sm"
          >
            Email
          </a>
        </div>
        <p className="text-warm-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Zhiye Tang. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
