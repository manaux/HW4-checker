/**
 * Shared TypeScript types for HW4 Checker.
 * These types are consumed by the data layer (vinMeta, hw4Rules) in Phase 1
 * and by the decode/verdict logic in Phase 2.
 */

/** Tesla model identifiers used throughout the app. */
export type TeslaModel = 'S' | '3' | 'X' | 'Y' | 'Cybertruck'

/**
 * Tri-state HW4 verdict.
 *  - 'yes'   → Definitely HW4 (manufactured with HW4 at the factory)
 *  - 'no'    → Definitely not HW4 (HW3 or earlier)
 *  - 'maybe' → Boundary VIN — check Controls > Software > Additional Vehicle Information
 */
export type Hw4Verdict = 'yes' | 'no' | 'maybe'

/** Alias: used when describing each zone of the three-zone cutoff schema. */
export type HW4Zone = Hw4Verdict

/** Geographic market derived from WMI. */
export type Market = 'US' | 'EU' | 'CN'

/**
 * All fields decoded from a 17-character Tesla VIN.
 * Produced by parseVin() in Phase 2.
 */
export interface ParsedVin {
  /** The raw 17-character VIN (uppercased). */
  vin: string
  /** Decoded Tesla model. */
  model: TeslaModel
  /** 4-digit model year (e.g. 2023). */
  modelYear: number
  /** Geographic market (US / EU / CN). */
  market: Market
  /** Human-readable plant name (e.g. "Fremont"). */
  plant: string
  /** Single-character plant code from VIN position 11 (e.g. "F"). */
  plantCode: string
  /** Motor/trim variant decoded from VIN position 8, where derivable. */
  trim?: string
  /** 6-character serial string from VIN positions 12–17 (leading zeros preserved). */
  serial: string
}

/** Metadata for a single data source cited in hw4Rules.json. */
export interface SourceInfo {
  url: string
  title: string
  accessedDate: string
}

/** Map of source IDs to their metadata. */
export type SourceMap = Record<string, SourceInfo>

/**
 * A single HW4 cutoff rule keyed on (model, plant, modelYear).
 *
 * Three-zone schema:
 *  - No serialRange → applies to the whole model year for that (model, plant).
 *  - serialRange.max set, no min → "definitely_not" zone (serial ≤ max → 'no').
 *  - serialRange.min set, no max → "definitely_yes" zone (serial ≥ min → 'yes').
 *  - Both min and max set → "maybe" zone (min ≤ serial ≤ max → 'maybe').
 *
 * Phase 2's determineHw4() handles the sentinel `modelYear: 0` / `plant: "__pre2020__"` specially
 * to catch all pre-2020 VINs in a single rule.
 */
export interface CutoffRule {
  model: TeslaModel
  /** Plant name string (e.g. "Fremont", "Shanghai", "Berlin", "Austin", "__pre2020__"). */
  plant: string
  /**
   * 4-digit model year, OR 0 as a sentinel meaning "any model year < 2020".
   * Phase 2 must check for modelYear === 0 and apply the rule to all MY < 2020.
   */
  modelYear: number
  verdict: Hw4Verdict
  /**
   * Optional serial range. Serial numbers are parsed as integers from VIN positions 12–17.
   * When present, this rule only applies if the serial falls within [min, max] inclusive.
   * Omit to apply the rule to all serials in the (model, plant, modelYear) bucket.
   */
  serialRange?: {
    min: number
    max: number
  }
  /** ID of the source in the _sources map of hw4Rules.json. */
  source: string
  confidence: 'high' | 'medium' | 'low'
  /** Human-readable explanation of why this verdict applies. Consumed by EXTRA-02 in Phase 3. */
  reasoning?: string
}

/**
 * Shape of the hw4Rules.json import.
 * Import with a type assertion: `import hw4Rules from './hw4Rules.json' as HW4RulesFile`
 */
export interface HW4RulesFile {
  _sources: SourceMap
  rules: CutoffRule[]
}
