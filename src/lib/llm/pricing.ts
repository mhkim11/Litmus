// Anthropic 공개 단가 (2025년 기준)
// 출처: https://www.anthropic.com/pricing
// 단위: USD per token

const PRICING: Record<string, { inputPerToken: number; outputPerToken: number }> = {
  'claude-sonnet-4-6': {
    inputPerToken: 3.0 / 1_000_000, // $3.00 per 1M input tokens
    outputPerToken: 15.0 / 1_000_000, // $15.00 per 1M output tokens
  },
  'claude-opus-4-6': {
    inputPerToken: 15.0 / 1_000_000,
    outputPerToken: 75.0 / 1_000_000,
  },
  'claude-haiku-4-5': {
    inputPerToken: 0.8 / 1_000_000,
    outputPerToken: 4.0 / 1_000_000,
  },
}

const DEFAULT_PRICING = PRICING['claude-sonnet-4-6']

export function calcCostUsd(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const price = PRICING[model] ?? DEFAULT_PRICING
  return price.inputPerToken * promptTokens + price.outputPerToken * completionTokens
}
