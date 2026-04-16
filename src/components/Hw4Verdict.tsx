/**
 * Hw4Verdict — prominent color-coded verdict badge with optional caveat text
 * and an expandable "Why this verdict?" details section showing the matched rule,
 * confidence level, reasoning, and source citation.
 */
import type { Hw4Result, SourceMap, Hw4Verdict as Hw4VerdictType } from '../types/index'

interface Hw4VerdictProps {
  result: Hw4Result
  sources: SourceMap
}

/** Maps a verdict to the Tailwind text-color class for that outcome. */
function verdictColorClass(verdict: Hw4VerdictType): string {
  return verdict === 'yes'
    ? 'text-emerald-400'
    : verdict === 'no'
      ? 'text-rose-400'
      : 'text-amber-400'
}

/** Maps a verdict to a short human-readable label. */
function verdictLabel(verdict: Hw4VerdictType): string {
  return verdict === 'yes'
    ? 'Definitely has HW4'
    : verdict === 'no'
      ? 'Definitely not HW4'
      : 'Not sure about HW4 — check Software screen'
}

/** Maps confidence to a color class. */
function confidenceColorClass(confidence: Hw4Result['confidence']): string {
  return confidence === 'high'
    ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
    : confidence === 'medium'
      ? 'text-amber-400 border-amber-400/30 bg-amber-400/10'
      : 'text-(--color-text-secondary) border-white/20 bg-white/5'
}

/** Inline small external-link SVG icon (no icon library). */
function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="inline w-3 h-3 ml-0.5 align-middle opacity-70"
      aria-hidden="true"
    >
      <path d="M2 10L10 2M5 2h5v5" />
    </svg>
  )
}

/**
 * Render caveat text. The caveat string uses **bold** markdown convention from
 * hw4.ts — replace **…** spans with <strong> for the one known use case.
 * This is intentionally minimal: no full markdown parser needed.
 */
function CaveatText({ text }: { text: string }) {
  // Split on **…** pairs — two bold spans max in the known caveats
  const parts = text.split(/\*\*(.+?)\*\*/)
  return (
    <p className="text-sm leading-relaxed text-(--color-text-secondary)">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="text-(--color-text-primary)">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </p>
  )
}

export default function Hw4Verdict({ result, sources }: Hw4VerdictProps) {
  const { verdict, matchedRule, confidence, reasoning, caveat } = result
  const colorClass = verdictColorClass(verdict)
  const isFallback = matchedRule.source === '_no_match_fallback'
  const sourceInfo = !isFallback ? sources[matchedRule.source] : null

  return (
    <div className="flex flex-col gap-4">
      {/* Verdict badge */}
      <div
        className={`text-2xl font-bold text-center tracking-tight ${colorClass}`}
        role="status"
        aria-live="polite"
      >
        {verdictLabel(verdict)}
      </div>

      {/* Caveat (shown for 'no' and 'maybe' verdicts) */}
      {caveat && <CaveatText text={caveat} />}

      {/* Explain verdict */}
      <details className="group rounded-lg border border-white/10 bg-white/[0.02]">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors">
          Why this verdict?
          {/* Chevron rotates when open — CSS-only via group-open pseudo */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 transition-transform group-open:rotate-180"
            aria-hidden="true"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </summary>

        <div className="flex flex-col gap-3 px-4 pb-4 pt-1 text-sm">
          {/* Matched rule summary */}
          <div className="text-(--color-text-secondary)">
            <span className="font-medium text-(--color-text-primary)">Rule: </span>
            {`${matchedRule.model === 'Cybertruck' ? 'Cybertruck' : `Model ${matchedRule.model}`} · ${matchedRule.plant} · ${matchedRule.modelYear === 0 ? 'Pre-2020' : matchedRule.modelYear}`}
          </div>

          {/* Serial range (if present) */}
          {matchedRule.serialRange && (
            <div className="text-(--color-text-secondary)">
              <span className="font-medium text-(--color-text-primary)">Serial range: </span>
              {matchedRule.serialRange.min?.toLocaleString()} –{' '}
              {matchedRule.serialRange.max?.toLocaleString()}
            </div>
          )}

          {/* Confidence badge */}
          <div>
            <span
              className={`inline-block rounded border px-2 py-0.5 text-xs font-medium capitalize ${confidenceColorClass(confidence)}`}
            >
              {confidence} confidence
            </span>
          </div>

          {/* Reasoning */}
          {reasoning && (
            <p className="text-(--color-text-secondary) leading-relaxed">{reasoning}</p>
          )}

          {/* Source citation */}
          <div className="text-(--color-text-secondary)">
            <span className="font-medium text-(--color-text-primary)">Source: </span>
            {isFallback ? (
              <span>No source (fallback)</span>
            ) : sourceInfo ? (
              <a
                href={sourceInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                {matchedRule.source}
                <ExternalLinkIcon />
              </a>
            ) : (
              <span>{matchedRule.source}</span>
            )}
          </div>
        </div>
      </details>
    </div>
  )
}
