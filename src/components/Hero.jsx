import { useLanguage } from '../context/LanguageContext'
import './Hero.css'

const PHONE = '+17747735078'
const SMS_URL = `sms:${PHONE}`
const EMAIL = 'lidihouseclean22@gmail.com'

const HERO_IMG = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80'

const BUBBLES = [
  { size: 40, left: '5%',  duration: '12s', delay: '0s'   },
  { size: 20, left: '15%', duration: '9s',  delay: '1.5s' },
  { size: 55, left: '28%', duration: '14s', delay: '3s'   },
  { size: 25, left: '44%', duration: '11s', delay: '0.8s' },
  { size: 35, left: '58%', duration: '10s', delay: '2.2s' },
  { size: 15, left: '68%', duration: '8s',  delay: '4s'   },
  { size: 48, left: '78%', duration: '13s', delay: '1s'   },
  { size: 22, left: '88%', duration: '9s',  delay: '2.8s' },
]

export default function Hero() {
  const { t } = useLanguage()
  const h = t.hero

  return (
    <section id="inicio" className="hero">
      <div className="hero-bg">
        <div className="hero-blob hero-blob-1"></div>
        <div className="hero-blob hero-blob-2"></div>
        <div className="hero-grid"></div>
        {BUBBLES.map((b, i) => (
          <div
            key={i}
            className="hero-bubble"
            style={{
              width: b.size,
              height: b.size,
              left: b.left,
              animationDuration: b.duration,
              animationDelay: b.delay,
            }}
          />
        ))}
      </div>

      <div className="container hero-inner">
        {/* Left content */}
        <div className="hero-content reveal-left">
          <div className="hero-badge">
            <i className="fas fa-soap"></i>
            {h.badge}
          </div>

          <h1 className="hero-title">
            {h.title}<br />
            <span className="hero-highlight">{h.highlight}</span>
          </h1>

          <p className="hero-desc">{h.desc}</p>

          <div className="hero-actions">
            <a href={SMS_URL} className="btn-accent hero-btn">
              <i className="fas fa-comment-dots"></i>
              {h.cta1}
            </a>
            <a href={`mailto:${EMAIL}`} className="btn-ghost hero-btn">
              <i className="fas fa-envelope"></i>
              {h.cta2}
            </a>
          </div>

        </div>

        {/* Right visual */}
        <div className="hero-visual reveal-right">
          <div className="hero-img-card">
            <img
              src={HERO_IMG}
              alt={h.badge}
              className="hero-img"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
          </div>

          <div className="hero-float hero-float-1">
            <i className="fas fa-shield-alt"></i>
            <span>{h.float1}</span>
          </div>

          <div className="hero-float hero-float-2">
            <div className="hero-rating">
              {[1,2,3,4,5].map(i => <i key={i} className="fas fa-star"></i>)}
            </div>
            <span>{h.float2}</span>
          </div>

          <div className="hero-float hero-float-3">
            <i className="fas fa-clock"></i>
            <span>{h.float3}</span>
          </div>
        </div>
      </div>

      <div className="hero-scroll">
        <a href="#servicos">
          <span>{h.scroll}</span>
          <i className="fas fa-chevron-down"></i>
        </a>
      </div>
    </section>
  )
}
