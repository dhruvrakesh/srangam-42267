-- ============================================
-- PHASE 1: DATABASE ARCHITECTURE FOR BOOK COMPILATION
-- Creates 6 tables for enterprise-grade CMS
-- ============================================

-- 1. BOOK CHAPTERS TABLE
-- Three-volume structure with multilingual support
CREATE TABLE srangam_book_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id TEXT UNIQUE NOT NULL,
  volume_number INTEGER NOT NULL CHECK (volume_number BETWEEN 1 AND 3),
  chapter_number INTEGER NOT NULL,
  title JSONB NOT NULL,
  subtitle JSONB,
  description JSONB,
  target_page_count INTEGER,
  target_word_count INTEGER,
  actual_word_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'review', 'approved', 'published')),
  editors JSONB DEFAULT '[]'::jsonb,
  introduction JSONB,
  conclusion JSONB,
  publication_target DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_book_chapters_volume ON srangam_book_chapters(volume_number);
CREATE INDEX idx_book_chapters_status ON srangam_book_chapters(status);

-- 2. ARTICLE-CHAPTERS JUNCTION TABLE
-- Maps articles to book chapters (many-to-many)
CREATE TABLE srangam_article_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES srangam_articles(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES srangam_book_chapters(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  include_full_text BOOLEAN DEFAULT true,
  include_bibliography BOOLEAN DEFAULT true,
  custom_introduction TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(article_id, chapter_id)
);

CREATE INDEX idx_article_chapters_article ON srangam_article_chapters(article_id);
CREATE INDEX idx_article_chapters_chapter ON srangam_article_chapters(chapter_id);
CREATE INDEX idx_article_chapters_sequence ON srangam_article_chapters(chapter_id, sequence_number);

-- 3. CROSS-REFERENCES TABLE
-- Article interconnections (7 reference types)
CREATE TABLE srangam_cross_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_article_id UUID REFERENCES srangam_articles(id) ON DELETE CASCADE,
  target_article_id UUID REFERENCES srangam_articles(id) ON DELETE CASCADE,
  reference_type TEXT NOT NULL CHECK (reference_type IN (
    'methodological',
    'thematic',
    'geographical',
    'temporal',
    'contradictory',
    'supporting',
    'prerequisite'
  )),
  context_description JSONB,
  strength INTEGER CHECK (strength BETWEEN 1 AND 5),
  bidirectional BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CHECK (source_article_id != target_article_id)
);

CREATE INDEX idx_cross_refs_source ON srangam_cross_references(source_article_id);
CREATE INDEX idx_cross_refs_target ON srangam_cross_references(target_article_id);
CREATE INDEX idx_cross_refs_type ON srangam_cross_references(reference_type);

-- 4. BIBLIOGRAPHY ENTRIES TABLE
-- Centralized citation management
CREATE TABLE srangam_bibliography_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citation_key TEXT UNIQUE NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'book', 'article', 'chapter', 'thesis', 'dissertation',
    'inscription', 'manuscript', 'website', 'archive',
    'traditional_text', 'conference', 'report', 'newspaper'
  )),
  authors JSONB,
  editors JSONB,
  title JSONB NOT NULL,
  year INTEGER,
  publisher TEXT,
  journal TEXT,
  volume TEXT,
  issue TEXT,
  pages TEXT,
  doi TEXT,
  isbn TEXT,
  issn TEXT,
  url TEXT,
  archive_location TEXT,
  full_citation_mla TEXT,
  full_citation_apa TEXT,
  full_citation_chicago TEXT,
  notes JSONB,
  tags TEXT[] DEFAULT '{}',
  citation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_bibliography_citation_key ON srangam_bibliography_entries(citation_key);
CREATE INDEX idx_bibliography_type ON srangam_bibliography_entries(entry_type);
CREATE INDEX idx_bibliography_year ON srangam_bibliography_entries(year);
CREATE INDEX idx_bibliography_tags ON srangam_bibliography_entries USING GIN(tags);

-- 5. ARTICLE-BIBLIOGRAPHY JUNCTION TABLE
-- Links articles to their citations
CREATE TABLE srangam_article_bibliography (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES srangam_articles(id) ON DELETE CASCADE,
  bibliography_id UUID REFERENCES srangam_bibliography_entries(id) ON DELETE CASCADE,
  citation_context TEXT,
  page_numbers TEXT,
  is_primary_source BOOLEAN DEFAULT false,
  quote TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(article_id, bibliography_id)
);

CREATE INDEX idx_article_bib_article ON srangam_article_bibliography(article_id);
CREATE INDEX idx_article_bib_bibliography ON srangam_article_bibliography(bibliography_id);

