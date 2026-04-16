/**
 * App — root component and single source of state for HW4 Checker.
 *
 * All child components are stateless; they receive data via props and fire
 * callbacks to update state here. This is the canonical "lifting state up"
 * React pattern.
 *
 * State:
 *   inputValue       — raw string in the VIN input (pre-validation)
 *   validationResult — result of the last validateVin() call, or null
 *   parsed           — ParsedVin if last validation was ok, else null
 *   hw4Result        — Hw4Result if parsed is set, else null
 *   recentVins       — last 5 submitted length-17 VINs (persisted)
 */
import { useState, useEffect } from 'react'
import { validateVin } from './lib/vin'
import { parseVin } from './lib/vin'
import { determineHw4 } from './lib/hw4'
import hw4RulesRaw from './data/hw4Rules.json'
import type {
  HW4RulesFile,
  ValidationResult,
  ParsedVin,
  Hw4Result,
  RecentVinEntry,
} from './types/index'
import { useLocalStorage } from './hooks/useLocalStorage'
import VinInput from './components/VinInput'
import DecodedInfo from './components/DecodedInfo'
import Hw4Verdict from './components/Hw4Verdict'
import CarImage from './components/CarImage'
import { AnimatePresence, motion } from 'motion/react'

const hw4Rules = hw4RulesRaw as HW4RulesFile
const LS_KEY = 'hw4checker.recentVins'
const MAX_RECENT = 5

/** Upsert a new entry to the front of the recents list, dedup by VIN, cap at 5. */
function upsertRecent(prev: RecentVinEntry[], entry: RecentVinEntry): RecentVinEntry[] {
  const filtered = prev.filter((e) => e.vin !== entry.vin)
  return [entry, ...filtered].slice(0, MAX_RECENT)
}

export default function App() {
  const [inputValue, setInputValue] = useState('')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [parsed, setParsed] = useState<ParsedVin | null>(null)
  const [hw4Result, setHw4Result] = useState<Hw4Result | null>(null)
  const [recentVins, setRecentVins] = useLocalStorage<RecentVinEntry[]>(LS_KEY, [])

  /** Full decode pipeline — called by the Check button, Enter key, and chip clicks. */
  function handleSubmit(rawInput: string) {
    const result = validateVin(rawInput)
    setValidationResult(result)

    if (!result.ok) {
      setParsed(null)
      setHw4Result(null)
      // Record invalid length-17 submissions so the user can see them in recents
      if (rawInput.replace(/[\s-]/g, '').toUpperCase().length === 17) {
        setRecentVins(
          upsertRecent(recentVins, {
            vin: rawInput.toUpperCase(),
            status: 'invalid',
            timestamp: Date.now(),
          }),
        )
      }
      return
    }

    const p = parseVin(result.vin)
    const hw4 = determineHw4(p)
    setParsed(p)
    setHw4Result(hw4)

    // Persist to recents
    setRecentVins(
      upsertRecent(recentVins, {
        vin: result.vin,
        status: 'ok',
        model: p.model,
        verdict: hw4.verdict,
        timestamp: Date.now(),
      }),
    )

    // Update share URL without adding a browser history entry
    if (typeof window !== 'undefined') {
      history.replaceState(null, '', '?vin=' + result.vin)
    }
  }

  /** Called when the user clicks a recent-VIN chip. */
  function handleRecentSelect(vin: string) {
    setInputValue(vin)
    handleSubmit(vin)
  }

  // Effect: auto-submit if ?vin= is present in the URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const vinParam = params.get('vin')
    if (vinParam) {
      const normalized = vinParam.replace(/[\s-]/g, '').toUpperCase()
      setInputValue(normalized)
      handleSubmit(normalized)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // empty deps — runs once on mount only

  // Derive the first hard error and check-digit warning for VinInput
  const firstError =
    validationResult && !validationResult.ok ? validationResult.errors[0] : undefined
  const firstWarning =
    validationResult?.ok && validationResult.warnings ? validationResult.warnings[0] : undefined

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text-primary) flex flex-col items-center px-4 py-8 sm:py-12">
      <main className="w-full max-w-2xl flex flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col gap-1 text-center">
          <h1 className="text-3xl font-bold tracking-tight">HW4 Checker</h1>
          <p className="text-(--color-text-secondary) text-base">Tesla VIN hardware checker</p>
        </header>

        {/* VIN input + Check button */}
        <VinInput
          value={inputValue}
          onChange={(val) => {
            setInputValue(val)
            // Clear validation error as user types
            if (validationResult && !validationResult.ok) {
              setValidationResult(null)
            }
          }}
          onSubmit={() => handleSubmit(inputValue)}
          validationError={firstError}
          validationWarning={firstWarning}
          recentVins={recentVins}
          onSelectRecent={handleRecentSelect}
        />

        {/* Result region — only when we have a successful decode */}
        {hw4Result !== null && parsed !== null && (
          <AnimatePresence mode="sync">
            <motion.div
              key={parsed.vin}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <section aria-label="Decode result" className="flex flex-col gap-6">
                <Hw4Verdict result={hw4Result} sources={hw4Rules._sources} />
                <DecodedInfo parsed={parsed} />
                <CarImage
                  model={parsed.model}
                  modelYear={parsed.modelYear}
                  verdict={hw4Result.verdict}
                />
              </section>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Footer info blocks (kept from Phase 1 shell) */}
        <div className="flex flex-col gap-6 border-t border-white/10 pt-8">
          <section aria-labelledby="why-hw4-heading">
            <h2
              id="why-hw4-heading"
              className="text-sm font-semibold uppercase tracking-wide text-(--color-text-secondary) mb-2"
            >
              Why HW4 matters
            </h2>
            <p className="text-sm leading-relaxed text-(--color-text-primary)">
              Hardware 4 is Tesla&apos;s latest autopilot compute platform. Whether your car has HW4
              or the older HW3 affects which Autopilot and Full Self-Driving features are available
              now and in the future. This tool tells you which hardware your VIN was manufactured
              with.
            </p>
          </section>

          <section aria-labelledby="disclaimer-heading">
            <h2
              id="disclaimer-heading"
              className="text-sm font-semibold uppercase tracking-wide text-(--color-text-secondary) mb-2"
            >
              About this data
            </h2>
            <p className="text-sm leading-relaxed text-(--color-text-primary)">
              HW4 cutoff data is based on public community research and is provided as-is. Near
              production boundaries the verdict may be &ldquo;Maybe&rdquo; — if the result matters
              (e.g. for a purchase decision) verify by checking{' '}
              <span className="text-(--color-accent)">
                Controls &gt; Software &gt; Additional Vehicle Information
              </span>{' '}
              in the car.
            </p>
          </section>

          <section aria-labelledby="privacy-heading">
            <h2
              id="privacy-heading"
              className="text-sm font-semibold uppercase tracking-wide text-(--color-text-secondary) mb-2"
            >
              Your privacy
            </h2>
            <p className="text-sm leading-relaxed text-(--color-text-primary)">
              Your VIN never leaves your browser. All decoding and verdict logic runs entirely
              locally using data bundled with this page — no network requests are made, and nothing
              is stored or transmitted to any server.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
