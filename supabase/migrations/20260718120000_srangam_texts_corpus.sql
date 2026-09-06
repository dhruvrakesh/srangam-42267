-- ============================================================
-- B1 — Sanskrit corpus tables (Apps & Corpus Integration plan,
-- docs/APPS_AND_CORPUS_INTEGRATION_2026-07-18.md, Track B1)
-- Date: 2026-07-18
--
-- PURELY ADDITIVE: creates two new tables + indexes + RLS.
-- No existing table, policy, function, or trigger is touched.
-- Reuses the existing public.srangam_update_updated_at() trigger
-- function (created in 20251027162622_remix_batch_2_migrations.sql)
-- and the public.has_role(uuid, app_role) admin check used by the
-- hardened policies (e.g. 20260215161321).
--
-- Rollback (fully reversible):
--   DROP TABLE public.srangam_text_passages;
--   DROP TABLE public.srangam_texts;
-- ============================================================

-- ------------------------------------------------------------
-- 1. srangam_texts — one row per translated document (book)
-- ------------------------------------------------------------
CREATE TABLE public.srangam_texts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_code      TEXT NOT NULL UNIQUE,          -- automaton docs.code, e.g. 'wl_buddha_carita_sanskrit'
    title         TEXT NOT NULL,
    category      TEXT,                          -- automaton docs.category, e.g. 'wisdomlib', 'mahabharata'
    source_note   TEXT,                          -- provenance line shown in the reader
    translation_engine TEXT,                     -- e.g. 'gemini:gemini-2.5-flash'
    passage_count INTEGER NOT NULL DEFAULT 0,
    published     BOOLEAN NOT NULL DEFAULT FALSE,  -- flipped by admin AFTER review
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2. srangam_text_passages — one row per translated passage
-- ------------------------------------------------------------
CREATE TABLE public.srangam_text_passages (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text_id       UUID NOT NULL REFERENCES public.srangam_texts(id) ON DELETE CASCADE,
    page_no       INTEGER NOT NULL,
    idx           INTEGER NOT NULL,              -- segment index within the page
    sanskrit      TEXT NOT NULL,                 -- passages.text (Devanagari source)
    iast          TEXT,                          -- passages.iast transliteration
    translation   TEXT NOT NULL,                 -- passages.translation (AI-assisted English)
    verse_ref     TEXT,                          -- e.g. '1.1', if segmented
    quality_score REAL,                          -- automaton OCR/text quality score
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT srangam_text_passages_unique UNIQUE (text_id, page_no, idx)  -- publisher upsert key
);

-- ------------------------------------------------------------
-- 3. Indexes
-- ------------------------------------------------------------
CREATE INDEX idx_srangam_texts_category  ON public.srangam_texts(category);
CREATE INDEX idx_srangam_texts_published ON public.srangam_texts(published);
CREATE INDEX idx_srangam_text_passages_text_order
    ON public.srangam_text_passages(text_id, page_no, idx);
-- (Full-text search over sanskrit/iast/translation is a later, separate
--  migration if the reader needs it — not speculatively added here.)

-- ------------------------------------------------------------
-- 4. updated_at triggers (reuses existing shared function)
-- ------------------------------------------------------------
CREATE TRIGGER update_srangam_texts_updated_at
    BEFORE UPDATE ON public.srangam_texts
    FOR EACH ROW
    EXECUTE FUNCTION public.srangam_update_updated_at();

CREATE TRIGGER update_srangam_text_passages_updated_at
    BEFORE UPDATE ON public.srangam_text_passages
    FOR EACH ROW
    EXECUTE FUNCTION public.srangam_update_updated_at();

-- ------------------------------------------------------------
-- 5. RLS — public reads only when parent text is published;
--    writes: admin (dashboard) — the local publisher uses the
--    service role, which bypasses RLS by design.
-- ------------------------------------------------------------
ALTER TABLE public.srangam_texts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srangam_text_passages ENABLE ROW LEVEL SECURITY;

-- Texts: public sees published rows only
CREATE POLICY "Public read published texts"
    ON public.srangam_texts FOR SELECT
    TO public
    USING (published = TRUE);

-- Texts: admins manage everything (hardened style, matches 20260215161321)
CREATE POLICY "Admin manage texts"
    ON public.srangam_texts FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Passages: public sees passages of published texts only
CREATE POLICY "Public read passages of published texts"
    ON public.srangam_text_passages FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.srangam_texts
            WHERE id = text_id AND published = TRUE
        )
    );

-- Passages: admins manage everything
CREATE POLICY "Admin manage text passages"
    ON public.srangam_text_passages FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- Post-apply verification (run as anon / in SQL editor):
--   SELECT count(*) FROM srangam_texts;            -- 0 rows, no error
--   -- as anon key via REST: only published rows must be visible.
-- ============================================================
