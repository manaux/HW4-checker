/**
 * App integration smoke tests.
 *
 * Three cases:
 *   1. Renders without crashing — input and Check VIN button present
 *   2. Valid Cybertruck VIN → shows "Definitely yes"
 *   3. Auto-decodes from ?vin= URL param on mount
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { makeVin } from './test/fixtures'

// Cybertruck VIN: WMI 7G2, Austin plant (A), MY2024 (R).
// makeVin computes the correct check digit — result is always "Definitely yes".
const CYBERTRUCK_VIN = makeVin({
  wmi: '7G2',
  pos4: 'W',
  pos5: 'A',
  pos6: '0',
  pos7: '1',
  pos8: 'F',
  modelYearChar: 'R',
  plantCode: 'A',
  serial: '000001',
})

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage between tests to avoid chip leakage
    localStorage.clear()
    // Reset URL to bare path
    history.replaceState(null, '', '/')
  })

  it('renders without crashing and shows the input', () => {
    render(<App />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /check vin/i })).toBeInTheDocument()
  })

  it('typing a valid Cybertruck VIN and clicking Check shows "Definitely yes"', async () => {
    render(<App />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, CYBERTRUCK_VIN)
    await userEvent.click(screen.getByRole('button', { name: /check vin/i }))
    expect(await screen.findByText('Definitely yes')).toBeInTheDocument()
  })

  it('auto-decodes a valid VIN from the ?vin= URL parameter on mount', async () => {
    history.replaceState(null, '', `?vin=${CYBERTRUCK_VIN}`)
    render(<App />)
    expect(await screen.findByText('Definitely yes')).toBeInTheDocument()
  })
})
