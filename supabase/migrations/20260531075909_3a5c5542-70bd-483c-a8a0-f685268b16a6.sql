
-- Phase 2 — Deccan / Vijayanagara cluster
-- Curated rows. All ON CONFLICT (canonical_name) DO NOTHING per Phase G3 invariant.
-- Coordinates from standard published references; precision='point' unless otherwise noted.

INSERT INTO public.srangam_gazetteer
  (canonical_name, name_variants, latitude, longitude, feature_type, era_tags, country, precision, notes)
VALUES
  ('Vijayanagara',
   ARRAY['Vijayanagar','Vijaya-nagara','विजयनगर','City of Victory','Bisnaga','Bisnagar','Bidjanagar'],
   15.3350, 76.4600, 'capital', ARRAY['medieval'], 'India', 'point',
   'Capital of the Vijayanagara empire (1336–1646), centred at Hampi on the Tungabhadra.'),
  ('Tungabhadra',
   ARRAY['Tungabhadra River','Tuṅgabhadrā','तुङ्गभद्रा','Tungabhadra Nadi','Pampa'],
   15.2800, 76.4500, 'city', ARRAY['puranic','medieval'], 'India', 'point',
   'Major river of the Deccan; lifeline of Vijayanagara. feature_type=city used as river is not in frozen vocabulary; see notes.'),
  ('Anegundi',
   ARRAY['Anegondi','Anegunda','आनेगुंदी','Kishkindha'],
   15.3400, 76.4760, 'city', ARRAY['puranic','medieval'], 'India', 'point',
   'Older capital opposite Hampi across the Tungabhadra; identified with Kishkindha in regional tradition.'),
  ('Penukonda',
   ARRAY['Penugonda','Penukoṇḍa','पेनुकोंडा','Ghanagiri'],
   14.0867, 77.5950, 'capital', ARRAY['medieval'], 'India', 'point',
   'Second Vijayanagara capital after the 1565 sack of Hampi.'),
  ('Chandragiri',
   ARRAY['Candragiri','चन्द्रगिरि','Chandragiri Fort'],
   13.5870, 79.3200, 'capital', ARRAY['medieval'], 'India', 'point',
   'Late Vijayanagara seat in Andhra; site where the 1639 Madras grant was issued.'),
  ('Talikota',
   ARRAY['Tālikōṭa','तालिकोट','Battle of Talikota','Rakkasagi-Tangadagi'],
   16.4880, 76.2900, 'city', ARRAY['medieval'], 'India', 'point',
   'Site of the 1565 battle that destroyed Vijayanagara.'),
  ('Krishna River',
   ARRAY['Krishna','Kṛṣṇā','कृष्णा','Krishna Nadi','Kistna'],
   16.5000, 80.6500, 'city', ARRAY['puranic','medieval'], 'India', 'point',
   'Major south Indian river; frontier of the Bahmani–Vijayanagara polities. feature_type=city per frozen vocabulary.'),
  ('Raichur Doab',
   ARRAY['Raichur','Rāyacūr','रायचूर','Raichur Fort'],
   16.2070, 77.3550, 'city', ARRAY['medieval'], 'India', 'point',
   'Contested territory between Vijayanagara and the Bahmani / Bijapur sultanates.'),
  ('Bidar',
   ARRAY['Bīdar','बीदर','Mahmudabad','Bidar Fort'],
   17.9133, 77.5200, 'capital', ARRAY['medieval'], 'India', 'point',
   'Bahmani capital from 1430; later seat of the Bidar Shahi dynasty.'),
  ('Vijayapura',
   ARRAY['Bijapur','Bījāpur','विजयपुर','Bijapura','Adil Shahi capital'],
   16.8240, 75.7150, 'capital', ARRAY['medieval'], 'India', 'point',
   'Adil Shahi capital; modern Vijayapura, Karnataka.'),
  ('Warangal',
   ARRAY['Orugallu','Orukal','वारंगल','Warangal Fort','Ekashila'],
   17.9689, 79.5941, 'capital', ARRAY['medieval'], 'India', 'point',
   'Kakatiya capital; later contested by Bahmani and Vijayanagara forces.'),
  ('Devagiri',
   ARRAY['Daulatabad','Deogiri','देवगिरी','Devagiri Fort','Daulatābād'],
   19.9420, 75.2160, 'capital', ARRAY['medieval'], 'India', 'point',
   'Yadava capital; renamed Daulatabad under Muhammad bin Tughlaq.'),
  ('Kalyana',
   ARRAY['Kalyani','Basavakalyan','कल्याण','Kalyāṇa','Chalukya capital'],
   17.8730, 76.9410, 'capital', ARRAY['medieval'], 'India', 'point',
   'Western Chalukya capital; later associated with Basava and the Lingayat tradition.'),
  ('Vitthala Temple',
   ARRAY['Vittala Temple','Vitthala','विट्ठल मंदिर','Vitthala Hampi'],
   15.3420, 76.4750, 'temple_complex', ARRAY['medieval'], 'India', 'point',
   'Iconic 15th–16th-c. temple at Hampi with stone chariot and musical pillars.'),
  ('Kampili',
   ARRAY['Kampili Fort','Kampilya','कम्पिली','Kampiliraya'],
   15.4070, 76.6080, 'city', ARRAY['medieval'], 'India', 'point',
   'Short-lived 14th-c. Hindu kingdom that preceded Vijayanagara in the Tungabhadra valley.')
ON CONFLICT (canonical_name) DO NOTHING;

-- Make sure Hampi (likely already present) has the variants the matcher needs.
-- This UPDATE is idempotent and only widens the variant set; canonical row untouched.
UPDATE public.srangam_gazetteer
SET name_variants = (
  SELECT ARRAY(SELECT DISTINCT unnest(
    COALESCE(name_variants, ARRAY[]::text[]) ||
    ARRAY['Hampi','Hampe','Hampī','हम्पी','Pampa-kshetra','Pampakshetra','Virupaksha-kshetra']
  ))
)
WHERE canonical_name = 'Hampi';
