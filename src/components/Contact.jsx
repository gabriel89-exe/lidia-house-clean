import { useLanguage } from '../context/LanguageContext'
import './Contact.css'

const PHONE = '+17747735078'
const EMAIL = 'lidihouseclean22@gmail.com'

export default function Contact() {
  const { t } = useLanguage()
  const c = t.contact

  return (
    <section id="contato" className="contact-section section">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-badge">
            <i className="fas fa-calendar-alt"></i>
            {c.badge}
          </div>
          <h2 className="section-title">{c.title}</h2>
          <p className="section-subtitle">{c.subtitle}</p>
        </div>

        <div className="contact-card reveal">
          {/* Channels */}
          <div className="contact-channels">
            <a href={`sms:${PHONE}`} className="channel-btn channel-sms">
              <div className="channel-icon"><i className="fas fa-comment-dots"></i></div>
              <div className="channel-info">
                <span>{c.smsLabel}</span>
                <strong>{c.smsSub}</strong>
              </div>
              <i className="fas fa-arrow-right channel-arrow"></i>
            </a>

            <a href={`mailto:${EMAIL}`} className="channel-btn channel-email">
              <div className="channel-icon"><i className="fas fa-envelope"></i></div>
              <div className="channel-info">
                <span>{c.emailLabel}</span>
                <strong>{EMAIL}</strong>
              </div>
              <i className="fas fa-arrow-right channel-arrow"></i>
            </a>

            <div className="channel-btn channel-hours">
              <div className="channel-icon"><i className="fas fa-clock"></i></div>
              <div className="channel-info">
                <span>{c.hoursLabel}</span>
                <strong>{c.hoursSub}</strong>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="contact-form-wrap">
            <h3>{c.formTitle}</h3>
            <p>{c.formSub}</p>

            <form
              className="contact-form"
              onSubmit={(e) => {
                e.preventDefault()
                const name    = e.target.name.value
                const service = e.target.service.value
                const msg     = c.smsMsg(name, service)
                window.open(`sms:${PHONE}?body=${encodeURIComponent(msg)}`)
              }}
            >
              <div className="form-row">
                <div className="form-field">
                  <label>{c.nameLabel}</label>
                  <input type="text" name="name" placeholder={c.namePH} required />
                </div>
                <div className="form-field">
                  <label>{c.phoneLabel}</label>
                  <input type="tel" name="phone" placeholder={c.phonePH} />
                </div>
              </div>

              <div className="form-field">
                <label>{c.serviceLabel}</label>
                <select name="service" required>
                  <option value="">{c.servicePH}</option>
                  {c.serviceOpts.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-accent form-submit">
                <i className="fas fa-comment-dots"></i>
                {c.submit}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
