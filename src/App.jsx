import { useState, useEffect } from 'react'
import { LanguageProvider } from './context/LanguageContext'
import { AdminProvider, useAdmin } from './context/AdminContext'
import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import Gallery from './components/Gallery'
import Contact from './components/Contact'
import Footer from './components/Footer'
import MessagesFloat from './components/WhatsAppFloat'
import AdminPanel from './components/AdminPanel'

/* ══════════════════════════════════════════════════════════════
   AppInner
   Componente interno separado do App raiz porque precisa acessar
   o AdminContext (useAdmin) — que só existe dentro do AdminProvider.
   Recebe theme/toggleTheme como props para evitar re-render duplo.
══════════════════════════════════════════════════════════════ */
function AppInner({ theme, toggleTheme }) {
  const { showAdmin, closeAdmin } = useAdmin()

  // IntersectionObserver: adiciona .visible nos elementos .reveal
  // quando eles entram na viewport, disparando as animações CSS.
  // Sem dependências → re-observa após mudanças de layout (galeria).
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
      .forEach(el => observer.observe(el))
    return () => observer.disconnect()
  })

  return (
    <div className="app">
      <Header theme={theme} toggleTheme={toggleTheme} />

      <main>
        <Hero />       {/* Seção de destaque com imagem e CTAs */}
        <Services />   {/* Cards dos 3 tipos de serviço */}
        <Gallery />    {/* Galeria antes/depois + perfil profissional */}
        <Contact />    {/* Formulário e canais de contato */}
      </main>

      <Footer />
      <MessagesFloat /> {/* Botão flutuante de SMS */}

      {/* Painel admin: overlay escuro + modal (login ou gerenciamento) */}
      {showAdmin && (
        <div
          className="ap-overlay"
          // Clique fora do modal fecha o painel
          onClick={e => { if (e.target === e.currentTarget) closeAdmin() }}
        >
          <AdminPanel onClose={closeAdmin} />
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   App (raiz)
   Responsável por:
     - Estado de tema (light/dark) com persistência em localStorage
     - Hierarquia de providers: LanguageProvider → AdminProvider → AppInner
══════════════════════════════════════════════════════════════ */
export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    // Aplica o tema como atributo data-theme no <html>
    // O CSS usa [data-theme="dark"] para sobrescrever as variáveis
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  return (
    <LanguageProvider>
      <AdminProvider>
        <AppInner theme={theme} toggleTheme={toggleTheme} />
      </AdminProvider>
    </LanguageProvider>
  )
}