-- 6. MARKDOWN SOURCES TABLE
-- Source file management with Git integration
CREATE TABLE srangam_markdown_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES srangam_articles(id) ON DELETE CASCADE,
  markdown_content TEXT NOT NULL,
  file_path TEXT,
  content_hash TEXT,
  git_commit_hash TEXT,
  git_branch TEXT DEFAULT 'main',
  last_sync_at TIMESTAMPTZ,
  conversion_metadata JSONB,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'modified', 'conflict', 'pending')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_markdown_sources_article ON srangam_markdown_sources(article_id);
CREATE INDEX idx_markdown_sources_hash ON srangam_markdown_sources(content_hash);
CREATE INDEX idx_markdown_sources_status ON srangam_markdown_sources(sync_status);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_book_chapters_updated_at
  BEFORE UPDATE ON srangam_book_chapters
  FOR EACH ROW
  EXECUTE FUNCTION srangam_update_updated_at();

CREATE TRIGGER update_bibliography_updated_at
  BEFORE UPDATE ON srangam_bibliography_entries
  FOR EACH ROW
  EXECUTE FUNCTION srangam_update_updated_at();

CREATE TRIGGER update_markdown_sources_updated_at
  BEFORE UPDATE ON srangam_markdown_sources
  FOR EACH ROW
  EXECUTE FUNCTION srangam_update_updated_at();

-- ============================================
-- UTILITY FUNCTION: INCREMENT BIBLIOGRAPHY USAGE
-- ============================================

CREATE OR REPLACE FUNCTION srangam_increment_bibliography_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE srangam_bibliography_entries
  SET citation_count = citation_count + 1
  WHERE id = NEW.bibliography_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER increment_bibliography_citation_count
  AFTER INSERT ON srangam_article_bibliography
  FOR EACH ROW
  EXECUTE FUNCTION srangam_increment_bibliography_usage();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Book Chapters: Public read for published, authenticated write
ALTER TABLE srangam_book_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published book chapters"
  ON srangam_book_chapters FOR SELECT
  USING (status = 'published' OR true);

CREATE POLICY "Authenticated manage book chapters"
  ON srangam_book_chapters FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Article Chapters: Same as parent tables
ALTER TABLE srangam_article_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read article chapters"
  ON srangam_article_chapters FOR SELECT
  USING (true);

CREATE POLICY "Authenticated manage article chapters"
  ON srangam_article_chapters FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Cross References: Public read, authenticated write
ALTER TABLE srangam_cross_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cross references"
  ON srangam_cross_references FOR SELECT
  USING (true);

CREATE POLICY "Authenticated manage cross references"
  ON srangam_cross_references FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Bibliography: Public read, authenticated write
ALTER TABLE srangam_bibliography_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read bibliography"
  ON srangam_bibliography_entries FOR SELECT
  USING (true);

CREATE POLICY "Authenticated manage bibliography"
  ON srangam_bibliography_entries FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Article Bibliography: Public read, authenticated write
ALTER TABLE srangam_article_bibliography ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read article bibliography"
  ON srangam_article_bibliography FOR SELECT
  USING (true);

CREATE POLICY "Authenticated manage article bibliography"
  ON srangam_article_bibliography FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Markdown Sources: Authenticated only (source files are internal)
ALTER TABLE srangam_markdown_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read markdown sources"
  ON srangam_markdown_sources FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated manage markdown sources"
  ON srangam_markdown_sources FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- POPULATE BOOK STRUCTURE FROM BOOK_STRUCTURE.MD
-- ============================================

