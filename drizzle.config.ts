import type { Config } from 'drizzle-kit'

if (!process.env.DATABASE_URL) {
  // Load .env.local manually since drizzle-kit doesn't auto-load Next.js env files
  // This only matters when running drizzle-kit commands from CLI.
  const fs = require('node:fs')
  const path = require('node:path')
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8') as string
    for (const line of envContent.split('\n')) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
      if (match) {
        const [, key, value] = match
        if (!process.env[key]) {
          process.env[key] = value.trim().replace(/^["'](.*)["']$/, '$1')
        }
      }
    }
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Please configure it in .env.local.')
}

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
} satisfies Config
