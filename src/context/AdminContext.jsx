import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/* ══════════════════════════════════════════════════════════════
   ADMIN CONTEXT
   Gerencia toda a lógica administrativa do site:
     - Autenticação da proprietária (login/logout)
     - Visibilidade do painel admin
     - Perfil público (foto, bio, especialidades)
     - Galeria de trabalhos antes/depois

   ARMAZENAMENTO:
     Supabase Auth  → sessão de login (gerenciada pelo servidor)
     Supabase DB    → perfil e galeria (persistem entre dispositivos)
     Supabase Storage → imagens (bucket "images")
══════════════════════════════════════════════════════════════ */

// Valores padrão exibidos antes de qualquer edição pelo admin
export const DEFAULT_PROFILE = {
  name:        'Lidia',
  tagline:     'Limpeza que transforma',
  bio:         'Profissional de limpeza com mais de 8 anos de experiência, dedicada a transformar ambientes em espaços impecáveis com cuidado e atenção a cada detalhe.',
  photo:       null,
  experience:  8,
  specialties: ['Limpeza Residencial', 'Limpeza Comercial', 'Limpeza Pós-Obra'],
}

/* ──────────────────────────────────────────────────────────────
   COMPRESSÃO DE IMAGEM
   Redimensiona e converte para JPEG antes de fazer upload.
   maxW = largura máxima em pixels; qualidade JPEG = 0.82
────────────────────────────────────────────────────────────── */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function compressImage(file, maxW = 900) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return Promise.reject(new Error('Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF.'))
  }
  if (file.size > 10 * 1024 * 1024) {
    return Promise.reject(new Error('Arquivo muito grande. O limite é 10 MB.'))
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Arquivo inválido ou corrompido.'))
      img.onload = () => {
        const scale  = Math.min(1, maxW / img.width)
        const canvas = document.createElement('canvas')
        canvas.width  = Math.round(img.width  * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

/* ──────────────────────────────────────────────────────────────
   UPLOAD DE IMAGEM
   Converte data URL para Blob e envia ao Supabase Storage.
   Retorna a URL pública do arquivo.
────────────────────────────────────────────────────────────── */
async function uploadImage(dataUrl, path) {
  const res  = await fetch(dataUrl)
  const blob = await res.blob()
  const { error } = await supabase.storage
    .from('images')
    .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
  if (error) throw error
  const { data } = supabase.storage.from('images').getPublicUrl(path)
  return data.publicUrl
}

// Extrai o caminho relativo da URL pública do Storage
function extractStoragePath(publicUrl) {
  const marker = '/object/public/images/'
  const idx    = publicUrl.indexOf(marker)
  return idx !== -1 ? publicUrl.slice(idx + marker.length) : null
}

// Mapeia linha do banco para o formato esperado pelos componentes
function mapProfile(row) {
  if (!row) return DEFAULT_PROFILE
  return {
    name:       row.name       ?? DEFAULT_PROFILE.name,
    bio:        row.bio        ?? DEFAULT_PROFILE.bio,
    photo:      row.photo_url  ?? null,
    experience: row.experience ?? DEFAULT_PROFILE.experience,
  }
}

function mapJob(row) {
  return {
    id:       row.id,
    title:    row.title,
    category: row.category,
    before:   row.before_url,
    after:    row.after_url,
  }
}

/* ──────────────────────────────────────────────────────────────
   PROVIDER
────────────────────────────────────────────────────────────── */
const AdminCtx = createContext(null)

export function AdminProvider({ children }) {
  const [isAdmin,   setIsAdmin]   = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [profile,   setProfileSt] = useState(DEFAULT_PROFILE)
  const [gallery,   setGallerySt] = useState([])
  const [dbLoading, setDbLoading] = useState(true)

  // Sincroniza sessão do Supabase Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Carrega perfil e galeria do Supabase na inicialização
  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, galleryRes] = await Promise.all([
          supabase.from('profile').select('*').eq('id', 1).single(),
          supabase.from('gallery').select('*').order('created_at', { ascending: false }),
        ])
        if (profileRes.error && profileRes.error.code !== 'PGRST116') {
          console.error('Erro ao carregar perfil:', profileRes.error.message)
        } else if (profileRes.data) {
          setProfileSt(mapProfile(profileRes.data))
        }
        if (galleryRes.error) {
          console.error('Erro ao carregar galeria:', galleryRes.error.message)
        } else if (galleryRes.data) {
          setGallerySt(galleryRes.data.map(mapJob))
        }
      } catch (err) {
        console.error('Falha na conexão com o banco de dados:', err)
      } finally {
        setDbLoading(false)
      }
    }
    fetchData()
  }, [])

  /* ── Autenticação ── */
  const login = async (email, pass) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    return !error
  }
  const logout = () => supabase.auth.signOut()

  /* ── Visibilidade do painel ── */
  const openAdmin  = () => setShowAdmin(true)
  const closeAdmin = () => setShowAdmin(false)

  /* ── Perfil: faz upload da foto (se nova) e salva no banco ── */
  const saveProfile = async (data) => {
    let photoUrl = data.photo
    if (data.photo && data.photo.startsWith('data:')) {
      photoUrl = await uploadImage(data.photo, 'profile/photo.jpg')
    }
    const row = {
      id:         1,
      name:       data.name,
      bio:        data.bio,
      experience: data.experience,
      photo_url:  photoUrl,
    }
    const { error } = await supabase.from('profile').upsert(row)
    if (error) throw error
    setProfileSt({ ...data, photo: photoUrl })
  }

  /* ── Galeria: faz upload das imagens e insere no banco ── */
  const addJob = async (job) => {
    const ts = Date.now()
    const [beforeUrl, afterUrl] = await Promise.all([
      uploadImage(job.before, `gallery/${ts}-before.jpg`),
      uploadImage(job.after,  `gallery/${ts}-after.jpg`),
    ])
    const { data, error } = await supabase
      .from('gallery')
      .insert({ title: job.title, category: job.category, before_url: beforeUrl, after_url: afterUrl })
      .select()
      .single()
    if (error) throw error
    setGallerySt(prev => [mapJob(data), ...prev])
  }

  const removeJob = async (id) => {
    const job = gallery.find(j => j.id === id)
    const { error } = await supabase.from('gallery').delete().eq('id', id)
    if (error) throw error
    if (job?.before && job?.after) {
      const paths = [extractStoragePath(job.before), extractStoragePath(job.after)].filter(Boolean)
      if (paths.length) await supabase.storage.from('images').remove(paths)
    }
    setGallerySt(prev => prev.filter(j => j.id !== id))
  }

  return (
    <AdminCtx.Provider value={{
      isAdmin, login, logout,
      showAdmin, openAdmin, closeAdmin,
      profile, saveProfile,
      gallery, addJob, removeJob,
      dbLoading,
    }}>
      {children}
    </AdminCtx.Provider>
  )
}

export const useAdmin = () => useContext(AdminCtx)