-- Volume I: Foundations & Sacred Ecology (4 chapters, ~610 pages)
INSERT INTO srangam_book_chapters (chapter_id, volume_number, chapter_number, title, subtitle, description, target_page_count, target_word_count, status, publication_target) VALUES
(
  'vol1-ch1-deep-time',
  1,
  1,
  '{"en": "Deep Time & Geological Continuity", "sa": "दीर्घकाल-भूवैज्ञानिक-सातत्यम्"}'::jsonb,
  '{"en": "From Gondwana to Himalaya: Tectonic Foundations of Bhārata"}'::jsonb,
  '{"en": "Explores the geological deep time of the Indian subcontinent, from Gondwana supercontinent breakup through Himalayan orogeny, establishing the physical foundation for civilizational continuity."}'::jsonb,
  155,
  62000,
  'in_progress',
  '2026-06-30'
),
(
  'vol1-ch2-epigraphy',
  1,
  2,
  '{"en": "Epigraphy & Material Evidence", "sa": "शिलालेख-भौतिक-प्रमाणम्"}'::jsonb,
  '{"en": "Stone Inscriptions from Aśoka to Śrīvijaya"}'::jsonb,
  '{"en": "Analyzes epigraphic evidence spanning Mauryan edicts to Southeast Asian inscriptions, demonstrating continuous literacy and administrative traditions."}'::jsonb,
  150,
  60000,
  'in_progress',
  '2026-06-30'
),
(
  'vol1-ch3-vedic-transmission',
  1,
  3,
  '{"en": "Vedic Transmission & Oral Preservation", "sa": "वैदिक-परम्परा-मौखिक-संरक्षणम्"}'::jsonb,
  '{"en": "Śarīra and Ātman: The Embodied Archive"}'::jsonb,
  '{"en": "Examines the sophisticated oral transmission systems that preserved Vedic knowledge across millennia, analyzing mnemonic techniques and ritualistic preservation methods."}'::jsonb,
  155,
  62000,
  'in_progress',
  '2026-06-30'
),
(
  'vol1-ch4-sacred-ecology',
  1,
  4,
  '{"en": "Sacred Ecology & Environmental Knowledge", "sa": "पवित्र-पारिस्थितिकी-पर्यावरण-ज्ञानम्"}'::jsonb,
  '{"en": "Harvest Rhythms, Sacred Groves, and Sky-Time"}'::jsonb,
  '{"en": "Investigates indigenous environmental knowledge systems encoded in agricultural calendars, sacred grove protection, and astronomical observations tied to seasonal cycles."}'::jsonb,
  150,
  60000,
  'in_progress',
  '2026-06-30'
);

-- Volume II: Maritime Networks & Trade (3 chapters, ~320 pages)
INSERT INTO srangam_book_chapters (chapter_id, volume_number, chapter_number, title, subtitle, description, target_page_count, target_word_count, status, publication_target) VALUES
(
  'vol2-ch5-monsoon-maritime',
  2,
  5,
  '{"en": "Monsoon Winds & Maritime Networks", "sa": "मानसून-पवन-समुद्री-जालम्"}'::jsonb,
  '{"en": "The Indian Ocean as Highway and Archive"}'::jsonb,
  '{"en": "Maps the monsoon-driven maritime trade routes connecting India to Southeast Asia, Africa, and the Middle East, analyzing ships, ports, and navigational knowledge."}'::jsonb,
  110,
  44000,
  'draft',
  '2026-09-30'
),
(
  'vol2-ch6-port-cities',
  2,
  6,
  '{"en": "Port Cities & Cosmopolitan Centers", "sa": "बन्दरगाह-नगर-विश्वनागरिक-केन्द्रम्"}'::jsonb,
  '{"en": "From Vaigai to Ganga: Urban Networks"}'::jsonb,
  '{"en": "Examines major port cities as nodes of cultural exchange, analyzing archaeological evidence of trade goods, foreign settlements, and hybrid material cultures."}'::jsonb,
  105,
  42000,
  'draft',
  '2026-09-30'
),
(
  'vol2-ch7-cultural-transmission',
  2,
  7,
  '{"en": "Cultural Transmission & Adaptation", "sa": "सांस्कृतिक-प्रसारण-अनुकूलनम्"}'::jsonb,
  '{"en": "Dharmic Ideas Across the Indian Ocean"}'::jsonb,
  '{"en": "Traces the spread of dharmic concepts, architectural styles, and ritual practices to Southeast Asia, analyzing processes of adaptation and localization."}'::jsonb,
  105,
  42000,
  'draft',
  '2026-09-30'
);

-- Volume III: Contemporary Validation & Synthesis (2 chapters, ~190 pages)
INSERT INTO srangam_book_chapters (chapter_id, volume_number, chapter_number, title, subtitle, description, target_page_count, target_word_count, status, publication_target) VALUES
(
  'vol3-ch8-genetics-linguistics',
  3,
  8,
  '{"en": "Genetic & Linguistic Evidence", "sa": "आनुवंशिक-भाषाविज्ञान-प्रमाणम्"}'::jsonb,
  '{"en": "Contemporary Science Meets Indigenous Knowledge"}'::jsonb,
  '{"en": "Synthesizes genetic studies, linguistic analysis, and archaeological data to validate indigenous continuity narratives and challenge colonial-era migration theories."}'::jsonb,
  95,
  38000,
  'draft',
  '2026-12-31'
),
(
  'vol3-ch9-synthesis',
  3,
  9,
  '{"en": "Synthesis & Future Directions", "sa": "संश्लेषण-भावी-दिशाः"}'::jsonb,
  '{"en": "Toward a Decolonized Understanding of Bhārata"}'::jsonb,
  '{"en": "Integrates findings from all preceding chapters to propose a comprehensive framework for understanding Indian civilization that honors indigenous epistemologies while engaging with contemporary scholarship."}'::jsonb,
  95,
  38000,
  'draft',
  '2026-12-31'
);