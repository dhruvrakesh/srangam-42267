import { Card, CardContent } from "@/components/ui/card";
import { Database, Sigma, AlertTriangle, CircleDashed } from "lucide-react";
import {
  MEASURED_ON,
  CONTAMINATION_MEASURED_ON,
  TRANSLATION_STATUS,
  PANCHANG_STATUS,
  CAVEATS,
  NOT_YET,
} from "@/data/projectStatus";

type Variant = "translation" | "panchang";

const nf = new Intl.NumberFormat("en-IN");

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-bold text-indigo-dharma tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-xs sm:text-sm text-muted-foreground leading-snug">
        {label}
      </div>
    </div>
  );
}

/**
 * Where the project actually stands, with the date each figure was measured.
 *
 * The design brief is unusual and deliberate: the unfinished list is given the
 * same visual weight as the totals. A research tool that publishes only what
 * worked is publishing half a result, and the half it omits is the half a
 * reader needs in order to judge the rest.
 */
export function ProjectStatusPanel({ variant }: { variant: Variant }) {
  const t = TRANSLATION_STATUS;
  const p = PANCHANG_STATUS;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/40">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Where this actually stands
          </h2>
          <p className="text-sm text-muted-foreground">
            {/* STATUS_LIVE_2026_09_12 - the contamination figures are measured
                by a different tool, in another repository, on their own date.
                Claiming one date for the whole page overstated it. */}
            Corpus figures measured on{" "}
            <time dateTime={MEASURED_ON}>{MEASURED_ON}</time>; the contamination
            figures on{" "}
            <time dateTime={CONTAMINATION_MEASURED_ON}>
              {CONTAMINATION_MEASURED_ON}
            </time>
            . Nothing here is an estimate.
          </p>
        </div>

        {variant === "translation" ? (
          <>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <Figure value={nf.format(t.works)} label="works in the corpus" />
                  <Figure value={nf.format(t.passages)} label="passages extracted" />
                  {/* STATUS_LIVE_2026_09_12 - "passages translated" was accurate
                      only while English was the sole target. It is not. */}
                  <Figure value={nf.format(t.translated)} label="English translations" />
                  <Figure value={nf.format(t.translatedHi)} label="Hindi translations" />
                  <Figure value={nf.format(t.embeddings)} label="passages embedded" />
                </div>

                <div className="mt-8 pt-6 border-t grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Sigma className="w-4 h-4 mt-0.5 shrink-0 text-indigo-dharma" />
                    <span>
                      <strong>{nf.format(t.entities)}</strong> named entities across{" "}
                      <strong>{nf.format(t.entityMentions)}</strong> mentions
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Database className="w-4 h-4 mt-0.5 shrink-0 text-indigo-dharma" />
                    <span>
                      {t.completeWorks.map((w) => (
                        <span key={w.name}>
                          <strong>{w.name}</strong> complete at {w.coverage} (
                          {nf.format(w.passages)} passages)
                        </span>
                      ))}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CircleDashed className="w-4 h-4 mt-0.5 shrink-0 text-indigo-dharma" />
                    <span>Scan quality: {t.cleanFraction}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6 border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-500" />
                  <div className="text-sm leading-relaxed">
                    <p className="font-semibold mb-2">
                      {nf.format(t.damagedTranslated)} translated passages come from
                      badly damaged scans
                    </p>
                    <p className="text-muted-foreground">
                      {nf.format(t.damagedConcentration.passages)} of them —{" "}
                      {t.damagedConcentration.share} — sit in a single work, the{" "}
                      {t.damagedConcentration.work}. The damage is concentrated, not
                      spread, which is the difference between re-scanning one book and
                      re-scanning a library.
                    </p>
                    {CAVEATS.map((c) => (
                      <div key={c.heading} className="mt-4 pt-4 border-t border-amber-500/20">
                        <p className="font-semibold mb-1">{c.heading}</p>
                        <p className="text-muted-foreground">{c.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <Figure value={nf.format(p.tests)} label="tests in the suite" />
                <Figure value={p.zodiac} label="zodiac basis" />
                <Figure value={p.engine.split(" ")[1]} label="pyswisseph version" />
              </div>
              <div className="mt-8 pt-6 border-t space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Sigma className="w-4 h-4 mt-0.5 shrink-0 text-indigo-dharma" />
                  <span>
                    Ephemeris provenance is <strong>{p.provenance}</strong> — each
                    exported chart records the engine that actually answered, rather
                    than the one it was configured to use.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-500" />
                  <span>
                    Currently running on the <strong>{p.currentEphemeris}</strong>.
                    Positions are accurate to arc-seconds for most purposes but are
                    not the full Swiss Ephemeris; charts state this themselves.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-dashed">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Not yet true
            </h3>
            <ul className="space-y-2 text-sm">
              {NOT_YET.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CircleDashed className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default ProjectStatusPanel;
