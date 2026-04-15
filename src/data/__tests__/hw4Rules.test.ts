import { describe, it, expect } from 'vitest'
import hw4RulesRaw from '../hw4Rules.json'
import type { HW4RulesFile, CutoffRule } from '../../types/index'

const hw4Rules = hw4RulesRaw as HW4RulesFile

describe('hw4Rules.json schema', () => {
  it('has a _sources object with expected source IDs', () => {
    const expectedSourceIds = [
      'nhtsa-vpic',
      'iso-3779',
      'teslatap',
      'tmc-hw4-thread',
      'electrive-highland',
      'autopilotreview-hw4',
      'tmc-berlin-hw3-2024',
      'drive-tesla-7sa',
      'dirty-tesla-serials',
      'tesla-china-feb2024',
    ]
    for (const id of expectedSourceIds) {
      expect(hw4Rules._sources).toHaveProperty(id)
      expect(hw4Rules._sources[id]).toHaveProperty('url')
      expect(hw4Rules._sources[id]).toHaveProperty('title')
      expect(hw4Rules._sources[id]).toHaveProperty('accessedDate')
    }
  })

  it('has at least 50 rules', () => {
    expect(hw4Rules.rules.length).toBeGreaterThanOrEqual(50)
  })

  it('every rule has required fields with correct types', () => {
    const validVerdicts = new Set(['yes', 'no', 'maybe'])
    const validConfidences = new Set(['high', 'medium', 'low'])
    const validModels = new Set(['S', '3', 'X', 'Y', 'Cybertruck'])

    for (const rule of hw4Rules.rules) {
      const r = rule as CutoffRule

      // Required string fields
      expect(typeof r.model).toBe('string')
      expect(validModels.has(r.model)).toBe(true)

      expect(typeof r.plant).toBe('string')
      expect(r.plant.length).toBeGreaterThan(0)

      expect(typeof r.modelYear).toBe('number')
      // modelYear is either 0 (pre-2020 sentinel) or a valid 4-digit year
      expect(r.modelYear === 0 || (r.modelYear >= 2020 && r.modelYear <= 2030)).toBe(true)

      expect(typeof r.verdict).toBe('string')
      expect(validVerdicts.has(r.verdict)).toBe(true)

      expect(typeof r.source).toBe('string')
      expect(r.source.length).toBeGreaterThan(0)

      expect(typeof r.confidence).toBe('string')
      expect(validConfidences.has(r.confidence)).toBe(true)

      // Optional serialRange: if present, min/max must be numbers
      if (r.serialRange !== undefined) {
        if (r.serialRange.min !== undefined) {
          expect(typeof r.serialRange.min).toBe('number')
        }
        if (r.serialRange.max !== undefined) {
          expect(typeof r.serialRange.max).toBe('number')
        }
      }
    }
  })

  it('every rule source ID resolves in _sources', () => {
    for (const rule of hw4Rules.rules) {
      expect(hw4Rules._sources).toHaveProperty(rule.source)
    }
  })

  it('every confidence value is high | medium | low', () => {
    const validConfidences = new Set(['high', 'medium', 'low'])
    for (const rule of hw4Rules.rules) {
      expect(validConfidences.has(rule.confidence)).toBe(true)
    }
  })

  it('has a Cybertruck rule with verdict yes', () => {
    const cybertruckRules = hw4Rules.rules.filter((r) => r.model === 'Cybertruck')
    expect(cybertruckRules.length).toBeGreaterThan(0)
    expect(cybertruckRules.every((r) => r.verdict === 'yes')).toBe(true)
  })

  it('has a Berlin MY2024 Model Y rule with verdict maybe', () => {
    const berlinMy2024 = hw4Rules.rules.find(
      (r) => r.model === 'Y' && r.plant === 'Berlin' && r.modelYear === 2024,
    )
    expect(berlinMy2024).toBeDefined()
    expect(berlinMy2024?.verdict).toBe('maybe')
  })

  it('has a pre-2020 catch-all rule with verdict no and modelYear 0', () => {
    const pre2020Rules = hw4Rules.rules.filter((r) => r.modelYear === 0)
    expect(pre2020Rules.length).toBeGreaterThan(0)
    expect(pre2020Rules.every((r) => r.verdict === 'no')).toBe(true)
    expect(pre2020Rules.every((r) => r.plant === '__pre2020__')).toBe(true)
  })
})
