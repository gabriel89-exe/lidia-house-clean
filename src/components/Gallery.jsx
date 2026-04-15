import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useAdmin } from '../context/AdminContext'
import './Gallery.css'

/* ══════════════════════════════════════════════════════════════
   BeforeAfterCard
   Card interativo de comparação antes/depois.

   TÉCNICA DO SLIDER:
   - Duas imagens sobrepostas (position: absolute, mesmo tamanho)
   - A imagem "antes" recebe clipPath dinâmico: inset(0 X% 0 0)
     onde X = 100 - pos, expondo apenas a fração esquerda
   - Um <input type="range"> invisível cobre toda a área do card,
     capturando arrastar com mouse e toque (touch-action: none no CSS)
   - Um divisor visual + handle é posicionado em left: pos%
══════════════════════════════════════════════════════════════ */
function BeforeAfterCard({ item, isAdmin, onRemove, labels }) {
  const [pos, setPos] = useState(50) // posição do divisor: 0–100%

  return (
    <div className="ba-card reveal">
      <div className="ba-slider-wrap">

        {/* Imagem "depois" — camada base (sempre visível atrás) */}
        <img src={item.after}  alt="depois" className="ba-img ba-img-after" />

        {/* Imagem "antes" — recortada pela esquerda conforme pos */}
        <img
          src={item.before}
          alt="antes"
          className="ba-img ba-img-before"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        />

        {/* Linha divisória + handle circular */}
        <div className="ba-divider" style={{ left: `${pos}%` }}>
          <div className="ba-handle">
            <i className="fas fa-chevron-left"></i>
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>

        {/* Range input transparente — captura interação em toda a área */}
        <input
          type="range"
          min="0"
          max="100"
          value={pos}
          onChange={e => setPos(+e.target.value)}
          className="ba-range"
          aria-label="Comparar antes e depois"
        />

        {/* Labels nos cantos */}
        <span className="ba-label ba-label-l">{labels.before}</span>
        <span className="ba-label ba-label-r">{labels.after}</span>
      </div>

      {/* Rodapé do card: título, categoria e botão de remoção (admin) */}
      <div className="ba-info">
        <div className="ba-meta">
          <h4 className="ba-title">{item.title}</h4>
          <span className="ba-cat">
            <i className="fas fa-tag"></i>
            {item.category}
          </span>
        </div>
        {isAdmin && (
          <button
            className="ba-remove"
            onClick={() => onRemove(item.id)}
            title="Remover trabalho"
          >
            <i className="fas fa-trash"></i>
          </button>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Gallery (componente exportado)
   Renderiza duas seções distintas dentro de um Fragment:

   1. #galeria  — grid de cards antes/depois
                  Estado vazio com CTA para admin adicionar fotos
                  Botão "Adicionar Trabalho" visível só para admin

   2. #perfil   — card com foto, bio, stats e especialidades da Lidia
                  Botão "Editar Perfil" visível só para admin
══════════════════════════════════════════════════════════════ */
export default function Gallery() {
  const { t, lang } = useLanguage()
  const g           = t.gallery
  const { isAdmin, profile, gallery, removeJob, openAdmin } = useAdmin()

  // Exibe a bio/tagline no idioma selecionado; cai no PT se EN não estiver preenchida
  const displayBio     = profile.bio?.pt     ? (profile.bio[lang]     || profile.bio.pt)     : g.profileBio
  const displayTagline = profile.tagline?.pt ? (profile.tagline[lang] || profile.tagline.pt) : g.profileTagline

  return (
    <>
      {/* ── Seção 1: Galeria de trabalhos ── */}
      <section id="galeria" className="gallery-section section">
        <div className="container">

          <div className="section-header reveal">
            <div className="section-badge">
              <i className="fas fa-images"></i>
              {g.badge}
            </div>
            <h2 className="section-title">{g.title}</h2>
            <p className="section-subtitle">{g.subtitle}</p>
          </div>

          {/* Estado vazio vs. grid preenchido */}
          {gallery.length === 0 ? (
            <div className="gallery-empty reveal">
              <div className="gallery-empty-icon">
                <i className="fas fa-images"></i>
              </div>
              <p className="gallery-empty-text">{g.empty}</p>
              {isAdmin && (
                <button className="btn-accent gallery-add-first" onClick={openAdmin}>
                  <i className="fas fa-plus"></i>
                  {g.addBtn}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="gallery-grid">
                {gallery.map((item) => (
                  <BeforeAfterCard
                    key={item.id}
                    item={item}
                    isAdmin={isAdmin}
                    onRemove={removeJob}
                    labels={g}
                  />
                ))}
              </div>

              {/* Botão flutuante de adicionar (visível só admin) */}
              {isAdmin && (
                <div className="gallery-admin-bar">
                  <button className="btn-accent" onClick={openAdmin}>
                    <i className="fas fa-plus"></i>
                    {g.addBtn}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Seção 2: Perfil profissional ── */}
      <section id="perfil" className="profile-section section">
        <div className="container">

          <div className="section-header reveal">
            <div className="section-badge">
              <i className="fas fa-user-check"></i>
              {g.profileBadge}
            </div>
            <h2 className="section-title">{g.profileTitle}</h2>
            <p className="section-subtitle">{g.profileSubtitle}</p>
          </div>

          <div className="profile-card reveal">
            {/* Foto com indicador de disponibilidade */}
            <div className="profile-photo-wrap">
              {profile.photo
                ? <img src={profile.photo} alt={profile.name} className="profile-photo" />
                : <div className="profile-photo-placeholder"><i className="fas fa-user"></i></div>
              }
              <div className="profile-online-dot"></div>
            </div>

            <div className="profile-info">
              <div className="profile-name-row">
                <h3 className="profile-name">{profile.name}</h3>
                <span className="profile-verified">
                  <i className="fas fa-shield-alt"></i>
                  {g.verified}
                </span>
              </div>
              <p className="profile-tagline">{displayTagline}</p>
              <p className="profile-bio">{displayBio}</p>

              {/* Estatísticas: anos de experiência e avaliação */}
              <div className="profile-stats">
                <div className="profile-stat">
                  <strong>{profile.experience}+</strong>
                  <span>{g.yearsExp}</span>
                </div>
                <div className="profile-stat-div"></div>
                <div className="profile-stat">
                  <strong>5.0 ★</strong>
                  <span>{g.rating}</span>
                </div>
              </div>

              {/* Tags de especialidade (editáveis no painel admin) */}
              <div className="profile-specialties">
                {g.profileSpecialties.map((s, i) => (
                  <span key={i} className="profile-tag">{s}</span>
                ))}
              </div>
            </div>

            {/* Botão de edição visível apenas quando admin está logado */}
            {isAdmin && (
              <button className="profile-edit-btn" onClick={openAdmin}>
                <i className="fas fa-edit"></i>
                <span>{g.editProfile}</span>
              </button>
            )}
          </div>

        </div>
      </section>
    </>
  )
}
