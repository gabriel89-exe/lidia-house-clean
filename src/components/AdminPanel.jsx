import { useState, useRef } from 'react'
import { useAdmin, compressImage } from '../context/AdminContext'
import './AdminPanel.css'

/* ══════════════════════════════════════════════════════════════
   AdminPanel
   Modal de administração acessível pelo ícone 🔒 no header.

   Fluxo:
     1. Se não logada  → exibe LoginForm
     2. Se logada      → exibe PanelContent com duas abas:
          - "Meu Perfil": editar foto, nome, bio, experiência, tags
          - "Galeria":    publicar/remover pares de fotos antes/depois

   O componente é renderizado dentro de .ap-overlay (App.jsx),
   que fecha o painel ao clicar fora do modal.
══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   LOGIN FORM
   Autenticação simples com usuário + senha.
   Delay artificial de 700ms para melhor feedback visual.
───────────────────────────────────────────────────────────── */
function LoginForm({ onClose }) {
  const { login }         = useAdmin()
  const [user, setUser]   = useState('')
  const [pass, setPass]   = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Small delay for UX feel
    setTimeout(() => {
      if (!login(user, pass)) {
        setError('Usuário ou senha incorretos.')
        setPass('')
      }
      setLoading(false)
    }, 700)
  }

  return (
    <div className="ap-login-wrap">
      <button className="ap-close-btn" onClick={onClose} aria-label="Fechar">
        <i className="fas fa-times"></i>
      </button>

      <div className="ap-login-icon">
        <i className="fas fa-lock"></i>
      </div>
      <h2 className="ap-login-title">Área Administrativa</h2>
      <p className="ap-login-sub">Acesso exclusivo para a profissional.</p>

      <form onSubmit={handleSubmit} className="ap-form">
        <div className="ap-field">
          <label>Usuário</label>
          <div className="ap-input-wrap">
            <i className="fas fa-user ap-input-icon"></i>
            <input
              type="text"
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder="Seu usuário"
              required
              autoFocus
              autoComplete="username"
            />
          </div>
        </div>

        <div className="ap-field">
          <label>Senha</label>
          <div className="ap-input-wrap">
            <i className="fas fa-lock ap-input-icon"></i>
            <input
              type={showPass ? 'text' : 'password'}
              value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="Sua senha"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="ap-eye-btn"
              onClick={() => setShowPass(v => !v)}
              tabIndex={-1}
            >
              <i className={`fas fa-eye${showPass ? '-slash' : ''}`}></i>
            </button>
          </div>
        </div>

        {error && (
          <p className="ap-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </p>
        )}

        <button type="submit" className="ap-submit" disabled={loading}>
          {loading
            ? <><i className="fas fa-spinner fa-spin"></i> Entrando...</>
            : <><i className="fas fa-sign-in-alt"></i> Entrar</>
          }
        </button>
      </form>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PROFILE TAB
───────────────────────────────────────────────────────────── */
function ProfileTab() {
  const { profile, saveProfile } = useAdmin()
  const [form, setForm]     = useState({ ...profile })
  const [saved, setSaved]   = useState(false)
  const photoRef            = useRef()

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const compressed = await compressImage(file, 600)
    set('photo', compressed)
  }

  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await saveProfile(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Erro ao salvar perfil:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="ap-form" onSubmit={handleSave}>
      {/* Profile photo upload */}
      <div className="ap-photo-upload" onClick={() => photoRef.current.click()}>
        {form.photo
          ? <img src={form.photo} alt="foto de perfil" className="ap-photo-preview" />
          : (
            <div className="ap-photo-placeholder">
              <i className="fas fa-camera"></i>
              <span>Clique para adicionar foto</span>
            </div>
          )
        }
        <div className="ap-photo-overlay">
          <i className="fas fa-camera"></i>
        </div>
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          style={{ display: 'none' }}
        />
      </div>

      <div className="ap-row">
        <div className="ap-field">
          <label>Nome</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Seu nome"
            required
          />
        </div>
        <div className="ap-field">
          <label>Anos de experiência</label>
          <input
            type="number"
            min="0"
            max="50"
            value={form.experience}
            onChange={e => set('experience', +e.target.value)}
          />
        </div>
      </div>


      <button
        type="submit"
        className={`ap-submit ${saved ? 'ap-submit-saved' : ''}`}
      >
        {saving
          ? <><i className="fas fa-spinner fa-spin"></i> Salvando...</>
          : saved
          ? <><i className="fas fa-check"></i> Perfil Salvo!</>
          : <><i className="fas fa-save"></i> Salvar Perfil</>
        }
      </button>
    </form>
  )
}

