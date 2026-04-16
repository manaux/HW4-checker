/**
 * VIN validation and decoding utilities for HW4 Checker.
 *
 * Public surface:
 *   normalizeVinInput   — uppercase + strip all whitespace/dashes
 *   stripVinSeparators  — strip spaces/dashes only (no uppercase)
 *   filterInvalidChars  — remove I, O, Q
 *   computeCheckDigit   — ISO 3779 check-digit computation
 *   validateVin         — full validation pipeline → ValidationResult
 *   parseVin            — field extraction → ParsedVin (precondition: validateVin passed)
 *
 * All functions are pure (no side effects, no network, no DOM).
 */

import type {
  ParsedVin,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from '../types/index'
import {
  TESLA_WMIS,
  MODEL_YEAR_MAP,
  PLANT_CODE_MAP,
  WMI_TO_MARKET,
  WMI_TO_DEFAULT_MODEL,
  WMI_POS4_MODEL_MAP,
  TRANSLITERATION_MAP,
  CHECK_DIGIT_WEIGHTS,
  POS_WMI_END,
  POS_CHECK_DIGIT,
  POS_MODEL_YEAR,
  POS_PLANT,
  POS_SERIAL_START,
  POS_SERIAL_END,
  POS_MODEL_CODE,
} from '../data/vinMeta'

// ---------------------------------------------------------------------------
// Input transform helpers (consumed by Phase 3 <VinInput />)
// ---------------------------------------------------------------------------

/**
 * Removes all whitespace and dashes, then uppercases the result.
 * Used internally by validateVin and directly by Phase 3 input onChange.
 *
 * @example normalizeVinInput('5yj 3e1ea-4pf') → '5YJ3E1EA4PF'
 */
export function normalizeVinInput(raw: string): string {
  return raw.replace(/[\s-]/g, '').toUpperCase()
}

/**
 * Strips spaces and dashes only — does NOT uppercase.
 * Used by Phase 3 paste handler before length checks.
 *
 * @example stripVinSeparators('5YJ 3E1-EA4PF') → '5YJ3E1EA4PF'
 */
export function stripVinSeparators(raw: string): string {
  return raw.replace(/[\s-]/g, '')
}

/**
 * Returns the input with the characters I, O, and Q removed.
 * Used by Phase 3 keypress handler to block invalid chars at entry.
 * ISO 3779 explicitly excludes I, O, Q from the VIN alphabet.
 *
 * @example filterInvalidChars('5YJ3IOQ1EA4') → '5YJ31EA4'
 */
export function filterInvalidChars(raw: string): string {
  return raw.replace(/[IOQ]/gi, '')
}

// ---------------------------------------------------------------------------
// ISO 3779 check-digit algorithm
// ---------------------------------------------------------------------------

/**
 * Computes the expected ISO 3779 check character for a 17-character VIN string.
 *
 * The check digit is position 9 (index 8). Its weight is 0, so the character
 * currently at position 8 does not affect the result — any placeholder is valid.
 *
 * Algorithm:
 *   1. Transliterate each character via TRANSLITERATION_MAP.
 *   2. Multiply each value by CHECK_DIGIT_WEIGHTS[i].
 *   3. Sum all 17 products.
 *   4. remainder = sum % 11
 *   5. If remainder === 10 → return 'X'; else return String(remainder).
 *
 * @param vin 17-character string (uppercase, no I/O/Q). Behavior undefined otherwise.
 * @returns The single-character check digit ('0'–'9' or 'X').
 */
export function computeCheckDigit(vin: string): string {
  let sum = 0
  for (let i = 0; i < 17; i++) {
    const val = TRANSLITERATION_MAP[vin[i]] ?? 0
    sum += val * CHECK_DIGIT_WEIGHTS[i]
  }
  const remainder = sum % 11
  return remainder === 10 ? 'X' : String(remainder)
}

// ---------------------------------------------------------------------------
// Validation pipeline
// ---------------------------------------------------------------------------

/**
 * Validates a raw VIN string (user input — may be mixed case, may contain separators).
 *
 * Processing order:
 *   1. Normalize (uppercase, strip whitespace and dashes).
 *   2. Check length — must be exactly 17. If wrong, stop here (further checks are meaningless).
 *   3. Check for invalid characters I, O, Q.
 *   4. Check WMI (first 3 chars) against known Tesla WMIs.
 *   5. Compute check digit — mismatch is a WARNING, not an error.
 *
 * Steps 3 and 4 are both checked even if one fails (errors aggregated).
 * If any hard error is found, returns ok: false.
 * If no hard error, returns ok: true with the normalized VIN and any warnings.
 *
 * @example validateVin('5yj3e1ea4pf789500') → { ok: true, vin: '5YJ3E1EA4PF789500' }
 * @example validateVin('ABC12345678901234') → { ok: false, errors: [{ code: 'NOT_TESLA_WMI', ... }] }
 */
export function validateVin(raw: string): ValidationResult {
  const vin = normalizeVinInput(raw)
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Step 1: Length check (hard stop — skip remaining checks if wrong length)
  if (vin.length !== 17) {
    return {
      ok: false,
      errors: [
        {
          code: 'LENGTH',
          message: 'VIN must be exactly 17 characters.',
          actualLength: vin.length,
        },
      ],
    }
  }

  // Step 2: Invalid character check (I, O, Q)
  const invalidChars = [...new Set(vin.split('').filter((c) => /[IOQ]/.test(c)))]
  if (invalidChars.length > 0) {
    errors.push({
      code: 'INVALID_CHAR',
      message: 'VINs cannot contain I, O, or Q. Did you mean 1, 0, or 0?',
      chars: invalidChars,
    })
  }

  // Step 3: Tesla WMI check
  const wmi = vin.slice(0, POS_WMI_END) as string
  const isTeslaWmi = (TESLA_WMIS as readonly string[]).includes(wmi)
  if (!isTeslaWmi) {
    errors.push({
      code: 'NOT_TESLA_WMI',
      message:
        "This doesn't look like a Tesla VIN. Tesla VINs start with 5YJ, 7SA, LRW, XP7, SFZ, or 7G2.",
      foundWMI: wmi,
    })
  }

  // Return hard errors (steps 2+3 may both contribute)
  if (errors.length > 0) {
    return { ok: false, errors }
  }

  // Step 4: Check-digit verification (soft warning)
  const actualCheckChar = vin[POS_CHECK_DIGIT]
  const expectedCheckChar = computeCheckDigit(vin)
  if (actualCheckChar !== expectedCheckChar) {
    warnings.push({
      code: 'CHECK_DIGIT',
      message: "The check digit doesn't match — there might be a typo in your VIN.",
      expected: expectedCheckChar,
      actual: actualCheckChar,
    })
  }

  return warnings.length > 0 ? { ok: true, vin, warnings } : { ok: true, vin }
}

// ---------------------------------------------------------------------------
// VIN field extraction
// ---------------------------------------------------------------------------

/**
 * Extracts all structured fields from a valid Tesla VIN.
 *
 * PRECONDITION: Caller must have called validateVin(raw) and received ok: true.
 * This function assumes vin is 17 characters, uppercased, no I/O/Q, valid Tesla WMI.
 * Behavior on invalid input is undefined.
 *
 * Model decode: uses (WMI, position-4) lookup via WMI_POS4_MODEL_MAP for accurate
 * model discrimination (Model S/X/3/Y within shared WMIs). Falls back to
 * WMI_TO_DEFAULT_MODEL if the position-4 code is unrecognized.
 *
 * @param vin 17-character normalized VIN (from validateVin result).
 * @returns ParsedVin with all decoded fields.
 */
export function parseVin(vin: string): ParsedVin {
  const wmi = vin.slice(0, POS_WMI_END) as keyof typeof WMI_TO_DEFAULT_MODEL
  const modelYearChar = vin[POS_MODEL_YEAR]
  const plantCode = vin[POS_PLANT]
  const serial = vin.slice(POS_SERIAL_START, POS_SERIAL_END)

  // Position-4 model decode with WMI-default fallback
  const pos4 = vin[POS_MODEL_CODE]
  const pos4Map = WMI_POS4_MODEL_MAP[wmi]
  const model = pos4Map?.[pos4] ?? WMI_TO_DEFAULT_MODEL[wmi]
  const modelYear = MODEL_YEAR_MAP[modelYearChar] ?? 0
  const market = WMI_TO_MARKET[wmi]
  const plant = PLANT_CODE_MAP[plantCode] ?? plantCode // fallback: raw code if unmapped

  // Trim from position 8 (0-indexed 7) — motor/trim variant
  // Only a handful of codes are documented; return undefined for unrecognized codes
  const trimCode = vin[7]
  const trim = decodeTrim(trimCode)

  return { vin, model, modelYear, market, plant, plantCode, trim, serial }
}

/**
 * Decodes VIN position 8 (0-indexed 7) to a trim/variant string.
 * Source: TeslaTap community decoder (MEDIUM confidence).
 * Returns undefined for unrecognized codes.
 */
function decodeTrim(code: string): string | undefined {
  const TRIM_MAP: Record<string, string> = {
    E: 'Standard Range',
    F: 'Long Range',
    G: 'Long Range AWD',
    P: 'Performance',
    // Cybertruck codes are unknown; WMI fast-path doesn't use trim
  }
  return TRIM_MAP[code]
}
