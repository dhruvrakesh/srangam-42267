
-- Phase G3: Gazetteer expansion (additive, idempotent)
-- 1. Add UNIQUE constraint so ON CONFLICT works and future ingests stay clean.
ALTER TABLE public.srangam_gazetteer
  ADD CONSTRAINT srangam_gazetteer_canonical_name_key UNIQUE (canonical_name);

-- 2. Bulk-insert ~80 high-priority places drawn from published article slugs.
INSERT INTO public.srangam_gazetteer
  (canonical_name, name_variants, latitude, longitude, feature_type, era_tags, country, precision, external_refs)
VALUES
-- Śakti Pīṭhas (10)
('Hinglaj',                ARRAY['Hingula','Hinglāj','Hinglaj Mata','Hingol','हिंगलाज'],            25.5167, 65.5167, 'pitha',              ARRAY['puranic','medieval'], 'Pakistan',  'point', '{}'::jsonb),
('Kamakhya',               ARRAY['Kāmākhyā','Kamakhya Devi','Nilachal','कामाख्या'],                26.1664, 91.7058, 'pitha',              ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
('Vindhyachal',            ARRAY['Vindhyāchal','Vindhyavasini','विंध्याचल'],                       25.1500, 82.4833, 'pitha',              ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
('Kalighat',               ARRAY['Kālīghāṭ','Kalighat Kali','कालीघाट'],                            22.5200, 88.3422, 'pitha',              ARRAY['medieval','colonial'],'India',     'point', '{}'::jsonb),
('Jwalamukhi (Kangra)',    ARRAY['Jvālāmukhī','Jwalaji','ज्वालामुखी'],                             32.0349, 76.3210, 'pitha',              ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
('Naina Devi',             ARRAY['Mahishpith','Naina Devi Temple','नैना देवी'],                    31.3081, 76.5328, 'pitha',              ARRAY['medieval'],           'India',     'point', '{}'::jsonb),
('Tara Tarini',            ARRAY['Tārā Tāriṇī','Tara Tarini Hill','तारा तारिणी'],                  19.5239, 84.7783, 'pitha',              ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
('Chinnamasta (Rajrappa)', ARRAY['Chinnamastā','Rajrappa','छिन्नमस्ता'],                            23.6314, 85.7124, 'pitha',              ARRAY['medieval'],           'India',     'point', '{}'::jsonb),
('Bagalamukhi (Datia)',    ARRAY['Bagalāmukhī','Pitambara Peeth','बगलामुखी'],                       25.6669, 78.4622, 'pitha',              ARRAY['medieval','mughal'],  'India',     'point', '{}'::jsonb),
('Matangi',                ARRAY['Mātaṅgī','मातंगी'],                                              25.3176, 82.9739, 'pitha',              ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
-- Jyotirliṅgas (12)
('Somnatha',               ARRAY['Somanātha','Somnath','Prabhasa Patan','सोमनाथ'],                 20.8880, 70.4011, 'jyotirlinga',        ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
('Mahakaleshwara (Ujjain)',ARRAY['Mahākāleśvara','Mahakal','महाकालेश्वर'],                          23.1828, 75.7682, 'jyotirlinga',        ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
('Omkareshwara',           ARRAY['Omkāreśvara','Omkareshwar','ओंकारेश्वर'],                         22.2436, 76.1494, 'jyotirlinga',        ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
('Kedarnath',              ARRAY['Kedārnāth','केदारनाथ'],                                          30.7346, 79.0669, 'jyotirlinga',        ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
('Bhimashankar',           ARRAY['Bhīmaśaṅkar','भीमाशंकर'],                                        19.0719, 73.5358, 'jyotirlinga',        ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
('Kashi Vishwanath',       ARRAY['Kāśī Viśvanāth','Vishwanath','Banaras','काशी विश्वनाथ'],         25.3109, 83.0107, 'jyotirlinga',        ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
('Tryambakeshwar',         ARRAY['Tryambakeśvar','त्र्यंबकेश्वर'],                                  19.9333, 73.5333, 'jyotirlinga',        ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
('Vaidyanath (Deoghar)',   ARRAY['Vaidyanāth','Baidyanath Dham','वैद्यनाथ'],                       24.4925, 86.7000, 'jyotirlinga',        ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
('Nageshvara',             ARRAY['Nāgeśvar','Nageshwar','नागेश्वर'],                                22.3375, 69.0894, 'jyotirlinga',        ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
('Rameshwaram',            ARRAY['Rāmeśvaram','Ramesvaram','रामेश्वरम'],                            9.2881, 79.3174, 'jyotirlinga',        ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
('Grishneshwar',           ARRAY['Ghṛṣṇeśvar','घृष्णेश्वर'],                                       20.0269, 75.1798, 'jyotirlinga',        ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
('Mallikarjuna',           ARRAY['Mallikārjuna','Srisailam','मल्लिकार्जुन'],                        16.0731, 78.8687, 'jyotirlinga',        ARRAY['puranic','medieval'], 'India',     'point', '{}'::jsonb),
-- Janapada capitals / sacred cities (15)
('Ayodhya',                ARRAY['Ayodhyā','Saketa','अयोध्या'],                                    26.7990, 82.2040, 'capital',            ARRAY['vedic','puranic','medieval'], 'India','point','{}'::jsonb),
('Mathura',                ARRAY['Mathurā','Madhura','मथुरा'],                                     27.4924, 77.6737, 'capital',            ARRAY['vedic','puranic','medieval'], 'India','point','{}'::jsonb),
('Varanasi',               ARRAY['Vārāṇasī','Kashi','Banaras','वाराणसी'],                          25.3176, 82.9739, 'city',               ARRAY['vedic','puranic','medieval'], 'India','point','{}'::jsonb),
('Hastinapura',            ARRAY['Hastināpura','हस्तिनापुर'],                                      29.1709, 78.0089, 'capital',            ARRAY['vedic','puranic'],     'India',  'point','{}'::jsonb),
('Indraprastha',           ARRAY['Indraprastha','Inderpat','इन्द्रप्रस्थ'],                        28.6139, 77.2090, 'capital',            ARRAY['vedic','puranic'],     'India',  'point','{}'::jsonb),
('Pataliputra',            ARRAY['Pāṭaliputra','Patna','पाटलिपुत्र'],                              25.5941, 85.1376, 'capital',            ARRAY['maurya','gupta'],      'India',  'point','{}'::jsonb),
('Kaushambi',              ARRAY['Kauśāmbī','Kosambi','कौशाम्बी'],                                 25.3500, 81.3833, 'capital',            ARRAY['vedic','maurya'],      'India',  'point','{}'::jsonb),
('Ujjain',                 ARRAY['Ujjayinī','Avantika','उज्जैन'],                                  23.1765, 75.7885, 'capital',            ARRAY['maurya','gupta','medieval'], 'India','point','{}'::jsonb),
('Vidisha',                ARRAY['Vidiśā','Besnagar','विदिशा'],                                    23.5251, 77.8081, 'city',               ARRAY['maurya','gupta'],      'India',  'point','{}'::jsonb),
('Sanchi',                 ARRAY['Sānchi','Kakanaya','साँची'],                                     23.4793, 77.7398, 'temple_complex',     ARRAY['maurya','gupta'],      'India',  'point','{}'::jsonb),
('Nalanda',                ARRAY['Nālandā','नालंदा'],                                              25.1357, 85.4436, 'temple_complex',     ARRAY['gupta','medieval'],    'India',  'point','{}'::jsonb),
('Takshashila',            ARRAY['Takṣaśilā','Taxila','तक्षशिला'],                                 33.7458, 72.7878, 'capital',            ARRAY['vedic','maurya'],      'Pakistan','point','{}'::jsonb),
('Dvaraka',                ARRAY['Dvārakā','Dwarka','द्वारका'],                                    22.2394, 68.9678, 'capital',            ARRAY['puranic','medieval'],  'India',  'point','{}'::jsonb),
('Prabhasa',               ARRAY['Prabhāsa','Prabhas Patan','प्रभास'],                             20.8880, 70.4011, 'city',               ARRAY['puranic','medieval'],  'India',  'point','{}'::jsonb),
('Gwalior',                ARRAY['Gwāliyar','Gopachala','ग्वालियर'],                               26.2183, 78.1828, 'capital',            ARRAY['medieval','mughal','colonial'], 'India','point','{}'::jsonb),
('Patiala',                ARRAY['Paṭiālā','पटियाला'],                                             30.3398, 76.3869, 'capital',            ARRAY['medieval','colonial'], 'India',  'point','{}'::jsonb),
-- Kashmir / sacred geography (8)
('Satisar (Anantnag)',     ARRAY['Satīsar','Sati-Sar','Anantnag','सतीसर'],                         33.7311, 75.1487, 'city',               ARRAY['puranic','medieval'],  'India',  'point','{}'::jsonb),
('Gopadri (Mathura)',      ARRAY['Gopādri','Govardhana','गोपाद्रि'],                               27.4955, 77.6678, 'mountain',           ARRAY['puranic','medieval'],  'India',  'point','{}'::jsonb),
('Varahamula (Baramulla)', ARRAY['Varāhamūla','Baramulla','वराहमूल'],                              34.2090, 74.3436, 'city',               ARRAY['puranic','medieval'],  'India',  'point','{}'::jsonb),
('Martand',                ARRAY['Mārtāṇḍ','Martand Sun Temple','मार्तंड'],                        33.7460, 75.2210, 'temple_complex',     ARRAY['gupta','medieval'],    'India',  'point','{}'::jsonb),
('Shankaracharya Hill',    ARRAY['Śaṅkarācārya','Gopadri (Srinagar)','Takht-i-Sulaiman'],          34.0795, 74.8470, 'mountain',           ARRAY['puranic','medieval'],  'India',  'point','{}'::jsonb),
('Jakhbar',                ARRAY['Jakhbār','Jakhbar Math'],                                        32.5333, 75.3833, 'temple_complex',     ARRAY['medieval','mughal'],   'India',  'point','{}'::jsonb),
('Nartiang Monoliths',     ARRAY['Nartiang','Nartiang Stones','Khasi monoliths'],                   25.5639, 92.2186, 'monolith_site',      ARRAY['medieval'],            'India',  'point','{}'::jsonb),
('Kheer Bhawani',          ARRAY['Khīr Bhavānī','Tulamulla','क्षीर भवानी'],                        34.1944, 74.7383, 'temple_complex',     ARRAY['medieval'],            'India',  'point','{}'::jsonb),
-- Indus / Iron-Age archaeology (7)
('Mehrgarh',               ARRAY['Mehrgaṛh','Mehargarh'],                                          29.3811, 67.6231, 'archaeological_site',ARRAY['prehistoric'],         'Pakistan','point','{}'::jsonb),
('Mohenjo-daro',           ARRAY['Mohenjodaro','Mohenjo Daro'],                                    27.3294, 68.1356, 'archaeological_site',ARRAY['prehistoric'],         'Pakistan','point','{}'::jsonb),
('Harappa',                ARRAY['Harappā','हड़प्पा'],                                             30.6325, 72.8636, 'archaeological_site',ARRAY['prehistoric'],         'Pakistan','point','{}'::jsonb),
('Dholavira',              ARRAY['Dholāvīra','Kotada Timba'],                                      23.8869, 70.2131, 'archaeological_site',ARRAY['prehistoric'],         'India',   'point','{}'::jsonb),
('Kalibangan',             ARRAY['Kālībangā','Kalibanga'],                                         29.4719, 74.1308, 'archaeological_site',ARRAY['prehistoric'],         'India',   'point','{}'::jsonb),
('Rakhigarhi',             ARRAY['Rākhīgaṛhī','Rakhi Garhi'],                                      29.2911, 76.1117, 'archaeological_site',ARRAY['prehistoric'],         'India',   'point','{}'::jsonb),
('Bhirrana',               ARRAY['Bhirrāṇā','Birhana'],                                            29.5544, 75.5478, 'archaeological_site',ARRAY['prehistoric'],         'India',   'point','{}'::jsonb),
-- Indo-Iranian / BMAC (5)
('Gonur Tepe',             ARRAY['Gonur','BMAC','Bactria-Margiana'],                               37.9956, 62.0397, 'archaeological_site',ARRAY['prehistoric'],         'Turkmenistan','point','{}'::jsonb),
('Tell Halaf',             ARRAY['Mitanni','Guzana','Tell Halāf'],                                 36.8264, 40.0411, 'archaeological_site',ARRAY['prehistoric'],         'Syria',   'point','{}'::jsonb),
('Nausharo',               ARRAY['Naushāro'],                                                      29.3500, 67.6167, 'archaeological_site',ARRAY['prehistoric'],         'Pakistan','point','{}'::jsonb),
('Shahr-i Sokhta',         ARRAY['Shahr-e Sukhteh','Burnt City'],                                  30.5972, 61.3253, 'archaeological_site',ARRAY['prehistoric'],         'Iran',    'point','{}'::jsonb),
('Ganj Dareh',             ARRAY['Ganj-e Darreh'],                                                 34.2700, 47.4900, 'archaeological_site',ARRAY['prehistoric'],         'Iran',    'point','{}'::jsonb),
-- Janajāti / petroglyph / megalith (7)
('Bhimbetka',              ARRAY['Bhīmbetka','Bhimbetka Rock Shelters','भीमबेटका'],                22.9376, 77.6131, 'cave_shelter',       ARRAY['prehistoric'],         'India',   'point','{}'::jsonb),
('Edakkal',                ARRAY['Edakkal Caves','എടക്കൽ'],                                        11.6244, 76.2114, 'cave_shelter',       ARRAY['prehistoric'],         'India',   'point','{}'::jsonb),
('Kupgal',                 ARRAY['Kupgal Petroglyphs','Hire Benakal','Bellary'],                   15.2386, 76.6906, 'cave_shelter',       ARRAY['prehistoric'],         'India',   'point','{}'::jsonb),
('Sanganakallu',           ARRAY['Saṅganakallu','Sangankallu'],                                    15.1833, 76.9167, 'archaeological_site',ARRAY['prehistoric'],         'India',   'point','{}'::jsonb),
('Konthagai',              ARRAY['Konthagai','Keezhadi cluster'],                                  9.8460, 78.1903, 'archaeological_site',ARRAY['prehistoric'],         'India',   'point','{}'::jsonb),
('Adichanallur',           ARRAY['Ādichanallūr','Adichanallur urn site'],                          8.6258, 77.8417, 'archaeological_site',ARRAY['prehistoric'],         'India',   'point','{}'::jsonb),
('Pattanam',               ARRAY['Paṭṭanam','Pattanam (Muziris hinterland)'],                      10.1581, 76.2014, 'archaeological_site',ARRAY['maurya','gupta'],      'India',   'point','{}'::jsonb),
-- Maritime / Southeast Asia gaps (8)
('Sambas (Borneo)',        ARRAY['Sambas','Kalimantan Sambas','Borneo'],                            1.3608, 109.3000, 'port',              ARRAY['medieval'],            'Indonesia','point','{}'::jsonb),
('My Son (Champa)',        ARRAY['Mỹ Sơn','My Son Sanctuary','Champa'],                            15.7639, 108.1244, 'temple_complex',    ARRAY['gupta','medieval'],    'Vietnam', 'point','{}'::jsonb),
('Srivijaya (Palembang)',  ARRAY['Śrīvijaya','Sriwijaya','Palembang Srivijaya'],                   -2.9909, 104.7566, 'inscription_site',  ARRAY['medieval'],            'Indonesia','point','{}'::jsonb),
('Pejeng (Bali)',          ARRAY['Goa Gajah','Pejeng','Bali Pejeng'],                              -8.5217, 115.2870, 'temple_complex',    ARRAY['medieval'],            'Indonesia','point','{}'::jsonb),
('Prambanan (Java)',       ARRAY['Prambanan','Rara Jonggrang','Java Prambanan'],                   -7.7520, 110.4914, 'temple_complex',    ARRAY['medieval'],            'Indonesia','point','{}'::jsonb),
('Oc Eo (Funan)',          ARRAY['Óc Eo','Oc Eo','Funan'],                                         10.2433, 105.1542, 'archaeological_site',ARRAY['gupta','medieval'],   'Vietnam', 'point','{}'::jsonb),
('Angkor',                 ARRAY['Angkor','Angkor Wat','Yasodharapura'],                            13.4125, 103.8670, 'temple_complex',    ARRAY['medieval'],            'Cambodia','point','{}'::jsonb),
('Bagan',                  ARRAY['Pagan','Bagan'],                                                  21.1717, 94.8585, 'temple_complex',    ARRAY['medieval'],            'Myanmar', 'point','{}'::jsonb),
-- Acoustic / temple / harvest tree (6)
('Hampi',                  ARRAY['Hampe','Vijayanagara','Pampa Kshetra','हम्पी'],                  15.3350, 76.4600, 'temple_complex',    ARRAY['medieval'],            'India',   'point','{}'::jsonb),
('Sittannavasal',          ARRAY['Sittaṇṇavāsal','Arivar Koil'],                                   10.4500, 78.7333, 'cave_shelter',       ARRAY['gupta','medieval'],    'India',   'point','{}'::jsonb),
('Tigawa',                 ARRAY['Tigowa','Tigawa Temple'],                                         23.7833, 80.0833, 'temple_complex',    ARRAY['gupta'],               'India',   'point','{}'::jsonb),
('Belur',                  ARRAY['Bēlūru','Chennakeshava'],                                         13.1622, 75.8648, 'temple_complex',    ARRAY['medieval'],            'India',   'point','{}'::jsonb),
('Halebidu',               ARRAY['Halebīḍu','Hoysaleswara','Dwarasamudra'],                        13.2128, 75.9952, 'temple_complex',    ARRAY['medieval'],            'India',   'point','{}'::jsonb),
('Lepakshi',               ARRAY['Lēpākṣi','Veerabhadra Temple'],                                  13.8167, 77.6047, 'temple_complex',    ARRAY['medieval'],            'India',   'point','{}'::jsonb),
-- Australia (1)
('Bunjils Shelter',        ARRAY['Bunjil','Bunjils Cave','Black Range Bunjil'],                   -36.9806, 142.6428, 'cave_shelter',      ARRAY['prehistoric'],         'Australia','point','{}'::jsonb)
ON CONFLICT (canonical_name) DO NOTHING;