/* ─────────────────────────────────────────────────────────────
   GALLERY TAB
───────────────────────────────────────────────────────────── */
const CATEGORIES = [
  'Limpeza Residencial',
  'Limpeza Comercial',
  'Limpeza Pós-Obra',
  'Limpeza Pesada',
]

function GalleryTab() {
  const { gallery, addJob, removeJob } = useAdmin()

  const [form, setForm] = useState({
    title: '', category: CATEGORIES[0], before: null, after: null,
  })
  const [compressing, setCompressing] = useState(false)
  const [saved, setSaved]             = useState(false)
  const [confirmId, setConfirmId]     = useState(null)

  const beforeRef = useRef()
  const afterRef  = useRef()

  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }))

  // Comprime a imagem antes de salvar no state (economiza localStorage)
  const handleImg = async (e, key) => {
    const file = e.target.files[0]
    if (!file) return
    setCompressing(true)
    const compressed = await compressImage(file, 900)
    setF(key, compressed)
    setCompressing(false)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.before || !form.after) return
    setCompressing(true)
    try {
      await addJob({ title: form.title, category: form.category, before: form.before, after: form.after })
      setForm({ title: '', category: CATEGORIES[0], before: null, after: null })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Erro ao publicar trabalho:', err)
    } finally {
      setCompressing(false)
    }
  }

  // Remoção com duplo clique de confirmação:
  // 1º clique → botão muda para "Confirmar?" (estado confirmId)
  // 2º clique → remove de fato; auto-cancela após 3 s sem ação
  const handleRemove = async (id) => {
    if (confirmId === id) {
      setConfirmId(null)
      try {
        await removeJob(id)
      } catch (err) {
        console.error('Erro ao remover trabalho:', err)
      }
    } else {
      setConfirmId(id)
      setTimeout(() => setConfirmId(null), 3000)
    }
  }

  return (
    <div className="ap-gallery-tab">
      {/* Add new job form */}
      <form className="ap-form" onSubmit={handleAdd}>
        <h4 className="ap-sub-title">
          <i className="fas fa-plus-circle"></i>
          Adicionar Novo Trabalho
        </h4>

        <div className="ap-row">
          <div className="ap-field">
            <label>Título do Trabalho</label>
            <input
              value={form.title}
              onChange={e => setF('title', e.target.value)}
              placeholder="Ex: Apartamento 3 quartos"
              required
            />
          </div>
          <div className="ap-field">
            <label>Categoria</label>
            <select
              value={form.category}
              onChange={e => setF('category', e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Before / After image upload pair */}
        <div className="ap-img-pair">
          {/* Before */}
          <div className="ap-img-slot" onClick={() => beforeRef.current.click()}>
            {form.before
              ? <img src={form.before} alt="antes" />
              : (
                <div className="ap-img-ph ap-img-ph-before">
                  <i className="fas fa-image"></i>
                  <span>Foto Antes</span>
                </div>
              )
            }
            <input
              ref={beforeRef}
              type="file"
              accept="image/*"
              onChange={e => handleImg(e, 'before')}
              style={{ display: 'none' }}
            />
          </div>

          <div className="ap-img-arrow">
            <i className="fas fa-arrow-right"></i>
          </div>

          {/* After */}
          <div className="ap-img-slot" onClick={() => afterRef.current.click()}>
            {form.after
              ? <img src={form.after} alt="depois" />
              : (
                <div className="ap-img-ph ap-img-ph-after">
                  <i className="fas fa-image"></i>
                  <span>Foto Depois</span>
                </div>
              )
            }
            <input
              ref={afterRef}
              type="file"
              accept="image/*"
              onChange={e => handleImg(e, 'after')}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {compressing && (
          <p className="ap-compressing">
            <i className="fas fa-spinner fa-spin"></i>
            Enviando imagens...
          </p>
        )}

        <button
          type="submit"
          className={`ap-submit ${saved ? 'ap-submit-saved' : ''}`}
          disabled={compressing || !form.before || !form.after}
        >
          {saved
            ? <><i className="fas fa-check"></i> Adicionado à Galeria!</>
            : <><i className="fas fa-plus"></i> Publicar na Galeria</>
          }
        </button>
      </form>

      {/* Existing jobs list */}
      {gallery.length > 0 && (
        <div className="ap-jobs-list">
          <h4 className="ap-sub-title">
            <i className="fas fa-th-large"></i>
            Trabalhos Publicados ({gallery.length})
          </h4>

          {gallery.map(job => (
            <div key={job.id} className="ap-job-item">
              <div className="ap-job-imgs">
                <img src={job.before} alt="antes" />
                <i className="fas fa-arrow-right"></i>
                <img src={job.after}  alt="depois" />
              </div>
              <div className="ap-job-info">
                <strong>{job.title}</strong>
                <span>{job.category}</span>
              </div>
              <button
                className={`ap-job-remove ${confirmId === job.id ? 'ap-job-remove-confirm' : ''}`}
                onClick={() => handleRemove(job.id)}
                title={confirmId === job.id ? 'Clique novamente para confirmar' : 'Remover'}
              >
                <i className={`fas fa-${confirmId === job.id ? 'exclamation-triangle' : 'trash'}`}></i>
                {confirmId === job.id && <span>Confirmar?</span>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ADMIN PANEL (main — shown when logged in)
───────────────────────────────────────────────────────────── */
function PanelContent({ onClose }) {
  const { logout }     = useAdmin()
  const [tab, setTab]  = useState('profile')

  return (
    <div className="ap-panel">
      {/* Header */}
      <div className="ap-panel-header">
        <div className="ap-panel-title">
          <div className="ap-panel-icon">
            <i className="fas fa-cog"></i>
          </div>
          <div>
            <span>Painel Administrativo</span>
            <small>Lidia House Clean</small>
          </div>
        </div>
        <div className="ap-panel-actions">
          <button className="ap-logout-btn" onClick={logout}>
            <i className="fas fa-sign-out-alt"></i>
            Sair
          </button>
          <button className="ap-close-btn" onClick={onClose} aria-label="Fechar">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="ap-tabs">
        <button
          className={`ap-tab ${tab === 'profile' ? 'active' : ''}`}
          onClick={() => setTab('profile')}
        >
          <i className="fas fa-user"></i>
          Meu Perfil
        </button>
        <button
          className={`ap-tab ${tab === 'gallery' ? 'active' : ''}`}
          onClick={() => setTab('gallery')}
        >
          <i className="fas fa-images"></i>
          Galeria
        </button>
      </div>

      {/* Tab content */}
      <div className="ap-content">
        {tab === 'profile' ? <ProfileTab /> : <GalleryTab />}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   EXPORTED COMPONENT — renders login or panel based on auth
───────────────────────────────────────────────────────────── */
export default function AdminPanel({ onClose }) {
  const { isAdmin } = useAdmin()

  return isAdmin
    ? <PanelContent onClose={onClose} />
    : <LoginForm    onClose={onClose} />
}
