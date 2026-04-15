import { useLanguage } from '../context/LanguageContext'
import './Services.css'

const PHONE = '+17747735078'
const BASE   = 'https://images.unsplash.com'

const IMAGES = [
  `${BASE}/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=700&q=90`,
  `${BASE}/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=90`,
  `${BASE}/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=700&q=90`,
]

const ICONS = ['fas fa-home', 'fas fa-building', 'fas fa-hard-hat']

export default function Services() {
  const { t } = useLanguage()
  const s = t.services

  return (
    <section id="servicos" className="services-section section">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-badge">
            <i className="fas fa-broom"></i>
            {s.badge}
          </div>
          <h2 className="section-title">{s.title}</h2>
          <p className="section-subtitle">{s.subtitle}</p>
        </div>

        <div className="services-grid">
          {s.items.map((item, index) => (
            <div
              key={index}
              className="service-card reveal"
              style={{ transitionDelay: `${index * 0.15}s` }}
            >
              <div className="service-img-wrap">
                <img
                  src={IMAGES[index]}
                  alt={item.title}
                  className="service-img"
                  loading="lazy"
                />
                <div className="service-img-overlay">
                  <div className="service-icon-badge">
                    <i className={ICONS[index]}></i>
                  </div>
                </div>
              </div>

              <div className="service-body">
                <h3 className="service-title">{item.title}</h3>
                <p className="service-desc">{item.description}</p>

                <ul className="service-features">
                  {item.features.map((feat, i) => (
                    <li key={i}>
                      <i className="fas fa-check-circle"></i>
                      {feat}
                    </li>
                  ))}
                </ul>

                <a href={`sms:${PHONE}`} className="service-cta">
                  {s.cta}
                  <i className="fas fa-arrow-right"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
