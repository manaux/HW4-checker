/**
 * HW4 verdict engine for HW4 Checker.
 *
 * Public surface:
 *   determineHw4(parsed: ParsedVin): Hw4Result
 *
 * All logic is pure (no side effects in production; console.warn in DEV only).
 * Rule data is imported from the bundled hw4Rules.json — no network requests.
 */

import type { ParsedVin, CutoffRule, Hw4Result, HW4RulesFile } from '../types/index'
import hw4RulesRaw from '../data/hw4Rules.json'

// Type-assert the JSON import — TS's automatic inference produces a wider type
// than HW4RulesFile. The `as` cast is safe because hw4Rules.test.ts validates the schema.
const hw4Rules = hw4RulesRaw as HW4RulesFile

// ---------------------------------------------------------------------------
// Caveat string constants
// ---------------------------------------------------------------------------

/**
 * Shown alongside 'no' verdicts (HW4-06).
 * Explains that the verdict reflects factory hardware, not post-retrofit state.
 */
export const RETROFIT_CAVEAT =
  'This verdict reflects what the car shipped with from the factory. If the car has been retrofitted, the actual hardware may differ — check the Software screen to confirm.'

/**
 * Shown alongside 'maybe' verdicts (HW4-07).
 * Instructs the user how to check actual hardware generation on the car.
 */
export const SOFTWARE_SCREEN_INSTRUCTIONS =
  "To check the actual hardware: in the car, tap **Controls → Software → Additional Vehicle Information**. Look for 'Computer: AI4' (HW4) or 'AI3' (HW3)."

// ---------------------------------------------------------------------------
// No-match fallback rule (synthetic — not in hw4Rules.json)
// ---------------------------------------------------------------------------

/**
 * Synthetic CutoffRule returned when no entry in hw4Rules.json matches
 * the (model, plant, modelYear) combination from the parsed VIN.
 *
 * This should rarely occur in practice (the dataset covers MY2020–2026 for all
 * known Tesla model+plant combinations). When it does, 'maybe' + 'low' confidence
 * is the safest verdict: do not guess, let the car's Software screen decide.
 */
export const _NO_MATCH_FALLBACK_RULE: CutoffRule = {
  model: 'Y', // placeholder — not meaningful for a fallback rule
  plant: '_no_match_fallback',
  modelYear: 0,
  verdict: 'maybe',
  source: '_no_match_fallback',
  confidence: 'low',
  reasoning:
    "No HW4 data found for this model + plant + year combination. Tesla may have started or stopped producing this combination outside our dataset coverage. Please check the car's Software screen.",
}

// ---------------------------------------------------------------------------
// Verdict engine
// ---------------------------------------------------------------------------

/**
 * Determines the HW4 verdict for a decoded Tesla VIN.
 *
 * Matching algorithm (four steps, strictly in order — first match wins):
 *
 *   1. Cybertruck fast-path: model === 'Cybertruck' → always 'yes'
 *   2. Pre-2020 sentinel: modelYear < 2020 → 'no' (finds pre-2020 rule for model)
 *   3. Exact (model, plant, modelYear) match with serial-range check
 *   4. No-match fallback: 'maybe' with synthetic rule + low confidence
 *
 * @param parsed Output of parseVin(). Caller must have validated the VIN first.
 * @returns Hw4Result with verdict, matchedRule, confidence, reasoning, and optional caveat.
 */
export function determineHw4(parsed: ParsedVin): Hw4Result {
  const { model, plant, modelYear, serial } = parsed
  const serialInt = parseInt(serial, 10)

  // ---- Step 1: Cybertruck fast-path ----------------------------------------
  if (model === 'Cybertruck') {
    // Any Cybertruck rule will do — use the first one (MY2024, verdict 'yes')
    const rule = hw4Rules.rules.find((r) => r.model === 'Cybertruck')!
    return makeResult(rule)
  }

  // ---- Step 2: Pre-2020 sentinel -------------------------------------------
  if (modelYear < 2020) {
    const rule = hw4Rules.rules.find((r) => r.plant === '__pre2020__' && r.model === model)
    if (rule) return makeResult(rule)
    // Fallback: no pre-2020 rule for this model (should not happen with current dataset)
    return makeFallbackResult()
  }

  // ---- Step 3: Exact (model, plant, modelYear) match -----------------------
  const candidates = hw4Rules.rules.filter(
    (r) => r.model === model && r.plant === plant && r.modelYear === modelYear,
  )

  for (const rule of candidates) {
    if (!rule.serialRange) {
      // Whole-year rule — applies to all serials
      return makeResult(rule)
    }
    const { min, max } = rule.serialRange
    if (min !== undefined && max !== undefined) {
      // Maybe zone: [min, max] inclusive
      if (serialInt >= min && serialInt <= max) return makeResult(rule)
    } else if (max !== undefined) {
      // No zone: serial <= max
      if (serialInt <= max) return makeResult(rule)
    } else if (min !== undefined) {
      // Yes zone: serial >= min
      if (serialInt >= min) return makeResult(rule)
    }
  }

  // ---- Step 4: No-match fallback -------------------------------------------
  return makeFallbackResult()
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function makeResult(rule: CutoffRule): Hw4Result {
  return {
    verdict: rule.verdict,
    matchedRule: rule,
    confidence: rule.confidence,
    reasoning: rule.reasoning ?? '',
    caveat: caveatFor(rule.verdict),
  }
}

function makeFallbackResult(): Hw4Result {
  if (import.meta.env.DEV) {
    // Helps spot uncovered combos during development. Removed in Phase 5.
    console.warn('[HW4 Checker] No rule matched — returning fallback maybe verdict.')
  }
  return makeResult(_NO_MATCH_FALLBACK_RULE)
}

function caveatFor(verdict: string): string | undefined {
  if (verdict === 'no') return RETROFIT_CAVEAT
  if (verdict === 'maybe') return SOFTWARE_SCREEN_INSTRUCTIONS
  return undefined
}
