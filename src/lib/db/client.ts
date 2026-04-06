import { neon } from '@neondatabase/serverless'
import type { NeonQueryFunction } from '@neondatabase/serverless'

export function getDb(): NeonQueryFunction<false, false> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Please configure it in .env.local or Vercel environment variables.'
    )
  }
  return neon(process.env.DATABASE_URL)
}
