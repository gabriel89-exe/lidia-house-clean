import { useLanguage } from '../context/LanguageContext'
import './Footer.css'

const PHONE_RAW = '17747735078'
const EMAIL     = 'lidiacleanhouse@gmail.com'

export default function Footer() {
  const { t } = useLanguage()
  const f    = t.footer
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer-inner">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/logo.png" alt="Lidia House Clean" className="footer-logo-img" loading="lazy" />
          </div>
          <p className="footer-tagline">{f.tagline}</p>
          <div className="footer-socials">
            <a href={`sms:+${PHONE_RAW}`} aria-label="Messages">
              <i className="fas fa-comment-dots"></i>
            </a>
            <a href={`mailto:${EMAIL}`} aria-label="Email">
              <i className="fas fa-envelope"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="footer-links-group">
          <h4>{f.navTitle}</h4>
          <ul>
            {f.navLinks.map(link => (
              <li key={link.href}><a href={link.href}>{link.label}</a></li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div className="footer-links-group">
          <h4>{f.servicesTitle}</h4>
          <ul>
            {f.serviceLinks.map(svc => (
              <li key={svc}><a href="#servicos">{svc}</a></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-links-group">
          <h4>{f.contactTitle}</h4>
          <ul className="footer-contact-list">
            <li>
              <i className="fas fa-phone"></i>
              <a href={`sms:+${PHONE_RAW}`}>(774) 773-5078</a>
            </li>
            <li>
              <i className="fas fa-comment-dots"></i>
              <a href={`sms:+${PHONE_RAW}`}>{f.messages}</a>
            </li>
            <li>
              <i className="fas fa-envelope"></i>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>
            <li>
              <i className="fas fa-clock"></i>
              <span>{f.hours}</span>
            </li>
            <li>
              <i className="fas fa-map-marker-alt"></i>
              <span>{f.location}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>{f.copyright(year)}</p>
          <p className="footer-credit">
            {f.credit} <i className="fas fa-heart"></i>
          </p>
        </div>
      </div>
    </footer>
  )
}
