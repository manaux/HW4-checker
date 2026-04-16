/**
 * CarImage — renders the per-model Tesla photo with verdict-tinted border
 * and animated crossfade when the model changes.
 *
 * Shows the "new" generation image for Model 3 Highland (MY2024+) and
 * Model Y refresh (MY2025+); older generation image otherwise.
 */
import { AnimatePresence, motion } from 'motion/react'
import type { TeslaModel, Hw4Verdict } from '../types/index'

import imgModelS from '../assets/hw4-model-MS.png'
import imgModel3 from '../assets/hw4-model-M3.png'
import imgModel3New from '../assets/hw4-model-M3-new.png'
import imgModelX from '../assets/hw4-model-MX.png'
import imgModelY from '../assets/hw4-model-MY.png'
import imgModelYNew from '../assets/hw4-model-MY-new.png'
import imgCybertruck from '../assets/hw4-model-CT.png'

interface CarImageProps {
  model: TeslaModel
  modelYear: number
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

/** Pick the right image based on model + generation (model year). */
function getModelImage(model: TeslaModel, modelYear: number): string {
  switch (model) {
    case 'S':
      return imgModelS
    case '3':
      // Model 3 Highland started MY2024
      return modelYear >= 2024 ? imgModel3New : imgModel3
    case 'X':
      return imgModelX
    case 'Y':
      // Model Y refresh (Juniper) started MY2025
      return modelYear >= 2025 ? imgModelYNew : imgModelY
    case 'Cybertruck':
      return imgCybertruck
  }
}

export default function CarImage({ model, modelYear, verdict }: CarImageProps) {
  const imageSrc = getModelImage(model, modelYear)
  const imageKey = `${model}-${modelYear >= 2024 && model === '3' ? 'new' : modelYear >= 2025 && model === 'Y' ? 'new' : 'old'}`

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`h-48 w-full rounded-lg border ${verdictBorderClass(verdict)} bg-white/[0.02] overflow-hidden`}
        role="img"
        aria-label={`${modelDisplayName(model)} photo`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={imageKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="w-full h-full flex items-center justify-center p-4"
          >
            <img
              src={imageSrc}
              alt={modelDisplayName(model)}
              className="max-w-full max-h-full object-contain"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="text-[10px] text-(--color-text-secondary) opacity-50 text-center">
        All vehicle images are property of Tesla, Inc.
      </p>
    </div>
  )
}
