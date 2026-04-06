import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

/**
 * Temporary DB connectivity check endpoint.
 * Returns `{ ok: true, result: 1 }` if DB is reachable.
 */
export async function GET() {
  try {
    const sql = getDb()
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
