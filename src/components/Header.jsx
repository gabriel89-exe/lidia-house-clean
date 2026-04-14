import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useAdmin } from '../context/AdminContext'
import './Header.css'

const PHONE = '+5527999996604'
const SMS_URL = `sms:${PHONE}`

export default function Header() {
  const { lang, toggle: toggleLang, t } = useLanguage()
  const { isAdmin, openAdmin }          = useAdmin()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">

        <a href="#inicio" className="logo" onClick={closeMenu}>
          <img src="/logo.png" alt="Lidia House Clean" className="logo-img" />
        </a>

        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <ul className="nav-list">
            {t.header.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="nav-link" onClick={closeMenu}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          {/* Language toggle */}
          <button className="lang-btn" onClick={toggleLang} aria-label="Mudar idioma / Change language">
            <span className={lang === 'pt-BR' ? 'lang-active' : ''}>PT</span>
            <span className="lang-divider">|</span>
            <span className={lang === 'en-US' ? 'lang-active' : ''}>EN</span>
          </button>

          {/* Admin trigger */}
          <button
            className={`admin-btn ${isAdmin ? 'admin-btn-active' : ''}`}
            onClick={openAdmin}
            aria-label="Área administrativa"
            title={isAdmin ? 'Painel Admin' : 'Login Admin'}
          >
            <i className={`fas fa-${isAdmin ? 'cog' : 'lock'}`}></i>
            {isAdmin && <span className="admin-dot"></span>}
          </button>

          {/* CTA */}
          <a href={SMS_URL} className="header-cta">
            <i className="fas fa-comment-dots"></i>
            <span>{t.header.cta}</span>
          </a>

          {/* Hamburger */}
          <button
            className={`hamburger ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {menuOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
    </header>
  )
}
