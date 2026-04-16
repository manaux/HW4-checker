/**
 * VinInput — controlled VIN text field with length counter, inline validation
 * display, and submit affordances (Enter key + Check VIN button).
 *
 * Stateless: all state lives in the parent <App />. This component only fires
 * callbacks; it never mutates its own value.
 */
import type { ValidationError, ValidationWarning } from '../types/index'
import { filterInvalidChars, normalizeVinInput } from '../lib/vin'

interface VinInputProps {
  value: string
  onChange: (raw: string) => void
  onSubmit: () => void
  validationError?: ValidationError
  validationWarning?: ValidationWarning
  disabled?: boolean
}

const VIN_LENGTH = 17

export default function VinInput({
  value,
  onChange,
  onSubmit,
  validationError,
  validationWarning,
  disabled = false,
}: VinInputProps) {
  const atLength = value.length === VIN_LENGTH

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Block I, O, Q as they are typed; keep uppercase
    onChange(filterInvalidChars(e.target.value.toUpperCase()))
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    // Strip spaces/dashes from pasted content and uppercase
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    onChange(normalizeVinInput(pasted))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !disabled) onSubmit()
  }

  const errorId = 'vin-error'
  const warningId = 'vin-warning'
  const describedBy = [validationError ? errorId : null, validationWarning ? warningId : null]
    .filter(Boolean)
    .join(' ')

  return (
    <section aria-label="VIN input" className="flex flex-col gap-3">
      <label
        htmlFor="vin-input"
        className="text-sm font-medium text-(--color-text-secondary) uppercase tracking-wide"
      >
        Vehicle Identification Number
      </label>

      <input
        id="vin-input"
        type="text"
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Paste your 17-character VIN here"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        maxLength={17}
        aria-invalid={!!validationError}
        aria-describedby={describedBy || undefined}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base font-mono text-(--color-text-primary) placeholder:text-(--color-text-secondary) focus:outline-none focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50"
      />

      {/* Length counter — always visible */}
      <p
        className={`text-xs tabular-nums ${
          atLength ? 'text-emerald-400' : 'text-(--color-text-secondary)'
        }`}
      >
        {value.length} / {VIN_LENGTH}
      </p>

      {/* Hard validation error */}
      {validationError && (
        <p id={errorId} role="alert" className="text-xs text-rose-400">
          {validationError.message}
        </p>
      )}

      {/* Soft check-digit warning */}
      {validationWarning && !validationError && (
        <p id={warningId} className="text-xs text-amber-400">
          {validationWarning.message}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={value.length === 0 || disabled}
        className="mt-1 self-start rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-(--color-text-primary) transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
      >
        Check VIN
      </button>
    </section>
  )
}
