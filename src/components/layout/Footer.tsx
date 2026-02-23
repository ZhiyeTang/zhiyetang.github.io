import { contact } from '../../data'

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0f] border-t border-gray-800 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <a
            href={contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            GitHub
          </a>
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            LinkedIn
          </a>
          <a
            href={`mailto:${contact.email}`}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            Email
          </a>
        </div>
        <p className="text-gray-500 text-sm">
          &copy; 2024 Zhiye TANG. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
