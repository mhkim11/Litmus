import { drizzle } from 'drizzle-orm/neon-http'
import { desc, eq, inArray } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { ideas } from '@/lib/db/schema'
import type { Idea } from '@/lib/db/schema'
import type { LandingPageData } from '@/lib/schemas/landing'

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
    .orderBy(desc(ideas.updatedAt))
}

export async function updateDraft(
  id: string,
  fields: {
    finalPrompt?: string
    finalInstructions?: string
    finalPageData?: Record<string, unknown>
  }
): Promise<void> {
  const db = drizzle(getDb())
  await db
    .update(ideas)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(ideas.id, id))
}

export async function updateIdeaGeneration(
  id: string,
  finalPrompt: string,
  finalPageData: LandingPageData,
  finalInstructions?: string
): Promise<void> {
  const db = drizzle(getDb())
  await db
    .update(ideas)
    .set({
      finalPrompt,
      finalInstructions: finalInstructions ?? null,
      finalPageData: finalPageData as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .where(eq(ideas.id, id))
}

export async function getIdeaById(id: string): Promise<Idea | null> {
  const db = drizzle(getDb())
  const [row] = await db.select().from(ideas).where(eq(ideas.id, id))
  return row ?? null
}
