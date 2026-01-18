-- Phase 1: Add slug_alias for 12 articles missing them
-- This enables proper URL routing for all articles

-- Baba Ala Singh - Patiala founder
UPDATE srangam_articles SET slug_alias = 'baba-ala-singh-patiala' 
WHERE slug = 'baba-ala-singh-1691-1765-founder-of-patiala-and-alliances-with-abdali';

-- Devi Sukta to Devi Mahatmya
UPDATE srangam_articles SET slug_alias = 'devi-sukta-mahatmya' 
WHERE slug = 'from-dev-s-kta-to-dev-m-h-tmya';

-- Saffron and Blue - Ayodhya
UPDATE srangam_articles SET slug_alias = 'saffron-blue-ayodhya' 
WHERE slug = 'the-saffron-and-the-blue-a-civilizational-exegesis-of-the-dhwajarohan-at-ayodhya-on-the-martyrdom-of-guru-tegh-bahadur';

-- Geomythology Research Dossier
UPDATE srangam_articles SET slug_alias = 'geomythology-dossier' 
WHERE slug = 'geomythological-research-dossier-for-the-srangam-project';

-- Guardians of Vedic Canon - Anukramani
UPDATE srangam_articles SET slug_alias = 'anukramani-vedic-tradition' 
WHERE slug = 'guardians-of-the-vedic-canon-the-anukrama-tradition-across-the-four-vedas';

-- Ancient Tribes of Bharatavarsa
UPDATE srangam_articles SET slug_alias = 'ancient-tribes-bharatavarsa' 
WHERE slug = 'ancient-tribes-of-bh-ratavar-a-a-cultural-historical-monograph';

-- Kshatriya Tribes Rigveda to Medieval
UPDATE srangam_articles SET slug_alias = 'kshatriya-rigveda-medieval' 
WHERE slug = 'tracing-ancient-k-atriya-tribes-from-the-rigveda-to-medieval-lineages';

-- Geomythology Land Reclamation (slug already short, just needs alias)
UPDATE srangam_articles SET slug_alias = 'geomythology-land-reclamation' 
WHERE slug = 'geomythology-land-reclamation' AND slug_alias IS NULL;

-- Somnatha Prabhasa Itihasa
UPDATE srangam_articles SET slug_alias = 'somnatha-prabhasa-itihasa' 
WHERE slug = 'somn-tha-prabh-sa-itih-sa-sacred-geography-and-stone-records';

-- Vishnu Shiva Interplay
UPDATE srangam_articles SET slug_alias = 'vishnu-shiva-interplay' 
WHERE slug = 'vishnu-shiva-interplay-of-two-great-deities-in-hindu-tradition';

-- Ocean as Archive (was untitled)
UPDATE srangam_articles SET slug_alias = 'ocean-archive-bhasha' 
WHERE slug = 'untitled-article';

-- Har Har Hari Hari
UPDATE srangam_articles SET slug_alias = 'har-har-hari-hari' 
WHERE slug = 'har-har-hari-hari-vishnu-iva-reciprocity-from-veda-to-janaj-ti';