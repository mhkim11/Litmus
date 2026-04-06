export function isBudgetExceeded(
  currentMonthUsage: number,
  maxBudget: number,
  overrideEnabled: boolean
): boolean {
  if (overrideEnabled) return false
  return currentMonthUsage >= maxBudget
}
