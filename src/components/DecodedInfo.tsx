/**
 * DecodedInfo — displays the six fields decoded from a valid Tesla VIN in a
 * responsive grid (2 columns on mobile, 3 columns on medium+ screens).
 */
import type { ParsedVin } from '../types/index'

interface DecodedInfoProps {
  parsed: ParsedVin
}

/** Maps TeslaModel identifier to human-readable display name. */
export function modelDisplayName(model: ParsedVin['model']): string {
  const names: Record<ParsedVin['model'], string> = {
    S: 'Model S',
    '3': 'Model 3',
    X: 'Model X',
    Y: 'Model Y',
    Cybertruck: 'Cybertruck',
  }
  return names[model]
}

interface FieldProps {
  label: string
  value: string
  mono?: boolean
}

function Field({ label, value, mono = false }: FieldProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-(--color-text-secondary)">
        {label}
      </span>
      <span
        className={`text-sm text-(--color-text-primary) ${mono ? 'font-mono tabular-nums' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}

export default function DecodedInfo({ parsed }: DecodedInfoProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Field label="Model" value={modelDisplayName(parsed.model)} />
        <Field label="Year" value={String(parsed.modelYear)} />
        <Field label="Market" value={parsed.market} />
        <Field label="Plant" value={parsed.plant} />
        <Field label="Trim" value={parsed.trim ?? '—'} />
        <Field label="Serial" value={parsed.serial} mono />
      </div>
    </div>
  )
}
