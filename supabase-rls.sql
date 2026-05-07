-- ============================================================
-- ROW LEVEL SECURITY — Lidia House Clean
--
-- Como usar:
--   1. Abra o painel do Supabase (app.supabase.com)
--   2. Vá em: SQL Editor → New query
--   3. Cole este arquivo inteiro e clique em Run
-- ============================================================


-- ── Tabela: profile ──────────────────────────────────────────

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante pode ler o perfil público
CREATE POLICY "profile_select_public"
  ON profile FOR SELECT
  USING (true);

-- Apenas admin autenticado pode criar/editar/excluir
CREATE POLICY "profile_insert_auth"
  ON profile FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "profile_update_auth"
  ON profile FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "profile_delete_auth"
  ON profile FOR DELETE
  USING (auth.role() = 'authenticated');


-- ── Tabela: gallery ──────────────────────────────────────────

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante pode ver a galeria
CREATE POLICY "gallery_select_public"
  ON gallery FOR SELECT
  USING (true);

-- Apenas admin autenticado pode publicar/editar/remover trabalhos
CREATE POLICY "gallery_insert_auth"
  ON gallery FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "gallery_update_auth"
  ON gallery FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "gallery_delete_auth"
  ON gallery FOR DELETE
  USING (auth.role() = 'authenticated');


-- ── Storage: bucket "images" ─────────────────────────────────

-- Qualquer visitante pode visualizar as imagens
CREATE POLICY "images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

-- Apenas admin autenticado pode fazer upload
CREATE POLICY "images_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Apenas admin autenticado pode substituir imagens (upsert)
CREATE POLICY "images_update_auth"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Apenas admin autenticado pode remover imagens
CREATE POLICY "images_delete_auth"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'images' AND auth.role() = 'authenticated');
