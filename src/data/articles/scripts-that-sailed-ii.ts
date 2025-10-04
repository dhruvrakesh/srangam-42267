import { LocalizedArticle } from '@/types/multilingual';

export const scriptsThatSailedII: LocalizedArticle = {
  id: 'scripts-that-sailed-ii',
  slug: '/scripts-that-sailed-ii',
  title: {
    en: 'Scripts that Sailed II: An Epigraphic Atlas from the Vaigai to Borneo, Champa, and Srīvijaya',
    hi: 'लिपियाँ जो समुद्र पार गयीं II: वैगै से बोर्नियो, चंपा और श्रीविजय तक एक शिलालेख मानचित्र',
    ta: 'கடலில் பயணித்த எழுத்துக்கள் II: வைகையிலிருந்து போர்னியோ, சாம்பா மற்றும் ஸ்ரீவிஜயா வரை ஒரு கல்வெட்டு வரைபடம்'
  },
  dek: {
    en: 'Tracing the epigraphic networks that carried Brāhmī, Grantha, and Pallava scripts from South Indian river valleys to the {{cultural:yupa}} pillars of Borneo, the steles of {{cultural:champa}}, and the inscriptions of {{cultural:srivijaya}}.',
    hi: 'दक्षिण भारतीय नदी घाटियों से ब्राह्मी, ग्रंथ और पल्लव {{cultural:yupa}} लिपियों को बोर्नियो के {{cultural:yupa}} स्तंभों, {{cultural:champa}} के शिलास्तंभों और {{cultural:srivijaya}} के शिलालेखों तक ले जाने वाले शिलालेख नेटवर्क का पता लगाना।',
    ta: 'தென்னிந்திய நதி பள்ளத்தாக்குகளிலிருந்து பிராமி, கிரந்த மற்றும் பல்லவ எழுத்துமுறைகளை போர்னியோவின் {{cultural:yupa}} தூண்கள், {{cultural:champa}}-வின் கல்தூண்கள் மற்றும் {{cultural:srivijaya}}-வின் கல்வெட்டுகள் வரை எடுத்துச் சென்ற கல்வெட்டு நெட்வொர்க்குகளை கண்டறிதல்.'
  },
  content: {
    en: `## Overture: Method & the Paired-Evidence Rule

This epigraphic atlas applies a systematic confidence rubric to every major claim. We adopt a **paired-evidence rule**: where possible, we triangulate an inscription with at least one complementary data point—whether archaeological context (pottery, trade goods, stratigraphy), linguistic analysis (palaeographic ductus, phonology), or textual cross-reference (Periplus, Singhala chronicles, temple records). When such pairing is absent, we mark the claim with a lower confidence badge. Our four-tier system:

<div class="confidence-badges-system my-8 p-6 bg-muted/30 rounded-lg">
  <h3 class="font-serif text-lg font-semibold mb-4">Confidence Rubric</h3>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="flex items-start gap-3">
      <span class="inline-flex items-center justify-center h-8 w-8 rounded bg-green-600 text-white font-semibold text-sm shrink-0">A</span>
      <div>
        <p class="font-medium">High Confidence</p>
        <p class="text-sm text-muted-foreground">Dated inscription + archaeological context</p>
      </div>
    </div>
    <div class="flex items-start gap-3">
      <span class="inline-flex items-center justify-center h-8 w-8 rounded bg-amber-600 text-white font-semibold text-sm shrink-0">B</span>
      <div>
        <p class="font-medium">Medium Confidence</p>
        <p class="text-sm text-muted-foreground">Palaeographic convergence + contextual fit</p>
      </div>
    </div>
    <div class="flex items-start gap-3">
      <span class="inline-flex items-center justify-center h-8 w-8 rounded bg-red-600 text-white font-semibold text-sm shrink-0">C</span>
      <div>
        <p class="font-medium">Lower Confidence</p>
        <p class="text-sm text-muted-foreground">Textual echo or isolated find</p>
      </div>
    </div>
    <div class="flex items-start gap-3">
      <span class="inline-flex items-center justify-center h-8 w-8 rounded bg-gray-600 text-white font-semibold text-sm shrink-0">D</span>
      <div>
        <p class="font-medium">Memory Layer</p>
        <p class="text-sm text-muted-foreground">Cultural tradition only</p>
      </div>
    </div>
  </div>
</div>

Why this approach? Because epigraphic claims in the Indian Ocean world often rest on **single inscriptions** divorced from excavation reports. A Sanskrit stele may be genuine yet misunderstood if we lack pottery sequences or trade-good assemblages to anchor its date. Conversely, a {{cultural:brahmi}} graffito on a sherd becomes far more meaningful when paired with Roman amphorae or pepper residues. This atlas privileges such paired evidence, making our confidence tiers transparent.

### The Kandahar Anchor

Before sailing to Southeast Asia, we establish methodological grounding with the **Kandahar Bilingual Edict** of Aśoka (c. 250 BCE) <span class="inline-flex items-center justify-center h-6 w-6 rounded bg-green-600 text-white font-semibold text-xs ml-1">A</span>. Found at the Chehel Zina hillside near Kandahar, Afghanistan, this rock inscription presents Aśokan dhamma in both Greek and Aramaic—no Brāhmī or Prakrit. Its significance for our atlas:

1. **Precise dating**: Aśokan chronology is well-established (mid-3rd century BCE), giving us a temporal anchor.
2. **Script adaptation**: The edict demonstrates how Mauryan administration tailored script choice to local literacy. Greek for Hellenistic audiences, Aramaic for Iranian/Semitic readers.
3. **Archaeological context**: The site has been surveyed multiple times (by French and Afghan teams), and the inscription's placement correlates with Achaemenid-Hellenistic administrative routes.

This A-grade confidence in Kandahar's date, script, and context sets the bar. When we encounter a Sanskrit inscription in Borneo lacking such archaeological corroboration, we assign it B or C status—not because we doubt its authenticity, but because we lack the **paired evidence** that would elevate it to A.

---

## Section 1: From the {{cultural:vaigai}} to Pallava–Grantha Lineages (800 words)

<span class="inline-flex items-center justify-center h-6 w-6 rounded bg-amber-600 text-white font-semibold text-xs">B</span> **Claim**: The {{cultural:tamil-brahmi}} inscriptions of the {{cultural:vaigai}} river corridor (6th c. BCE–3rd c. CE) represent an early southern literacy that influenced the development of Pallava and {{cultural:grantha}} scripts.

**Evidence**: Potsherds and cave graffiti in Tamil-Brāhmī from sites like Keeladi, Kodumanal, and Adichanallur show short donative or ownership marks. Palaeographically, these inscriptions exhibit rounded letter forms and a leftward tilt that distinguish them from Aśokan Brāhmī. Mahadevan's *Early Tamil Epigraphy* (2003) traces how this southern Brāhmī evolved local ligatures for Tamil phonemes (ழ், ற்) not present in northern scripts. By the 4th–5th centuries CE, {{cultural:pallava}} kings in Kanchipuram were commissioning Sanskrit {{cultural:prasasti}} in a script that retained some rounded {{cultural:brahmi}} features while incorporating new ligatures and vowel markers. This became the Pallava–Grantha complex.

**Contextual fit**: Pattanam (ancient Muziris) excavations have yielded potsherds with Tamil-Brāhmī marks alongside Roman amphorae and pepper storage jars. This suggests that southern Brāhmī literacy was embedded in maritime trade networks by the 1st century CE. When merchants and monks sailed eastward, they carried not just goods but also epigraphic habits.

**Why B-grade?** While we have inscriptions and archaeological context separately, we lack a **single site** that pairs Tamil-Brāhmī with securely dated trade goods in a stratigraphic sequence. Pattanam comes close, but the potsherds are surface finds or mixed layers. Hence B: medium confidence.

### The Pallava Connection

The Pallavas (4th–9th centuries CE) are pivotal. Their inscriptions in Kanchipuram and Mamallapuram display a mature script with:

- Rounded counters (inherited from southern Brāhmī)
- Elaborate vowel diacritics (anusvāra, visarga)
- Ligatures for Sanskrit consonant clusters (kṣa, jña)

This Pallava–Grantha script became the vehicle for Sanskrit transmission to Southeast Asia. Why? Because Pallava maritime influence extended to the Straits of Malacca and beyond. We know from the **Takuapa inscription** (8th–9th c. CE, southern Thailand) that a {{cultural:sreni}} (merchant guild) left a Tamil-Pallava record of land grants. The ductus matches Pallava royal inscriptions, suggesting that scribes trained in Kanchipuram workshops were present in trans-oceanic ports.

---

## Section 2: Case Study I—The Kutai {{cultural:yupa}} of East Kalimantan (1,000 words)

<span class="inline-flex items-center justify-center h-6 w-6 rounded bg-green-600 text-white font-semibold text-xs">A</span> **Claim**: The seven {{cultural:yupa}} (sacrificial pillar) inscriptions from Muara Kaman, East Kalimantan, are the earliest Sanskrit records in Borneo, dating to the late 4th or early 5th century CE.

**Primary Evidence**: 

Seven stone pillars, each bearing short Sanskrit inscriptions, were discovered near the Mahakam River in 1879. The texts record King Mūlavarman's *aśvamedha* (horse sacrifice) and gifts to Brahmins. The script is an early Pallava variety, with rounded letter forms and minimal ornamentation. Key phrases:

> *vājimedha-yājī*  
> "performer of the horse sacrifice"

> *brāhmaṇa-sahasra-dāna*  
> "giver of thousands to Brahmins"

The use of *vājimedha* (archaic Vedic term for *aśvamedha*) suggests the composer was versed in Vedic {{cultural:shastra}}. The pillars themselves are octagonal, hewn from local andesite, and range from 1.5 to 2.5 meters in height.

**Archaeological Context**:

Excavations at Muara Kaman by Indonesian and Dutch teams (1950s–1980s) uncovered:

- **Gold foil fragments** with early Pallava script  
- **Terracotta figurines** resembling Gupta-period styles (4th–5th c. CE)  
- **Pottery** with paddle-impressed designs common in coastal Southeast Asia  

Importantly, no Roman or late Roman pottery appears in these layers, suggesting a post-3rd-century CE date. The Pallava ductus on the {{cultural:yupa}} matches inscriptions from Kanchipuram dated paleographically to the late 4th century. 

**Paired Evidence**: The combination of dated Pallava script + Gupta-style figurines + absence of Roman pottery gives us **A-grade confidence** in a late 4th or early 5th-century date.

### Interpreting the {{cultural:yupa}}

Why did Mūlavarman erect {{cultural:yupa}}? The *aśvamedha* was a royal legitimation ritual in Vedic tradition, claiming sovereignty over vast territories. By performing it in Borneo, Mūlavarman signaled allegiance to Brahmanical norms and perhaps sought to attract Brahmin priests and merchants from India. The {{cultural:yupa}} are not mere markers; they are **epigraphic performances** of kingship.

The script's Pallava character suggests that scribes (or the king's court) had direct or indirect links to South India. We know from Chinese sources (Liang Shu) that ships from "Poli" (possibly Bali or eastern Java) reached Guangzhou in the 5th century. Kutai, at the mouth of the Mahakam, was likely a node in these networks.

**Linguistic Notes**:

The Kutai inscriptions use archaic Sanskrit vocabulary (*vājimedha*, *sahasra-dāna*) alongside Prakrit-influenced phonology (e.g., *brāhmaṇa* instead of *brāhmaṇa*). This hybrid register is typical of early Southeast Asian Sanskrit, where Brahmin migrants adapted classical forms to local phonetic patterns.

---

## Section 3: Case Study II—The Võ Cảnh Stele of Champa (900 words)

<span class="inline-flex items-center justify-center h-6 w-6 rounded bg-amber-600 text-white font-semibold text-xs">B</span> **Claim**: The Võ Cảnh stele (near Nha Trang, Vietnam) is the earliest Sanskrit inscription in mainland Southeast Asia, dating to the 2nd–4th century CE (contested).

**Primary Evidence**:

Discovered in 1902, the stele bears a short Sanskrit inscription in Southern Brāhmī or early Grantha-type script. The text is fragmentary, but scholars have reconstructed phrases like:

> *śrī…rāja*  
> "the glorious king…"

> *mahārāja*  
> "great king"

The script exhibits rounded letters with minimal ornamentation, resembling the Tamil-Brāhmī of the 2nd–3rd centuries CE. However, the use of the title *mahārāja* and certain ligatures suggests a slightly later date, possibly 3rd–4th century.

**The Dating Controversy**:

French scholars (Finot, Parmentier) initially dated Võ Cảnh to the 3rd century based on palaeography. Later, Filliozat (BEFEO 1969) argued for a 2nd-century date, citing parallels with Amaravati inscriptions. Recent Vietnamese and Chinese scholars place it in the 4th century, aligning with the rise of the Cham polity known from Chinese annals as *Linyi*.

Why the uncertainty? **We lack archaeological pairing**. The stele was found in a secondary context (possibly moved from its original site), and no stratified pottery or coins accompanied it. Palaeography alone is insufficient for precise dating, as script styles evolved at different rates in different regions.

**Why B-grade?** The inscription is genuine and early, but the **absence of paired evidence** (no coins, no pottery, no stratigraphic layer) prevents A-grade confidence. We have palaeographic convergence with 2nd–4th century South Indian scripts, plus the historical plausibility of early {{cultural:champa}} contacts with India. This warrants B: medium confidence.

### {{cultural:champa}} and the Maritime Silk Road

Võ Cảnh stands at the head of a long {{cultural:champa}} epigraphic tradition. Over 300 Sanskrit and {{cultural:cham}} (Austronesian) inscriptions survive from the 4th to the 15th centuries, many in temples like Mỹ Sơn and Po Nagar. The early ones (4th–6th c.) use Southern Brāhmī/Grantha; later ones shift to a distinctive Cham script.

Chinese sources (Liang Shu, Sui Shu) mention *Linyi* (Champa) sending tribute to Chinese courts and engaging in maritime trade with Funan (Mekong Delta) and Java. The Võ Cảnh stele likely commemorates an early Cham ruler who adopted Sanskrit titles to legitimize authority. The choice of Sanskrit—rather than {{cultural:cham}}—signals participation in a trans-regional "Sanskritic ecumene" (Sheldon Pollock's term), where South and Southeast Asian elites shared a cosmopolitan literary culture.

---

## Section 4: Case Study III—The Kedukan Bukit Inscription of {{cultural:srivijaya}} (1,000 words)

<span class="inline-flex items-center justify-center h-6 w-6 rounded bg-green-600 text-white font-semibold text-xs">A</span> **Claim**: The Kedukan Bukit inscription (Palembang, Sumatra) records a {{cultural:siddhayatra}} (victorious expedition) by Dapunta Hyang and is precisely dated to 1 May 683 CE (Śaka 605).

**Primary Evidence**:

Discovered in 1920 near Palembang, this stone inscription is written in Old Malay using Pallava script. It is one of the earliest dated records of the {{cultural:srivijaya}} polity. Key excerpt:

> *śaka varṣātīta 605 vaiśākha māsa…*  
> "In the year 605 of the Śaka era, in the month of Vaiśākha…"

> *siddhayātrā*  
> "victorious expedition"

The Śaka date converts to 1 May 683 CE. The inscription describes Dapunta Hyang Sri Jayanasa leading a fleet of 20,000 soldiers and establishing his capital after a successful expedition. The term *siddhayātrā* (from Sanskrit *siddhi* "success" + *yātrā* "journey") is a loanword in Old Malay, showing Sanskrit's penetration into local administrative vocabulary.

**Script Analysis**:

The Pallava script of Kedukan Bukit is more evolved than that of Kutai. Letters are angular with clear baseline alignment, and vowel diacritics are consistently applied. This 7th-century Pallava style matches inscriptions from Narasimhavarman I's reign in Kanchipuram (c. 630–668 CE). Palaeographer de Casparis concluded that the scribe was either trained in South India or worked in a Sumatran scriptorium following South Indian models.

**Archaeological Context**:

The Palembang region has yielded extensive evidence of 7th–9th-century trade:

- **Chinese ceramics** (Tang dynasty, 7th–8th c.)  
- **Glass beads** from the Middle East  
- **Gold jewelry** with South Indian motifs  
- **Buddhist statuary** in Gupta-Pallava styles  

The Musi River, where Kedukan Bukit stands, was {{cultural:srivijaya}}'s main artery to the Straits of Malacca. The inscription's location on a hillock overlooking the river suggests it marked a ceremonial or administrative center.

**Paired Evidence**: Dated inscription (683 CE) + Tang ceramics + South Indian-style statuary + Old Malay linguistic features = **A-grade confidence**.

### {{cultural:srivijaya}} as an Epigraphic Empire

{{cultural:srivijaya}} (7th–13th centuries) controlled the Straits of Malacca, extracting tolls from ships passing between the Indian Ocean and the South China Sea. Its power rested on:

1. **Naval dominance** (fleets capable of projecting force across the archipelago)  
2. **Buddhist networks** (patronage of monasteries attracting Indian and Chinese monks)  
3. **Epigraphic administration** (Old Malay inscriptions standardizing laws, oaths, and grants)  

Over 70 {{cultural:srivijaya}} inscriptions survive, many in Old Malay with Sanskrit loanwords. The Pallava script served as the medium for royal decrees, land grants, and curses against rebels. This epigraphic apparatus mirrored that of South Indian kingdoms, suggesting that {{cultural:srivijaya}} adopted not just script but also Indic models of statecraft.

---

## Section 5: Transmission Channels—Monks, Merchants, Monarchs (1,050 words)

How did Brāhmī, Pallava, and Grantha scripts traverse 3,000 nautical miles from the {{cultural:vaigai}} to Borneo? We identify three overlapping networks:

### 1. Monastic Networks <span class="inline-flex items-center justify-center h-6 w-6 rounded bg-amber-600 text-white font-semibold text-xs ml-1">B</span>

Buddhist monks traveled extensively between South Asia and Southeast Asia, establishing *vihāra* (monasteries) along trade routes. Chinese pilgrims like Faxian (4th–5th c.) and Yijing (7th c.) described stopping at Sumatran monasteries where Indian monks taught in Sanskrit and Pali. These institutions required scribes to copy sūtras, creating a demand for literate monks trained in Brāhmī-derived scripts.

**Evidence**: Inscriptions at Nalanda (Bihar, India) mention monks from *Yavadvīpa* (Java) and *Śrīvijaya*. The Nālandā Copper Plate (9th c.) records a Sailendra king from Java endowing a monastery. Such patronage implies that Javanese and Sumatran monks were **receiving training** in Indian scriptoria and then returning home, carrying epigraphic knowledge.

**Why B-grade?** We infer monastic transmission from scattered references in pilgrimage accounts and endowment inscriptions. We lack a **single excavated monastery** with both Indian and Southeast Asian inscriptions in situ, which would give us paired evidence.

### 2. Merchant Guilds ({{cultural:sreni}}) <span class="inline-flex items-center justify-center h-6 w-6 rounded bg-amber-600 text-white font-semibold text-xs ml-1">B</span>

South Indian merchant guilds (*sreni*, *nigama*, *nakara*) operated trans-oceanic ventures. The **Takuapa inscription** (southern Thailand, 9th c.) records a Tamil guild's land grant in Pallava script. The **Bujang Valley** (Kedah, Malaysia) has yielded Tamil-Pallava graffiti on pottery. These are not royal decrees but **mercantile records**—evidence that traders needed literacy to negotiate contracts, record debts, and mark ownership.

**Evidence**: The Manigramam and Ayyavole guilds (active 9th–13th c.) issued copper plate charters in Tamil and Sanskrit. Some charters mention Southeast Asian ports like Kataha (Kedah) and Pegu (Myanmar). The guilds likely employed Brahmin scribes, who doubled as ritual specialists and accountants.

**Why B-grade?** We have inscriptions and historical references, but we lack **excavated guild offices** with business records, seals, and dated pottery. Archaeological pairing remains incomplete.

### 3. Royal Courts and Scribal Workshops <span class="inline-flex items-center justify-center h-6 w-6 rounded bg-green-600 text-white font-semibold text-xs ml-1">A</span>

The most direct transmission mechanism was **royal patronage**. Pallava and Chola courts maintained scribal workshops where apprentices learned script, meter, and grammar. Southeast Asian kings seeking to legitimize rule would **invite Brahmin priests and scribes** to compose Sanskrit *praśasti* (panegyrics).

**Evidence**: The Kutai {{cultural:yupa}} explicitly mention Brahmin recipients of royal gifts. Mūlavarman's court must have hosted Sanskrit-literate Brahmins capable of composing *vājimedha* inscriptions. Similarly, the Kedukan Bukit inscription's precise Pallava ductus suggests a court scriptorium modeled on South Indian practices.

**Why A-grade?** We have **paired evidence**: royal inscriptions + archaeological finds (gold, pottery) + linguistic analysis (Sanskrit loanwords in Old Malay). This triangulation gives us high confidence in royal scribal workshops as a transmission channel.

---

## Section 6: Correlating Śāstra & Song—Textual and Archaeological Convergence (900 words)

Can we correlate epigraphic evidence with **literary sources** and **archaeological finds**? Here we test the paired-evidence rule.

### Correlation 1: Periplus and Pallava Ports <span class="inline-flex items-center justify-center h-6 w-6 rounded bg-amber-600 text-white font-semibold text-xs ml-1">B</span>

The *Periplus Maris Erythraei* (1st c. CE) describes Muziris and Nelcynda as pepper ports where ships from Egypt exchanged gold for spices. Pattanam excavations have confirmed 1st–3rd-century CE trade. Now, the Pallava heartland (Kanchipuram) is inland, but Pallava kings controlled ports like Mamallapuram and Kanchipuram's hinterland connected to the {{cultural:kaveri}} Delta. Did Pallava scribes travel via Pallava ports to Southeast Asia?

**Evidence**: No Pallava-period inscription explicitly mentions Mamallapuram → Java routes. However, the **7th-century Hsüan-tsang** (Chinese pilgrim) describes ships from "Chu-li-ye" (possibly Chola/Pallava coast) reaching Java. The script on Javanese inscriptions (8th c.) matches Pallava ductus.

**Convergence**: Literary reference (Hsüan-tsang) + palaeographic match (Pallava → Javanese) + archaeological context (Mamallapuram as a functioning port, evidenced by shore temples and brick structures) = B-grade. We lack a **dated shipwreck** with Pallava inscriptions en route to Java, which would yield A-grade confidence.

### Correlation 2: Sangam Poetry and Tamil-Brāhmī <span class="inline-flex items-center justify-center h-6 w-6 rounded bg-red-600 text-white font-semibold text-xs ml-1">C</span>

Sangam poems (1st–3rd c. CE) mention overseas trade and "{{cultural:yavana}}" (Greek/Roman) merchants. The Pattinappālai describes Kaveripattinam's harbor with "yavana" bringing gold and taking pepper. Elsewhere, Sangam texts mention *olai* (palm-leaf) records used by merchants. Did these palm-leaf records employ Tamil-Brāhmī?

**Evidence**: No palm-leaf Tamil-Brāhmī has survived (organic decay). We have only potsherds and stone graffiti. Literary descriptions of *olai* suggest literacy was widespread, but we cannot confirm the **script** used.

**Convergence**: Literary reference (Sangam) + archaeological finds (potsherds with Tamil-Brāhmī) + historical plausibility = C-grade. The link is plausible but not proven by paired evidence.

---

## Section 7: Methods & Caveats—Epistemic Humility in Epigraphic Reconstruction (750 words)

This atlas makes no claim to completeness. Hundreds of inscriptions remain unpublished, and many sites await excavation. Our confidence rubric is a tool, not a verdict. A B-grade claim is not "wrong"; it simply lacks the archaeological triangulation that would elevate it to A. Future finds may upgrade (or downgrade) our assessments.

### Known Lacunae

1. **The Funan Gap**: Chinese sources describe Funan (Mekong Delta, 1st–6th c. CE) as a major polity, yet few early inscriptions survive. Did Funan use Brāhmī? We await excavation.
2. **The Cham Script Transition**: How and when did {{cultural:champa}} shift from Southern Brāhmī/Grantha to its distinctive Cham script (c. 8th century)? Palaeographic studies are ongoing.
3. **Sunda Straits Mystery**: Why do we have abundant inscriptions from Sumatra ({{cultural:srivijaya}}) and Java (Sailendra) but almost none from the Sunda Straits islands (Bangka, Belitung)? Were these regions less literate, or have inscriptions perished?

### Methodological Notes

**Palaeography is not dating**: Script styles overlap. A "4th-century Pallava ductus" could persist into the 5th century in peripheral regions. We use palaeography as a **relative chronology** tool, not an absolute date.

**Sanskrit ≠ Indian identity**: Southeast Asian rulers adopted Sanskrit for its prestige, not because they identified as "Indian." The Kedukan Bukit inscription is in Old Malay with Sanskrit loanwords—a hybrid epigraphic register reflecting local agency.

**Absence of evidence ≠ evidence of absence**: The dearth of inscriptions in certain regions (e.g., Sumatra's west coast) may reflect material perishability, not absence of literacy.

---

## Section 8: Atlas Appendix—Structured Data for GIS Mapping

| Site                | Region          | Script Type         | Date (CE)       | Confidence | Key Terms                                        |
|---------------------|-----------------|---------------------|-----------------|------------|--------------------------------------------------|
| Kandahar Bilingual  | Afghanistan     | Greek, Aramaic      | c. 250 BCE      | A          | Aśokan edict, non-Brāhmī                         |
| Kutai Yūpa          | East Kalimantan | Pallava             | late 4th c.     | A          | {{cultural:yupa}}, *aśvamedha*, Mūlavarman       |
| Võ Cảnh Stele       | Champa (Vietnam)| Southern Brāhmī     | 2nd–4th c. (?)  | B          | Earliest Champa, contested date                  |
| Kedukan Bukit       | Sumatra         | Pallava (Old Malay) | 683 CE          | A          | {{cultural:siddhayatra}}, {{cultural:srivijaya}} |
| Takuapa             | Thailand        | Tamil-Pallava       | 8th–9th c.      | B          | {{cultural:sreni}}, merchant guild               |
| Ligor               | Thailand        | Pallava             | 8th c.          | B          | Linked to {{cultural:srivijaya}}                 |

---

## Conclusion: Scripts as Vectors of Connectivity (600 words)

Brāhmī, Grantha, and Pallava scripts were not merely writing systems; they were **technologies of statecraft, commerce, and cosmopolitanism**. When a Bornean king erected {{cultural:yupa}} pillars in Pallava script, he was not imitating India—he was **participating** in a trans-regional epigraphic culture. When a Tamil guild inscribed land grants in Takuapa, it was not colonizing Thailand—it was **documenting** mercantile networks that spanned the Bay of Bengal.

This atlas has traced these epigraphic vectors from the {{cultural:vaigai}} to Borneo, Champa, and {{cultural:srivijaya}}, applying a paired-evidence rule to assess confidence. We find:

- **A-grade confidence** in Kutai (late 4th c.) and Kedukan Bukit (683 CE), where inscriptions pair with archaeology.
- **B-grade confidence** in Võ Cảnh (2nd–4th c.?), where palaeography alone guides us.
- **C-grade confidence** in monastic and mercantile networks, inferred from scattered references.

These scripts sailed not as passive cargo but as active agents, shaping legal codes, religious practices, and political legitimacy. The Pallava ductus that graced Kanchipuram temples also graced the {{cultural:yupa}} of East Kalimantan. The Tamil-Brāhmī that marked pottery in Kodumanal marked pottery in Bujang Valley. 

In future work, we will expand this atlas to include:

- **Javanese inscriptions** (Canggal, Tuk Mas)
- **Bali's early epigraphy** (Blanjong pillar, 913 CE)
- **Cham script evolution** (4th–15th c.)
- **Khmer epigraphy** and its Pallava roots

For now, we conclude with a methodological plea: **Epigraphy without archaeology is conjecture; archaeology without epigraphy is mute**. The scripts that sailed carried not just words but worlds. Let us read them with rigor, humility, and the paired-evidence rule as our compass.`,
    hi: `[Hindi translation would be added here - abbreviated for development]`,
    ta: `[Tamil translation would be added here - abbreviated for development]`
  },
  localizations: ['en', 'hi', 'ta'],
  tags: ['Epigraphy', 'Palaeography', 'Sanskrit', 'Southeast Asia', 'Maritime Trade', 'Scripts', 'Inscriptions', 'Tamil-Brāhmī', 'Pallava', 'Grantha'],
  featuredImage: '/images/flatlay_scripts-that-sailed_4x3_v3.png',
  readingTime: 45,
  author: 'Kanika Rakesh',
  publishDate: '2025-10-04',
  lastUpdated: '2025-10-04'
};
