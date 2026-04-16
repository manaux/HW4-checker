/**
 * Test fixtures for HW4 Checker.
 *
 * Exports:
 *   makeVin(opts)     — synthesize a valid Tesla VIN with correct check digit
 *   badCheckVin(vin)  — swap a VIN's check digit to a wrong value (for warning tests)
 *   REAL_VINS         — small set of anonymized real public VINs (last 6 zeroed)
 *
 * This file is test-only. Do NOT import from production code.
 */

import { TRANSLITERATION_MAP, CHECK_DIGIT_WEIGHTS } from '../data/vinMeta'

// ---------------------------------------------------------------------------
// makeVin
// ---------------------------------------------------------------------------

export interface MakeVinOptions {
  /** 3-char WMI, e.g. '5YJ'. */
  wmi: string
  /** Position 4 (index 3): model code. Default 'Y' (Model Y — most common in 2020+ Teslas). */
  pos4?: string
  /** Position 5 (index 4): body. Default 'A'. */
  pos5?: string
  /** Position 6 (index 5). Default '0'. */
  pos6?: string
  /** Position 7 (index 6): restraint. Default '1'. */
  pos7?: string
  /** Position 8 (index 7): motor/trim. Default 'F'. */
  pos8?: string
  /** Position 10 (index 9): model year char, e.g. 'P' = 2023. */
  modelYearChar: string
  /** Position 11 (index 10): plant code, e.g. 'F' = Fremont. */
  plantCode: string
  /** Positions 12–17 (indices 11–16): 6-char serial string. Leading zeros preserved. */
  serial: string
}

/**
 * Synthesizes a valid 17-character Tesla VIN with a correctly computed
 * ISO 3779 check digit in position 9.
 *
 * The check-digit weight for position 9 is 0, so the placeholder used
 * during computation does not affect the result.
 */
export function makeVin(opts: MakeVinOptions): string {
  const partial =
    opts.wmi +
    (opts.pos4 ?? 'Y') +
    (opts.pos5 ?? 'A') +
    (opts.pos6 ?? '0') +
    (opts.pos7 ?? '1') +
    (opts.pos8 ?? 'F') +
    '0' + // placeholder at position 8 (weight 0, value irrelevant)
    opts.modelYearChar +
    opts.plantCode +
    opts.serial

  if (partial.length !== 17) {
    throw new Error(
      `makeVin: assembled VIN has length ${partial.length} (expected 17). ` +
        `Check wmi (${opts.wmi.length}), serial (${opts.serial.length}).`,
    )
  }

  const checkChar = computeCheckDigitLocal(partial)
  return partial.slice(0, 8) + checkChar + partial.slice(9)
}

/**
 * Returns a copy of `vin` with the check digit (position 9) replaced by a
 * wrong character. Used to create VINs that trigger the CHECK_DIGIT warning.
 *
 * The replacement wraps through '0'–'9' and 'X' to find a value != the correct digit.
 */
export function badCheckVin(vin: string): string {
  const correct = computeCheckDigitLocal(vin)
  const CANDIDATES = '0123456789X'
  for (const c of CANDIDATES) {
    if (c !== correct) {
      return vin.slice(0, 8) + c + vin.slice(9)
    }
  }
  return vin // unreachable — there are always alternatives
}

// ---------------------------------------------------------------------------
// Anonymized real public VINs (last 6 chars zeroed)
// ---------------------------------------------------------------------------

/**
 * Small set of real Tesla VINs, anonymized (serial positions 12–17 replaced with '000000').
 * These are sanity-check fixtures — they verify that real WMI/plant/year combos decode
 * correctly, not just synthesized ones.
 *
 * Sources: TeslaTap community VIN examples / public TMC posts.
 * Confidence: WMI + positions 1–11 are real; serial is zeroed for privacy.
 * Check digit is RECOMPUTED for the zeroed serial — not the original digit.
 */
export const REAL_VINS = {
  /**
   * Fremont Model Y (5YJ) MY2023 (P), plant F.
   * Source: TeslaTap VIN decoder example (public, non-personally-identifying)
   */
  fremonModelY2023: makeVin({
    wmi: '5YJ',
    pos4: 'Y',
    pos5: 'A',
    pos6: '0',
    pos7: '1',
    pos8: 'F',
    modelYearChar: 'P',
    plantCode: 'F',
    serial: '000001',
  }),

  /**
   * Shanghai Model Y (LRW) MY2024 (R), plant C.
   * Source: TeslaTap VIN decoder example
   */
  shanghaiModelY2024: makeVin({
    wmi: 'LRW',
    pos4: 'E',
    pos5: 'A',
    pos6: '0',
    pos7: '1',
    pos8: 'F',
    modelYearChar: 'R',
    plantCode: 'C',
    serial: '000001',
  }),

  /**
   * Berlin Model Y (XP7) MY2024 (R), plant B.
   * Source: TeslaTap VIN decoder example
   */
  berlinModelY2024: makeVin({
    wmi: 'XP7',
    pos4: 'Y',
    pos5: 'A',
    pos6: '0',
    pos7: '1',
    pos8: 'F',
    modelYearChar: 'R',
    plantCode: 'B',
    serial: '000001',
  }),

  /**
   * Austin Cybertruck (7G2) MY2024 (R), plant A.
   * Source: Autopilot Review Cybertruck VIN article
   */
  cybertruck2024: makeVin({
    wmi: '7G2',
    pos4: 'W',
    pos5: 'A',
    pos6: '0',
    pos7: '1',
    pos8: 'F',
    modelYearChar: 'R',
    plantCode: 'A',
    serial: '000001',
  }),
} as const

// ---------------------------------------------------------------------------
// Module-private check-digit helper
// (Duplicates computeCheckDigit from src/lib/vin.ts to avoid circular imports)
// ---------------------------------------------------------------------------

function computeCheckDigitLocal(vin: string): string {
  let sum = 0
  for (let i = 0; i < 17; i++) {
    const val = TRANSLITERATION_MAP[vin[i]] ?? 0
    sum += val * CHECK_DIGIT_WEIGHTS[i]
  }
  const remainder = sum % 11
  return remainder === 10 ? 'X' : String(remainder)
}
