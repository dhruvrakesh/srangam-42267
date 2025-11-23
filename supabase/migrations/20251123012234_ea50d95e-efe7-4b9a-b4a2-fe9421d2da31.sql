-- Add slug_alias column to srangam_articles
ALTER TABLE srangam_articles ADD COLUMN slug_alias text;

-- Create index for slug_alias
CREATE INDEX idx_articles_slug_alias ON srangam_articles(slug_alias);

-- Populate with curated short slugs for long articles
UPDATE srangam_articles SET slug_alias = 'gwalior-warrior-curriculum'
WHERE slug = 'the-gwalior-interface-and-the-warrior-s-curriculum-an-analysis-of-sikh-rajput-and-maharashtrian-martial-connections-in-mughal-india';

UPDATE srangam_articles SET slug_alias = 'celestial-bridge-shaivism-bunjil'
WHERE slug = 'the-celestial-bridge-an-investigation-into-the-mythological-and-historical-links-between-shaivism-and-the-bunjil-dreaming';

UPDATE srangam_articles SET slug_alias = 'asura-exiles-mitanni'
WHERE slug = 'the-asura-exiles-a-multi-disciplinary-inquiry-into-the-mitanni-the-vedic-zoroastrian-schism-and-the-memory-of-a-civil-war';

UPDATE srangam_articles SET slug_alias = 'anu-druhyu-migrations'
WHERE slug = 'the-anu-and-the-druhyu-a-correlative-analysis-of-tribal-migrations-in-the-works-of-talageri-raychaudhuri-and-law';

UPDATE srangam_articles SET slug_alias = 'continuous-habitation-india'
WHERE slug = 'where-civilization-never-slept-continuous-habitation-and-urban-memory-across-the-uttar-patha-and-dak-i-patha';

UPDATE srangam_articles SET slug_alias = 'janajatiya-oral-traditions'
WHERE slug = 'janaj-tiya-oral-traditions-and-the-animistic-roots-of-san-tana-dharma-evidence-correlations-and-continuities';

UPDATE srangam_articles SET slug_alias = 'geomythology-cultural-continuity'
WHERE slug = 'xfrom-legends-of-land-reclamation-to-living-traditions-geomythology-and-cultural-continuity-in-india';

UPDATE srangam_articles SET slug_alias = 'scripts-sailed-epigraphic-atlas'
WHERE slug = 'scripts-that-sailed-ii-an-epigraphic-atlas-from-the-vaigai-to-borneo-champa-and-sr-vijaya';

UPDATE srangam_articles SET slug_alias = 'stone-song-sea-janajati'
WHERE slug = 'stone-song-and-sea-janaj-ti-memory-from-petroglyphs-to-monoliths-in-the-indo-oceanic-arc';

UPDATE srangam_articles SET slug_alias = 'indo-iranian-schism-dwaraka'
WHERE slug = 'indo-iranian-schism-rishi-genealogies-and-the-dw-rak-horizon-an-evidence-led-monograph';

UPDATE srangam_articles SET slug_alias = 'somnatha-prabhasa-itihasa'
WHERE slug = 'somnatha-prabhasa-itihasa-sacred-geography-and-stone-records';

UPDATE srangam_articles SET slug_alias = 'ringing-rocks-rhythmic-cosmology'
WHERE slug = 'ringing-rocks-and-rhythmic-cosmology-acoustic-geology-in-deccan-ritual-landscapes';