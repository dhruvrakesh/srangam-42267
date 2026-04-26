-- =========================================================
-- Phase H.2a: Canonical gazetteer + article pins join table
-- =========================================================
-- Models: Pelagios Recogito + World Historical Gazetteer + Pleiades.
-- Additive only. No changes to srangam_articles or srangam_article_evidence.

-- ---------- Tables ----------

CREATE TABLE IF NOT EXISTS public.srangam_gazetteer (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name  TEXT NOT NULL,
  name_variants   TEXT[] NOT NULL DEFAULT '{}'::text[],
  latitude        NUMERIC(9,6) NOT NULL,
  longitude       NUMERIC(9,6) NOT NULL,
  precision       TEXT NOT NULL DEFAULT 'point'
                  CHECK (precision IN ('point','centroid','approximate')),
  country         TEXT,
  era_tags        TEXT[] NOT NULL DEFAULT '{}'::text[],
  feature_type    TEXT,
  notes           TEXT,
  external_refs   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive uniqueness on canonical_name (dedupe seed runs)
CREATE UNIQUE INDEX IF NOT EXISTS srangam_gazetteer_canonical_name_lower_uidx
  ON public.srangam_gazetteer (LOWER(canonical_name));

-- Fast variant lookup for the gazetteer scan in backfill-article-pins
CREATE INDEX IF NOT EXISTS srangam_gazetteer_variants_gin
  ON public.srangam_gazetteer USING GIN (name_variants);

CREATE INDEX IF NOT EXISTS srangam_gazetteer_country_idx
  ON public.srangam_gazetteer (country);


CREATE TABLE IF NOT EXISTS public.srangam_article_pins (
  article_id     UUID NOT NULL
                  REFERENCES public.srangam_articles(id) ON DELETE CASCADE,
  gazetteer_id   UUID NOT NULL
                  REFERENCES public.srangam_gazetteer(id) ON DELETE CASCADE,
  confidence     TEXT NOT NULL DEFAULT 'A'
                  CHECK (confidence IN ('A','B','C')),
  source         TEXT NOT NULL DEFAULT 'manual'
                  CHECK (source IN ('evidence_table','content_scan','ai_extract','manual')),
  display_order  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (article_id, gazetteer_id)
);

CREATE INDEX IF NOT EXISTS srangam_article_pins_article_idx
  ON public.srangam_article_pins (article_id);

CREATE INDEX IF NOT EXISTS srangam_article_pins_gazetteer_idx
  ON public.srangam_article_pins (gazetteer_id);


-- ---------- updated_at trigger on gazetteer ----------

DROP TRIGGER IF EXISTS update_srangam_gazetteer_updated_at ON public.srangam_gazetteer;
CREATE TRIGGER update_srangam_gazetteer_updated_at
  BEFORE UPDATE ON public.srangam_gazetteer
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- ---------- RLS ----------

ALTER TABLE public.srangam_gazetteer       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srangam_article_pins    ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "Public read gazetteer"     ON public.srangam_gazetteer;
CREATE POLICY "Public read gazetteer"
  ON public.srangam_gazetteer
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public read article pins"  ON public.srangam_article_pins;
CREATE POLICY "Public read article pins"
  ON public.srangam_article_pins
  FOR SELECT
  USING (true);

-- Admin write (matches existing pattern on srangam_articles, srangam_inscriptions)
DROP POLICY IF EXISTS "Admin manage gazetteer"    ON public.srangam_gazetteer;
CREATE POLICY "Admin manage gazetteer"
  ON public.srangam_gazetteer
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admin manage article pins" ON public.srangam_article_pins;
CREATE POLICY "Admin manage article pins"
  ON public.srangam_article_pins
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


-- =========================================================
-- Seed: 21 ocean ports + 4 inscription sites + 7 atlas-only nodes
-- Idempotent via UNIQUE INDEX on lower(canonical_name).
-- =========================================================

INSERT INTO public.srangam_gazetteer
  (canonical_name, name_variants, latitude, longitude, precision, country, era_tags, feature_type, notes)
VALUES
  -- ----- oceanGisData (21) -----
  ('Puhar (Kāveripattinam)',  ARRAY['Puhar','Kāveripattinam','Kaveripattinam','Poompuhar','Kaveripumpattinam'],
   11.142, 79.841, 'point', 'India', ARRAY['Sangam','Chola'], 'port',
   'Sangam-era emporium on the Kāveri delta.'),
  ('Muziris (Kodungallur)',   ARRAY['Muziris','Muciri','Muciripattanam','Kodungallur','Cranganore','Pattanam'],
   10.225, 76.201, 'point', 'India', ARRAY['Classical','Roman trade'], 'port',
   'Malabar hub; pepper trade.'),
  ('Barygaza (Bharuch)',      ARRAY['Barygaza','Bharuch','Broach','Bhrigukaccha','Bharukaccha'],
   21.705, 72.995, 'point', 'India', ARRAY['Classical'], 'port',
   'Periplus mentions as Barygaza.'),
  ('Lothal',                  ARRAY['Lothal'],
   22.521, 72.248, 'point', 'India', ARRAY['Harappan'], 'harbour',
   'Harappan port-town; dockyard remains.'),
  ('Masulipatnam (Machilipatnam)', ARRAY['Masulipatnam','Machilipatnam','Masulipatam','Bandar'],
   16.179, 81.130, 'point', 'India', ARRAY['Early modern'], 'port',
   'Coromandel textile trade.'),
  ('Kalingapatnam',           ARRAY['Kalingapatnam','Kalingapatam'],
   18.349, 84.133, 'point', 'India', ARRAY['Early modern'], 'port',
   'Eastern seaboard node.'),
  ('Kochi (Cochin)',          ARRAY['Kochi','Cochin','Kocci'],
   9.967, 76.283, 'point', 'India', ARRAY['Early modern','modern'], 'port',
   'Arab–European–Indic node.'),
  ('Kozhikode (Calicut)',     ARRAY['Kozhikode','Calicut','Calecut'],
   11.258, 75.780, 'point', 'India', ARRAY['Medieval'], 'port',
   'Zamorin''s port; spice trade.'),
  ('Goa (Old Goa)',           ARRAY['Goa','Old Goa','Velha Goa'],
   15.500, 73.912, 'point', 'India', ARRAY['Early modern'], 'port',
   'Lusophone creole worlds.'),
  ('Tamralipta (Tamluk)',     ARRAY['Tamralipta','Tamluk','Tāmraliptī','Tamralipti'],
   22.300, 87.920, 'point', 'India', ARRAY['Classical'], 'port',
   'Bengal delta outlet.'),
  ('Chittagong',              ARRAY['Chittagong','Chattogram'],
   22.356, 91.783, 'point', 'Bangladesh', ARRAY['Early modern','modern'], 'port',
   'Bay of Bengal gateway.'),
  ('Gopalpur-on-Sea',         ARRAY['Gopalpur','Gopalpur-on-Sea'],
   19.275, 84.905, 'point', 'India', ARRAY['Colonial'], 'port',
   'Coastal trading post.'),
  ('Galle',                   ARRAY['Galle'],
   6.036, 80.217, 'point', 'Sri Lanka', ARRAY['Early modern'], 'port',
   'Dutch fort; shipping.'),
  ('Trincomalee',             ARRAY['Trincomalee','Tirukonamalai','Gokarna'],
   8.571, 81.233, 'point', 'Sri Lanka', ARRAY['Ancient','modern'], 'port',
   'Deep natural harbour.'),
  ('Jaffna',                  ARRAY['Jaffna','Yalpanam'],
   9.661, 80.025, 'point', 'Sri Lanka', ARRAY['Medieval','modern'], 'port',
   'Palk Strait node.'),
  ('Port Louis',              ARRAY['Port Louis'],
   -20.160, 57.501, 'point', 'Mauritius', ARRAY['Indenture','modern'], 'port',
   'Indenture diaspora hub.'),
  ('Zanzibar (Stone Town)',   ARRAY['Zanzibar','Stone Town','Unguja'],
   -6.162, 39.191, 'point', 'Tanzania', ARRAY['Medieval','Early modern'], 'port',
   'Swahili coast trade.'),
  ('Mombasa',                 ARRAY['Mombasa','Mvita'],
   -4.043, 39.668, 'point', 'Kenya', ARRAY['Medieval','modern'], 'port',
   'Indian Ocean corridor.'),
  ('Muscat',                  ARRAY['Muscat','Masqat'],
   23.588, 58.408, 'point', 'Oman', ARRAY['Medieval','modern'], 'port',
   'Arabian Sea hub.'),
  ('Malacca (Melaka)',        ARRAY['Malacca','Melaka'],
   2.189, 102.250, 'point', 'Malaysia', ARRAY['Medieval','Early modern'], 'port',
   'Straits crossroads.'),
  ('Arikamedu',               ARRAY['Arikamedu','Poduke','Podouke'],
   11.930, 79.830, 'point', 'India', ARRAY['Classical','Roman trade'], 'port',
   'Indo-Roman trading post near Puducherry.'),

  -- ----- Inscription sites (4) -----
  ('Kandahar',                ARRAY['Kandahar','Kandahār','Old Kandahar','Alexandria in Arachosia'],
   31.6131, 65.7372, 'point', 'Afghanistan', ARRAY['Mauryan','3rd century BCE'], 'inscription_site',
   'Findspot of the Kandahar Bilingual Edict of Ashoka (Greek + Aramaic).'),
  ('Muara Kaman (Kutai)',     ARRAY['Muara Kaman','Kutai','Kutai Martadipura'],
   -0.4614, 117.0595, 'point', 'Indonesia', ARRAY['Śrīvijaya pre-cursor','5th century CE'], 'inscription_site',
   'Findspot of the Kutai Yūpa inscriptions in East Kalimantan, Borneo.'),
  ('Võ Cảnh (Nha Trang)',     ARRAY['Vo Canh','Võ Cảnh','Nha Trang','Kauthara'],
   12.2388, 109.1967, 'point', 'Vietnam', ARRAY['Early Champa','2nd-4th century CE'], 'inscription_site',
   'Findspot of the Võ Cảnh Stele, near ancient Cham port of Kauthara.'),
  ('Kedukan Bukit (Palembang)', ARRAY['Kedukan Bukit','Palembang','Śrīvijaya capital','Srivijaya'],
   -2.9761, 104.7754, 'point', 'Indonesia', ARRAY['Śrīvijaya','7th century CE'], 'inscription_site',
   'Findspot of the Kedukan Bukit inscription, founding text of Śrīvijaya.'),

  -- ----- Atlas-only nodes (7 distinct from above) -----
  ('Berenike',                ARRAY['Berenike','Berenice Troglodytica'],
   23.910, 35.500, 'point', 'Egypt', ARRAY['Roman trade','Classical'], 'port',
   'Red Sea port; key Indo-Roman spice link.'),
  ('Kedah (Bujang Valley)',   ARRAY['Kedah','Bujang Valley','Kataha','Kedaram'],
   5.690, 100.500, 'centroid', 'Malaysia', ARRAY['Southeast Asia','medieval'], 'port',
   'Ancient entrepôt in the Bujang Valley.'),
  ('Mantai',                  ARRAY['Mantai','Mahathittha','Mahatittha'],
   8.978, 79.917, 'point', 'Sri Lanka', ARRAY['Anuradhapura','medieval'], 'port',
   'Major medieval emporium on northwestern Sri Lanka.'),
  ('Quanzhou (Zayton)',       ARRAY['Quanzhou','Zayton','Zaitun','Citong'],
   24.874, 118.676, 'centroid', 'China', ARRAY['Song','Yuan','medieval'], 'port',
   'Largest Chinese port of the Song–Yuan maritime trade.'),
  ('Sohar',                   ARRAY['Sohar','Suhar'],
   24.347, 56.730, 'point', 'Oman', ARRAY['Medieval','Abbasid'], 'port',
   'Major Abbasid-era Indian Ocean port.'),
  ('Aden',                    ARRAY['Aden','Eudaimon Arabia'],
   12.778, 45.037, 'point', 'Yemen', ARRAY['Classical','medieval'], 'port',
   'Strategic Bab-el-Mandeb port linking Red Sea and Indian Ocean.'),
  ('Palembang',               ARRAY['Palembang'],
   -2.990, 104.760, 'centroid', 'Indonesia', ARRAY['Śrīvijaya','medieval'], 'city',
   'Capital of the Śrīvijaya maritime empire.')
ON CONFLICT (LOWER(canonical_name)) DO NOTHING;
