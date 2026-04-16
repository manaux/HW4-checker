/**
 * RecentVins — shows the last up-to-5 submitted VINs as clickable chips.
 * Visible only when the input is empty (visible prop = true).
 * Clicking a chip calls onSelect(vin), which triggers a full decode in App.
 */
import type { RecentVinEntry, Hw4Verdict } from '../types/index'

interface RecentVinsProps {
  entries: RecentVinEntry[]
  onSelect: (vin: string) => void
  visible: boolean
}

/** Short model abbreviation for chip display. */
function modelAbbrev(model: NonNullable<RecentVinEntry['model']>): string {
  const abbrevs: Record<NonNullable<RecentVinEntry['model']>, string> = {
    S: 'S',
    '3': '3',
    X: 'X',
    Y: 'Y',
    Cybertruck: 'CT',
  }
  return abbrevs[model]
}

/** Colored dot class for verdict. */
function verdictDotClass(verdict: Hw4Verdict): string {
  return verdict === 'yes' ? 'bg-emerald-400' : verdict === 'no' ? 'bg-rose-400' : 'bg-amber-400'
}

export default function RecentVins({ entries, onSelect, visible }: RecentVinsProps) {
  if (!visible || entries.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-(--color-text-secondary) uppercase tracking-wide">
        Recent VINs
      </span>
      <div className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <button
            key={entry.vin}
            type="button"
            onClick={() => onSelect(entry.vin)}
            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-(--color-text-secondary) hover:bg-white/10 hover:text-(--color-text-primary) transition-colors min-h-[36px]"
            aria-label={`Re-check VIN ending in ${entry.vin.slice(-6)}`}
          >
            {/* VIN tail */}
            <span className="font-mono">{entry.vin.slice(-6)}</span>

            {entry.status === 'ok' && entry.model && entry.verdict ? (
              <>
                {/* Model abbreviation */}
                <span className="opacity-60">·</span>
                <span>{modelAbbrev(entry.model)}</span>
                {/* Verdict dot */}
                <span
                  className={`w-2 h-2 rounded-full ${verdictDotClass(entry.verdict)}`}
                  aria-hidden="true"
                />
              </>
            ) : (
              <span className="opacity-50 italic">invalid</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
