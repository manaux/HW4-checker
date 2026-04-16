import { render, screen } from '@testing-library/react'
import Hw4Verdict from '../Hw4Verdict'
import type { Hw4Result, SourceMap } from '../../types/index'
import { _NO_MATCH_FALLBACK_RULE } from '../../lib/hw4'

// Minimal sources map for tests
const testSources: SourceMap = {
  'tmc-hw4-thread': {
    url: 'https://example.com',
    title: 'Test source',
    accessedDate: '2026-04-15',
  },
}

const yesResult: Hw4Result = {
  verdict: 'yes',
  matchedRule: {
    ...{ ..._NO_MATCH_FALLBACK_RULE },
    verdict: 'yes',
    source: 'tmc-hw4-thread',
    model: 'Cybertruck',
    confidence: 'high',
  },
  confidence: 'high',
  reasoning: 'Cybertruck is always HW4.',
  caveat: undefined,
}

const maybeResult: Hw4Result = {
  verdict: 'maybe',
  matchedRule: {
    ...{ ..._NO_MATCH_FALLBACK_RULE },
    verdict: 'maybe',
    source: 'tmc-hw4-thread',
    model: 'Y',
    confidence: 'medium',
  },
  confidence: 'medium',
  reasoning: 'Berlin MY2024 has mixed production.',
  caveat:
    'To check the actual hardware: in the car, tap **Controls → Software → Additional Vehicle Information**.',
}

describe('Hw4Verdict', () => {
  it('renders green "Definitely yes" badge for a yes verdict', () => {
    render(<Hw4Verdict result={yesResult} sources={testSources} />)
    expect(screen.getByText('Definitely yes')).toBeInTheDocument()
    expect(screen.queryByText(/retrofit/i)).not.toBeInTheDocument()
  })

  it('renders amber "Maybe" badge and software-screen caveat for a maybe verdict', () => {
    render(<Hw4Verdict result={maybeResult} sources={testSources} />)
    expect(screen.getByText(/Maybe/)).toBeInTheDocument()
    // Caveat text (partial match — bold markup rendered as text)
    expect(screen.getByText(/Controls/)).toBeInTheDocument()
  })
})
