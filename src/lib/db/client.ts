import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Please configure it in .env.local or Vercel environment variables.')
}

export const sql = neon(process.env.DATABASE_URL)
