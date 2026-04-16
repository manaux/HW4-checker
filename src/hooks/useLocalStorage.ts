/**
 * useLocalStorage — generic hook for reading and writing a JSON-serializable
 * value to localStorage. Gracefully handles Safari Private Mode write errors
 * and JSON parse failures by falling back to the initial value.
 *
 * Usage:
 *   const [recentVins, setRecentVins] = useLocalStorage<RecentVinEntry[]>(
 *     'hw4checker.recentVins', []
 *   )
 *
 * Trade-off: one extra file vs. inlining the same try/catch in App.tsx.
 * Extracted here because (a) it is a classic React pattern worth illustrating,
 * and (b) it keeps App.tsx focused on orchestration, not storage concerns.
 */
import { useState } from 'react'

export function useLocalStorage<T>(key: string, initial: T): [T, (val: T) => void] {
  const [stored, setStored] = useState<T>(() => {
    // Read on first render only — avoids re-reading on every render cycle
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      // JSON parse error or localStorage unavailable (Safari Private Mode)
      return initial
    }
  })

  function setValue(val: T) {
    setStored(val)
    try {
      localStorage.setItem(key, JSON.stringify(val))
    } catch {
      // Safari Private Mode rejects writes — silently ignore
    }
  }

  return [stored, setValue]
}
