import { drizzle } from 'drizzle-orm/neon-http'
import { getDb } from '@/lib/db/client'
import { events } from '@/lib/db/schema'
import type { EventType } from '@/lib/db/schema'

export async function insertEvent(params: {
  ideaId: string
  eventType: EventType
  metadata?: Record<string, unknown>
}): Promise<void> {
  const db = drizzle(getDb())
  await db.insert(events).values({
    ideaId: params.ideaId,
    eventType: params.eventType,
    metadata: params.metadata,
  })
}
