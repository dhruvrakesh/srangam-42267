/**
 * Article ↔ Imaging seed-challenge mapping.
 *
 * The imaging app (maps.sankyo.in) ships a fixed list of "seed challenges"
 * for the Srangam Dating Lab — see SEED_CHALLENGES in that project. Some of
 * those map naturally to themes/tags we already use on Srangam articles.
 *
 * This file is intentionally curated and small. Add entries as new
 * articles or new seed challenges land. Order matters: the first match wins.
 */

export interface ChallengeMatch {
  /** Seed challenge ID exactly as defined in the imaging project. */
  challengeId: string;
  /** Human-readable label for the launcher button. */
  label: string;
  /** Lower-cased keywords / tag fragments that trigger this match. */
  triggers: string[];
}

const RULES: ChallengeMatch[] = [
  {
    challengeId: 'mahabharata-eclipse-kurukshetra',
    label: 'Run the Mahabharata eclipse challenge',
    triggers: ['mahabharata', 'kurukshetra', 'jayadratha', 'drona'],
  },
  {
    challengeId: 'lunar-eclipse-ujjain',
    label: 'Run the Ujjain lunar-eclipse finder',
    triggers: ['ujjain', 'lunar eclipse'],
  },
  {
    challengeId: 'solar-eclipse-north-india',
    label: 'Run the North-India solar-eclipse finder',
    triggers: ['solar eclipse', 'eclipse'],
  },
  {
    challengeId: 'venus-evening-star',
    label: 'Open the Venus evening-star challenge',
    triggers: ['venus', 'shukra'],
  },
  {
    challengeId: 'precession-demo',
    label: 'Open the precession explainer',
    triggers: ['precession', 'nakshatra', 'ayanamsha', 'ayanamsa'],
  },
  {
    challengeId: 'new-moon-monsoon',
    label: 'Open the moon-phase / monsoon challenge',
    triggers: ['monsoon', 'amavasya', 'new moon'],
  },
  {
    // Catch-all for palaeo-astronomy-adjacent civilisational topics where a
    // precession/nakshatra explainer is the most useful imaging-side hook.
    // Keep this rule LAST — first-match-wins, more specific rules above.
    challengeId: 'precession-demo',
    label: 'Open the precession & nakshatra explainer',
    triggers: [
      'harappa',
      'indus',
      'sarasvati',
      'sarasvatī',
      'ghaggar',
      'dwaraka',
      'dvaraka',
      'dvārakā',
      'rigveda antiquity',
      'vedic chronology',
    ],
  },
];

/**
 * Find the best-matching seed challenge for an article based on its tags,
 * theme, and title. Returns null when nothing matches confidently.
 */
export function matchChallenge(
  inputs: { tags?: string[]; theme?: string; title?: string },
): ChallengeMatch | null {
  const haystack = [
    ...(inputs.tags ?? []),
    inputs.theme ?? '',
    inputs.title ?? '',
  ]
    .join(' ')
    .toLowerCase();

  if (!haystack.trim()) return null;

  for (const rule of RULES) {
    if (rule.triggers.some((t) => haystack.includes(t))) {
      return rule;
    }
  }
  return null;
}
