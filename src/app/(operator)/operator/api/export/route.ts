import { NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/neon-http'
import { getDb } from '@/lib/db/client'
import {
  ideas as ideasTable,
  events as eventsTable,
  emailCollections as emailCollectionsTable,
  llmCalls as llmCallsTable,
} from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = drizzle(getDb())
    const [ideas, events, emails, llmCalls] = await Promise.all([
      db.select().from(ideasTable),
      db.select().from(eventsTable),
      db.select().from(emailCollectionsTable),
      db.select().from(llmCallsTable),
    ])

    return NextResponse.json({
      ideas,
      events,
      email_collections: emails,
      llm_calls: llmCalls,
      exported_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Export failed:', err)
    return NextResponse.json(
      { error: 'Export failed', code: 'EXPORT_ERROR' },
      { status: 500 }
    )
  }
}
