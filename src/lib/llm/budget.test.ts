import { describe, it, expect } from 'vitest'
import { isBudgetExceeded } from './budget'

describe('isBudgetExceeded', () => {
  it('returns false when usage is under budget', () => {
    expect(isBudgetExceeded(30, 50, false)).toBe(false)
  })

  it('returns true when usage equals or exceeds budget', () => {
    expect(isBudgetExceeded(50, 50, false)).toBe(true)
    expect(isBudgetExceeded(60, 50, false)).toBe(true)
  })

  it('returns false when override is enabled regardless of usage', () => {
    expect(isBudgetExceeded(60, 50, true)).toBe(false)
    expect(isBudgetExceeded(1000, 50, true)).toBe(false)
  })
})
