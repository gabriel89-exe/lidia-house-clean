import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './WhatsAppFloat.css'

const PHONE = '+17747735078'

export default function MessagesFloat() {
  const { t } = useLanguage()
  const f = t.float
  const [showTooltip, setShowTooltip] = useState(true)

  return (
    <div className="msg-float-wrapper">
      {showTooltip && (
        <div className="msg-tooltip">
          <button className="msg-close" onClick={() => setShowTooltip(false)}>
            <i className="fas fa-times"></i>
          </button>
          <p>{f.greeting}</p>
          <span>{f.sub}</span>
        </div>
      )}
      <a
        href={`sms:${PHONE}?body=${encodeURIComponent(f.smsBody)}`}
        className="msg-float-btn"
        aria-label="Send Message"
        onClick={() => setShowTooltip(false)}
      >
        <i className="fas fa-comment-dots"></i>
        <span className="msg-pulse"></span>
      </a>
    </div>
  )
}
