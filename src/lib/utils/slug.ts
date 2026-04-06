/**
 * Generates a short, URL-safe slug using the built-in crypto module.
 * Returns 8 hex characters — e.g. "a3f8c21b".
 * No external dependencies required.
 */
export function generateSlug(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8)
}
