// This React component forms a new section for the Srangam landing page.
// It introduces readers to the "Geomythology and Cultural Continuity" article
// (From Legends of Land Reclamation to Living Traditions) and cross‑references
// other Srangam articles via route cards. Each card contains a title, a list
// of related themes, a short description, and a link to its article. Tooltips
// are added for key cultural terms to provide etymology and context, making
// the page educational and interactive. The design follows the existing
// Featured Collections pattern seen on the home page, using dharmic colours
// and icons from the project’s icon set. The component relies on both the
// `CulturalTermTooltip` (for terms defined in `cultural-terms.ts`) and
// `DharmicTooltip` (for custom terms like Parashurama and Kashyapa) to
// display tooltips. To use this component, import it into `Home.tsx` and
// render it below the existing Featured Collections section.

import React from 'react';
import { Link } from 'react-router-dom';
import { IconBasalt, IconPort, IconLotus, IconDharmaChakra } from '@/components/icons';
import { CulturalTermTooltip } from '@/components/language/CulturalTermTooltip';
import { DharmicTooltip } from '@/components/i18n/DharmicTooltip';

// Define the data for each route card. Each entry lists the path to
// the article (slug), the icon component, the title, an array of items
// summarising key connections to the geomythology theme, and a description
// that provides context. When adding or updating articles, modify this
// array accordingly.
const cards = [
  {
    path: '/earth-sea-sangam',
    icon: IconBasalt,
    title: 'Earth & Sea Sangam',
    items: [
      // Use CulturalTermTooltip for terms that exist in the cultural terms
      // dataset. For example, samudra (sea) appears in `cultural-terms.ts`.
      <>Intertidal ecology & <CulturalTermTooltip term="samudra">samudra</CulturalTermTooltip> memory</>,
      'Chola maritime myths',
      'Rivers meeting the ocean'
    ],
    description:
      'Explore how coastal geomyths from Tamilakam mirror the legends of land reclamation and oceanic trade discussed in our Geomythology article.'
  },
  {
    path: '/stone-purana',
    icon: IconPort,
    title: 'Stone Purana',
    items: [
      'Megaliths & mythic kings',
      'Epigraphs as evidence',
      <>Naga & serpent cults</>
    ],
    description:
      'Read how monoliths and inscriptions across the subcontinent echo the reclamation myths of Paraśurama and Kaśyapa, linking stones to stories.'
  },
  {
    path: '/gondwana-to-himalaya',
    icon: IconLotus,
    title: 'Gondwana to Himalaya',
    items: [
      'Tectonic narratives',
      'Oral histories of mountains',
      'Puranic geology'
    ],
    description:
      'Trace the geological journeys from ancient Gondwana to the uplift of the Himalaya and see how these shifts shape and are shaped by sacred lore.'
  },
  {
    path: '/sacred-ecology',
    icon: IconDharmaChakra,
    title: 'Sacred Ecology',
    items: [
      'Groves, tanks & guardians',
      'Janajatiya stewardship',
      'Ritual ecology'
    ],
    description:
      'Discover the ecological ethics embedded in groves, ponds, and forests, complementing the reclamation stories of Kerala and Kashmir.'
  }
];

// Define the main component. It returns a section with an introduction
// explaining the geomythology theme and a grid of cards. Each card
// uses a Link from react‑router to navigate to the article and displays
// its content accordingly. The styling classes assume Tailwind CSS is
// available as in the Srangam project.
const GeomythologySection: React.FC = () => {
  return (
    <section className="py-16 bg-sandalwood-50 dark:bg-sandalwood-900">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink dark:text-gray-100">
            Geomythology & Cultural Continuity
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            Our geomythology series connects legendary acts of land reclamation
            like the stories of
            {' '}
            <DharmicTooltip
              data={{
                title: 'Paraśurāma',
                translation: 'Reclaimer of Kerala',
                transliteration: 'Parashurama',
                etymology: 'paraśu (axe) + rāma (Rāma), the sixth avatar of Viṣṇu',
                context:
                  'In Kerala lore, Paraśurāma throws his axe into the sea to reclaim land; this myth encodes shoreline changes and serpent cults.'
              }}
            >
              Paraśurāma
            </DharmicTooltip>
            {' '}and
            {' '}
            <DharmicTooltip
              data={{
                title: 'Kaśyapa',
                translation: 'Sage who drained the lake',
                transliteration: 'Kashyapa',
                etymology: 'kaccha (tortoise) or kaśyapa (turtle) root; a rishi from whom Kashmir derives its name',
                context:
                  'In Kashmir’s Satisaras legend, the sage Kaśyapa drains a primordial lake to make the valley habitable; the myth reflects geological uplift and hydrology.'
              }}
            >
              Kaśyapa
            </DharmicTooltip>
            . These myths are paired with evidence from geology, anthropology,
            and cultural studies to show how memory and materiality interweave.
          </p>
        </header>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ path, icon: Icon, title, items, description }) => (
            <div key={path} className="flex flex-col justify-between rounded-xl bg-white dark:bg-gray-800 shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-epigraphy-maroon-100 text-epigraphy-maroon-700 dark:bg-epigraphy-maroon-900 dark:text-epigraphy-maroon-200 mb-4">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-ink dark:text-gray-100 mb-2">
                  {title}
                </h3>
                <ul className="space-y-1 mb-3 list-disc list-inside text-gray-700 dark:text-gray-300">
                  {items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              </div>
              <div className="mt-4">
                <Link
                  to={path}
                  className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Continue reading
                  <svg
                    className="ml-2 h-4 w-4 fill-current"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      d="M12.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L15.586 10H3a1 1 0 110-2h12.586l-3.293-3.293a1 1 0 010-1.414z"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GeomythologySection;