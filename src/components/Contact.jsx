import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './Contact.css'

const PHONE = '+17747735078'
const EMAIL = 'lidihouseclean22@gmail.com'

export default function Contact() {
  const { t } = useLanguage()
  const c = t.contact
  const [submitStatus, setSubmitStatus] = useState(null) // 'ok' | 'blocked' | null

  const handleSubmit = (e) => {
    e.preventDefault()
    const name    = e.target.name.value.trim()
    const service = e.target.service.value
    const msg     = c.smsMsg(name, service)
    try {
      window.open(`sms:${PHONE}?body=${encodeURIComponent(msg)}`)
      setSubmitStatus('ok')
    } catch {
      setSubmitStatus('blocked')
    }
    setTimeout(() => setSubmitStatus(null), 4000)
  }

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

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label>{c.nameLabel}</label>
                  <input
                    type="text"
                    name="name"
                    placeholder={c.namePH}
                    maxLength={100}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>{c.phoneLabel}</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder={c.phonePH}
                    pattern="[\d\s\+\-\(\)]{7,20}"
                    maxLength={20}
                    title="Digite um número de telefone válido"
                  />
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

              {submitStatus === 'blocked' && (
                <p className="form-feedback form-feedback-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {' '}Não foi possível abrir o SMS. Envie diretamente para {PHONE}.
                </p>
              )}
              {submitStatus === 'ok' && (
                <p className="form-feedback form-feedback-ok">
                  <i className="fas fa-check-circle"></i>
                  {' '}Mensagem preparada! Confirme o envio no seu app de SMS.
                </p>
              )}

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
