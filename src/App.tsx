import { Navbar, Footer } from './components/layout'
import Hero from './sections/Hero'

import { Publications } from './sections/Publications'
import { Patents } from './sections/Patents'
import Experience from './sections/Experience'
import Education from './sections/Education'
import { Contact } from './sections/Contact'

function App() {
  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      <Navbar />
      <main>
        <Hero />

        <Publications />
        <Patents />
        <Experience />
        <Education />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
