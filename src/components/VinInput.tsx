/**
 * VinInput — controlled VIN text field with inline clear button, Check VIN button
 * on the same row, length counter + error on one line, and submit affordances.
 *
 * Stateless: all state lives in the parent <App />.
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
    onChange(filterInvalidChars(e.target.value.toUpperCase()))
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
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
    <section aria-label="VIN input" className="flex flex-col gap-2">
      <label
        htmlFor="vin-input"
        className="text-sm font-medium text-(--color-text-secondary) uppercase tracking-wide"
      >
        Vehicle Identification Number
      </label>

      {/* Input row: input with clear button + Check VIN button on same line */}
      <div className="flex gap-2">
        <div className="relative flex-1">
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
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-9 text-base font-mono text-(--color-text-primary) placeholder:text-(--color-text-secondary) focus:outline-none focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          />

          {/* Clear button inside input */}
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Clear input"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={value.length === 0 || disabled}
          className="shrink-0 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-(--color-text-primary) transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
        >
          Check VIN
        </button>
      </div>

      {/* Counter + error/warning on one line */}
      <div className="flex items-center justify-between text-xs">
        <p
          className={`tabular-nums ${
            atLength ? 'text-emerald-400' : 'text-(--color-text-secondary)'
          }`}
        >
          {value.length} / {VIN_LENGTH}
        </p>

        {/* Validation error — right-aligned */}
        {validationError && (
          <p id={errorId} role="alert" className="text-rose-400 text-right">
            {validationError.message}
          </p>
        )}

        {/* Soft check-digit warning — right-aligned */}
        {validationWarning && !validationError && (
          <p id={warningId} className="text-amber-400 text-right">
            {validationWarning.message}
          </p>
        )}
      </div>
    </section>
  )
}
