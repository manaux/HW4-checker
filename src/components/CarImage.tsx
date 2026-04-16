/**
 * CarImage — placeholder component that shows the model name and verdict tint
 * while real SVG silhouettes are pending (Phase 4).
 *
 * Phase 4 contract: swap only the inner content div. The outer container
 * dimensions and verdict-tint border class stay; only the placeholder text
 * is replaced with an <img> or <svg>.
 */
import type { TeslaModel, Hw4Verdict } from '../types/index'

interface CarImageProps {
  model: TeslaModel
  verdict: Hw4Verdict
}

/** Human-readable model display name. Also used by DecodedInfo. */
export function modelDisplayName(model: TeslaModel): string {
  const names: Record<TeslaModel, string> = {
    S: 'Model S',
    '3': 'Model 3',
    X: 'Model X',
    Y: 'Model Y',
    Cybertruck: 'Cybertruck',
  }
  return names[model]
}

/** Low-opacity border tint class keyed on verdict. */
function verdictBorderClass(verdict: Hw4Verdict): string {
  return verdict === 'yes'
    ? 'border-emerald-400/20'
    : verdict === 'no'
      ? 'border-rose-400/20'
      : 'border-amber-400/20'
}

export default function CarImage({ model, verdict }: CarImageProps) {
  return (
    <div
      className={`h-48 w-full rounded-lg border ${verdictBorderClass(verdict)} bg-white/[0.02] flex flex-col items-center justify-center gap-1`}
      role="img"
      aria-label={`${modelDisplayName(model)} placeholder image`}
    >
      {/* Phase 4: replace this inner content with the model SVG */}
      <span className="text-2xl font-semibold text-(--color-text-primary)">
        {modelDisplayName(model)}
      </span>
      <span className="text-xs text-(--color-text-secondary)">
        Placeholder — real silhouette in Phase 4
      </span>
    </div>
  )
}
