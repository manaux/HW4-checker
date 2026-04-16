import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import VinInput from '../VinInput'

const defaultProps = {
  value: '',
  onChange: vi.fn(),
  onSubmit: vi.fn(),
  recentVins: [],
  onSelectRecent: vi.fn(),
}

describe('VinInput', () => {
  it('renders with empty value and shows 0/17 counter', () => {
    render(<VinInput {...defaultProps} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByText('0 / 17')).toBeInTheDocument()
  })

  it('filters I, O, Q characters on change', async () => {
    const onChange = vi.fn()
    render(<VinInput {...defaultProps} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'IOQ5YJ')
    // Each character fires onChange; the last call should have no I/O/Q
    const calls = onChange.mock.calls.map((c) => c[0] as string)
    expect(calls.every((v) => !/[IOQ]/.test(v))).toBe(true)
  })

  it('calls onSubmit when Enter is pressed', async () => {
    const onSubmit = vi.fn()
    render(<VinInput {...defaultProps} value="ABC" onSubmit={onSubmit} />)
    await userEvent.type(screen.getByRole('textbox'), '{Enter}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
