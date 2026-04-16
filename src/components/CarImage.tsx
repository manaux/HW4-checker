/**
 * CarImage — renders the per-model SVG silhouette with verdict-tinted border
 * and animated crossfade when the model changes.
 *
 * SVG fill is controlled by `currentColor` — the parent text color class
 * (`text-white/35`) tints the silhouette at ~35% opacity on the black background.
 */
import { AnimatePresence, motion } from 'motion/react'
import type { TeslaModel, Hw4Verdict } from '../types/index'
import ModelSSvg from '../assets/model-s.svg?react'
import Model3Svg from '../assets/model-3.svg?react'
import ModelXSvg from '../assets/model-x.svg?react'
import ModelYSvg from '../assets/model-y.svg?react'
import CybertruckSvg from '../assets/cybertruck.svg?react'

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

const MODEL_SVG: Record<TeslaModel, React.FC<React.SVGProps<SVGSVGElement>>> = {
  S: ModelSSvg,
  '3': Model3Svg,
  X: ModelXSvg,
  Y: ModelYSvg,
  Cybertruck: CybertruckSvg,
}

export default function CarImage({ model, verdict }: CarImageProps) {
  const SvgComponent = MODEL_SVG[model]

  return (
    <div
      className={`h-48 w-full rounded-lg border ${verdictBorderClass(verdict)} bg-white/[0.02] overflow-hidden`}
      role="img"
      aria-label={`${modelDisplayName(model)} silhouette`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={model}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="w-full h-full flex items-center justify-center p-4"
        >
          <SvgComponent className="w-full h-full text-white/35" aria-hidden="true" />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
