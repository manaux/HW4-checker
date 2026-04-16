/**
 * VinInput — controlled VIN text field with inline clear button, Check VIN button,
 * length counter + error display, and a recent-VINs dropdown that appears on focus
 * when the input is empty (like search suggestions).
 */
import { useState, useRef, useEffect } from 'react'
import type { ValidationError, ValidationWarning, RecentVinEntry, Hw4Verdict } from '../types/index'
import { filterInvalidChars, normalizeVinInput } from '../lib/vin'
import { modelDisplayName } from './CarImage'

interface VinInputProps {
  value: string
  onChange: (raw: string) => void
  onSubmit: () => void
  validationError?: ValidationError
  validationWarning?: ValidationWarning
  recentVins: RecentVinEntry[]
  onSelectRecent: (vin: string) => void
  disabled?: boolean
}

const VIN_LENGTH = 17

function verdictLabel(verdict: Hw4Verdict): { text: string; className: string } {
  switch (verdict) {
    case 'yes':
      return { text: 'HW4', className: 'text-emerald-400' }
    case 'no':
      return { text: 'Not HW4', className: 'text-rose-400' }
    case 'maybe':
      return { text: 'Maybe', className: 'text-amber-400' }
  }
}

export default function VinInput({
  value,
  onChange,
  onSubmit,
  validationError,
  validationWarning,
  recentVins,
  onSelectRecent,
  disabled = false,
}: VinInputProps) {
  const atLength = value.length === VIN_LENGTH
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const showDropdown = isFocused && value.length === 0 && recentVins.length > 0

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

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

  function handleSelectRecent(vin: string) {
    setIsFocused(false)
    onSelectRecent(vin)
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
      <div className="flex gap-2" ref={containerRef}>
        <div className="relative flex-1">
          <input
            id="vin-input"
            type="text"
            value={value}
            onChange={handleChange}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
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

          {/* Recent VINs dropdown — appears on focus when input is empty */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1 z-10 rounded-lg border border-white/10 bg-neutral-900 shadow-lg overflow-hidden">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-(--color-text-secondary) border-b border-white/5">
                Recent
              </div>
              {recentVins.map((entry) => (
                <button
                  key={entry.vin}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault() // prevent blur before click registers
                    handleSelectRecent(entry.vin)
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                >
                  <span className="font-mono text-(--color-text-primary) text-xs">{entry.vin}</span>
                  <span className="flex items-center gap-2 text-xs">
                    {entry.status === 'ok' && entry.model && entry.verdict ? (
                      <>
                        <span className="text-(--color-text-secondary)">
                          {modelDisplayName(entry.model)}
                        </span>
                        <span className={verdictLabel(entry.verdict).className}>
                          {verdictLabel(entry.verdict).text}
                        </span>
                      </>
                    ) : (
                      <span className="text-(--color-text-secondary) opacity-50 italic">
                        invalid
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
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

        {validationError && (
          <p id={errorId} role="alert" className="text-rose-400 text-right">
            {validationError.message}
          </p>
        )}

        {validationWarning && !validationError && (
          <p id={warningId} className="text-amber-400 text-right">
            {validationWarning.message}
          </p>
        )}
      </div>
    </section>
  )
}
