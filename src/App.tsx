import hw4Rules from './data/hw4Rules.json'
import type { HW4RulesFile } from './types/index'

const rules = (hw4Rules as HW4RulesFile).rules

/**
 * App — bare shell for Phase 1.
 *
 * No state, no handlers, no hooks. Renders:
 *   - Title + subtitle
 *   - Placeholder input region (non-functional)
 *   - Placeholder result region (empty)
 *   - Three trust-building info blocks
 *
 * Phase 2 wires the input and decode logic.
 * Phase 3 replaces placeholder regions with real components.
 *
 * The `rules` import is referenced here only to satisfy the TypeScript
 * compiler's "unused import" rules while the shell has no logic.
 * It will be used by Phase 2 via the decode module.
 */
void rules // suppress unused-variable lint warning in Phase 1 shell

export default function App() {
  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text-primary) flex flex-col items-center px-4 py-12">
      <main className="w-full max-w-lg flex flex-col gap-10">
        {/* Header */}
        <header className="flex flex-col gap-1 text-center">
          <h1 className="text-3xl font-bold tracking-tight">HW4 Checker</h1>
          <p className="text-(--color-text-secondary) text-base">Tesla VIN hardware checker</p>
        </header>

        {/* Placeholder input region */}
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
            disabled
            placeholder="Paste your 17-character VIN here"
            aria-disabled="true"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base font-mono text-(--color-text-primary) placeholder:text-(--color-text-secondary) focus:outline-none cursor-not-allowed opacity-60"
          />
          <p className="text-xs text-(--color-text-secondary)">Input coming in Phase 2</p>
        </section>

        {/* Placeholder result region */}
        <section
          aria-label="HW4 verdict"
          aria-live="polite"
          className="min-h-16 rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-center"
        >
          <p className="text-sm text-(--color-text-secondary)">Verdict will appear here</p>
        </section>

        {/* Info blocks */}
        <div className="flex flex-col gap-6 border-t border-white/10 pt-8">
          <section aria-labelledby="why-hw4-heading">
            <h2
              id="why-hw4-heading"
              className="text-sm font-semibold uppercase tracking-wide text-(--color-text-secondary) mb-2"
            >
              Why HW4 matters
            </h2>
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              Hardware 4 is Tesla&apos;s latest autopilot compute platform. Whether your car has HW4
              or the older HW3 affects which Autopilot and Full Self-Driving features are available
              now and in the future. This tool tells you which hardware your VIN was manufactured
              with.
            </p>
          </section>

          <section aria-labelledby="privacy-heading">
            <h2
              id="privacy-heading"
              className="text-sm font-semibold uppercase tracking-wide text-(--color-text-secondary) mb-2"
            >
              Your privacy
            </h2>
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              Your VIN never leaves your browser. All decoding and verdict logic runs entirely
              locally using data bundled with this page — no network requests are made, and nothing
              is stored or transmitted to any server.
            </p>
          </section>

          <section aria-labelledby="disclaimer-heading">
            <h2
              id="disclaimer-heading"
              className="text-sm font-semibold uppercase tracking-wide text-(--color-text-secondary) mb-2"
            >
              About this data
            </h2>
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              HW4 cutoff data is based on public community research and is provided as-is. Near
              production boundaries the verdict may be &ldquo;Maybe&rdquo; — if the result matters
              (e.g. for a purchase decision) verify by checking{' '}
              <span className="text-(--color-text-primary)">
                Controls &gt; Software &gt; Additional Vehicle Information
              </span>{' '}
              in the car.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
