import { drizzle } from 'drizzle-orm/neon-http'
import { eq, inArray } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { ideas } from '@/lib/db/schema'
import type { Idea } from '@/lib/db/schema'

export async function createDraftIdea(): Promise<{
  id: string
  status: 'draft'
  createdAt: string
}> {
  const db = drizzle(getDb())
  const [row] = await db
    .insert(ideas)
    .values({ status: 'draft' })
    .returning({ id: ideas.id, status: ideas.status, createdAt: ideas.createdAt })
  return {
    id: row.id,
    status: 'draft',
    createdAt: row.createdAt.toISOString(),
  }
}

export async function getActiveAndDraftIdeas(): Promise<Idea[]> {
  const db = drizzle(getDb())
  return db
    .select()
    .from(ideas)
    .where(inArray(ideas.status, ['draft', 'active']))
    .orderBy(ideas.updatedAt) // Story 2.9에서 DESC로 확장
}

export async function getIdeaById(id: string): Promise<Idea | null> {
  const db = drizzle(getDb())
  const [row] = await db.select().from(ideas).where(eq(ideas.id, id))
  return row ?? null
}
