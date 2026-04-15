/**
 * Tesla VIN metadata constants.
 *
 * VIN structure per ISO 3779:2009 + Tesla-specific assignments:
 *   Positions 1–3  (indices 0–2):  WMI — World Manufacturer Identifier
 *   Position  4    (index 3):      Model code (Tesla-specific)
 *   Position  5    (index 4):      Body/restraint category
 *   Position  7    (index 6):      Restraint system
 *   Position  8    (index 7):      Motor / trim variant
 *   Position  9    (index 8):      Check digit (ISO 3779 algorithm)
 *   Position  10   (index 9):      Model year character
 *   Position  11   (index 10):     Plant / assembly code
 *   Positions 12–17 (indices 11–16): Sequential serial number
 *
 * All position constants below use 0-based array indices.
 */

import type { Market, TeslaModel } from '../types/index'

// ---------------------------------------------------------------------------
// Position constants (0-indexed)
// ---------------------------------------------------------------------------

export const POS_WMI_START = 0
export const POS_WMI_END = 3 // exclusive — vin.slice(0, 3)
export const POS_MODEL_CODE = 3
export const POS_CHECK_DIGIT = 8
export const POS_MODEL_YEAR = 9
export const POS_PLANT = 10
export const POS_SERIAL_START = 11
export const POS_SERIAL_END = 17 // exclusive — vin.slice(11, 17)

// ---------------------------------------------------------------------------
// Known Tesla WMIs
// ---------------------------------------------------------------------------

/**
 * All six known Tesla WMIs.
 * Used for VALID-02 in Phase 2: reject VINs whose first 3 chars are not in this list.
 *
 * Sources:
 *   5YJ — NHTSA VPIC (HIGH): https://vpic.nhtsa.dot.gov/
 *   7SA — Drive Tesla Canada (HIGH): https://driveteslacanada.ca/news/tesla-updates-vin-manufacturer-code-7sa-model-x-y/
 *   LRW — NHTSA VPIC (HIGH): https://vpic.nhtsa.dot.gov/
 *   XP7 — TeslaTap community decoder (MEDIUM): https://teslatap.com/vin-decoder/
 *   SFZ — TeslaTap community decoder (MEDIUM): https://teslatap.com/vin-decoder/
 *   7G2 — Autopilot Review, Cybertruck launch (MEDIUM): https://www.autopilotreview.com/tesla-hardware-4-rolling-out-to-new-vehicles/
 */
export const TESLA_WMIS = ['5YJ', '7SA', 'LRW', 'XP7', 'SFZ', '7G2'] as const
export type TeslaWMI = (typeof TESLA_WMIS)[number]

// ---------------------------------------------------------------------------
// Model year map (VIN position 10, 0-indexed position 9)
// ---------------------------------------------------------------------------

/**
 * ISO 3779 model year character encoding.
 * Letters I, O, Q are excluded per the standard.
 * Only the years relevant to HW4 (2020–2026) are included here.
 * Phase 2 may extend if needed for historical VINs.
 *
 * Full cycle reference (for context):
 *   A=2010, B=2011, C=2012, D=2013, E=2014, F=2015, G=2016,
 *   H=2017, J=2018, K=2019, L=2020, M=2021, N=2022, P=2023,
 *   R=2024, S=2025, T=2026, V=2027, W=2028, X=2029, Y=2030,
 *   1=2031, ...
 */
export const MODEL_YEAR_MAP: Record<string, number> = {
  A: 2010,
  B: 2011,
  C: 2012,
  D: 2013,
  E: 2014,
  F: 2015,
  G: 2016,
  H: 2017,
  J: 2018,
  K: 2019,
  L: 2020,
  M: 2021,
  N: 2022,
  P: 2023,
  R: 2024,
  S: 2025,
  T: 2026,
}

// ---------------------------------------------------------------------------
// Plant code map (VIN position 11, 0-indexed position 10)
// ---------------------------------------------------------------------------

/**
 * Tesla plant codes derived from VIN position 11.
 *
 * Note on Berlin: 'B' is the dominant code in community data (TeslaTap, TMC).
 * Some older sources cite 'G' for Giga Berlin. Phase 2 should match against
 * both 'B' and 'G' for Berlin identification until confirmed via a primary source.
 *
 * Sources:
 *   F (Fremont) — NHTSA VPIC / TeslaTap (HIGH)
 *   C (Shanghai) — TeslaTap community decoder (MEDIUM)
 *   B (Berlin) — TeslaTap community decoder (MEDIUM); 'G' variant unconfirmed
 *   A (Austin) — TeslaTap community decoder (MEDIUM)
 */
