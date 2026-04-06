import { drizzle } from 'drizzle-orm/neon-http'
import { getDb } from '@/lib/db/client'
import { emailCollections } from '@/lib/db/schema'

export async function insertEmailCollection(params: {
  ideaId: string
  email: string
}): Promise<void> {
  const db = drizzle(getDb())
  await db.insert(emailCollections).values(params).onConflictDoNothing()
}
