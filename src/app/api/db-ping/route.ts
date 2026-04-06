import { NextResponse } from 'next/server'
import { sql } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

/**
 * Temporary DB connectivity check endpoint.
 *
 * TODO: Remove this route after Story 1.3 is complete (Drizzle ORM set up,
 * real DB schema in place, and other DB-dependent routes exist).
 *
 * Returns `{ ok: true, result: 1 }` if DB is reachable.
 */
export async function GET() {
  try {
    const rows = await sql`SELECT 1 as value`
    const value = rows[0]?.value
    return NextResponse.json({ ok: true, result: value })
  } catch (err) {
    console.error('DB ping failed:', err)
    return NextResponse.json(
      { ok: false, error: 'Database connection failed' },
      { status: 500 }
    )
  }
}