export const PLANT_CODE_MAP: Record<string, string> = {
  F: 'Fremont',
  C: 'Shanghai',
  B: 'Berlin',
  G: 'Berlin', // legacy/alternative code — treat same as 'B'
  A: 'Austin',
}

// ---------------------------------------------------------------------------
// WMI → market
// ---------------------------------------------------------------------------

/**
 * Maps each Tesla WMI to its primary geographic market.
 * Used for DECODE-04 in Phase 2.
 */
export const WMI_TO_MARKET: Record<TeslaWMI, Market> = {
  '5YJ': 'US',
  '7SA': 'US',
  LRW: 'CN',
  XP7: 'EU',
  SFZ: 'EU',
  '7G2': 'US',
}

// ---------------------------------------------------------------------------
// WMI → default model
// ---------------------------------------------------------------------------

/**
 * Best-effort default model for each WMI.
 *
 * Tesla uses WMI + position 4 to distinguish models within the same WMI.
 * This map provides a fallback when position-4 decoding is not yet implemented.
 * Phase 2's parseVin() should decode position 4 for precise model identification.
 *
 * Known position-4 model codes (community-sourced via TeslaTap, MEDIUM confidence):
 *   5YJ WMI: E=Model S, 3=Model 3, 7=Model X (some years), Y=Model Y (some years)
 *   7SA WMI: X=Model X, Y=Model Y (introduced ~2021)
 *   LRW WMI: 3=Model 3, E=Model Y (varies by year)
 *   XP7 WMI: Y=Model Y (Giga Berlin)
 *   SFZ WMI: Y=Model Y (Giga Berlin variant)
 *   7G2 WMI: W=Cybertruck
 *
 * This is a simplified map; Phase 2 implements the full position-4 decode.
 */
export const WMI_TO_DEFAULT_MODEL: Record<TeslaWMI, TeslaModel> = {
  '5YJ': 'Y', // most common in 5YJ range 2020+; Phase 2 refines with pos-4
  '7SA': 'Y', // 7SA predominantly Model X/Y post-2021
  LRW: 'Y', // Shanghai; Phase 2 refines with pos-4
  XP7: 'Y', // Berlin Model Y
  SFZ: 'Y', // Berlin Model Y variant
  '7G2': 'Cybertruck', // Austin Cybertruck — unambiguous
}

// ---------------------------------------------------------------------------
// ISO 3779 check digit algorithm (position 9)
// ---------------------------------------------------------------------------

/**
 * Transliteration table: maps each VIN character to its numeric value.
 * Letters I, O, Q are excluded (never valid in a VIN).
 * Source: ISO 3779:2009, Annex C (HIGH confidence).
 *
 * Numeric characters map to themselves (0–9 → 0–9).
 * Alphabetic characters follow the ISO pattern:
 *   A=1, B=2, C=3, D=4, E=5, F=6, G=7, H=8
 *   J=1, K=2, L=3, M=4, N=5       P=7, R=9
 *   S=2, T=3, U=4, V=5, W=6, X=7, Y=8, Z=9
 */
export const TRANSLITERATION_MAP: Record<string, number> = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
}

/**
 * ISO 3779 position weights for the check digit calculation.
 * Indices 0–16 correspond to VIN positions 1–17.
 * Source: ISO 3779:2009, Annex C (HIGH confidence).
 *
 * Formula:
 *   sum = Σ ( TRANSLITERATION_MAP[vin[i]] * CHECK_DIGIT_WEIGHTS[i] )  for i in 0..16
 *   remainder = sum % 11
 *   checkChar = remainder === 10 ? 'X' : String(remainder)
 *   valid if vin[8] === checkChar
 */
export const CHECK_DIGIT_WEIGHTS: readonly number[] = [
  8,
  7,
  6,
  5,
  4,
  3,
  2,
  10, // positions 1–8
  0, // position 9 (check digit itself — weight 0)
  9,
  8,
  7,
  6,
  5,
  4,
  3,
  2, // positions 10–17
]
