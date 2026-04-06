import { drizzle } from 'drizzle-orm/neon-http'
import { and, desc, eq, inArray, sql, asc } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { ideas, events } from '@/lib/db/schema'
import type { Idea } from '@/lib/db/schema'
import type { LandingPageData } from '@/lib/schemas/landing'

export type SortBy = 'pv' | 'ctaClicks' | 'emails' | 'updatedAt'
export type SortOrder = 'asc' | 'desc'

export interface IdeaWithMetrics {
  id: string
  slug: string | null
  finalPrompt: string | null
  finalPageData: Record<string, unknown> | null
  status: 'draft' | 'active' | 'archived'
  publishedAt: Date | null
  updatedAt: Date
  pv: number
  ctaClicks: number
  emails: number
}

export async function getIdeasWithMetrics(
  sortBy: SortBy = 'updatedAt',
  order: SortOrder = 'desc'
): Promise<IdeaWithMetrics[]> {
  const db = drizzle(getDb())
  const pvCol = sql<number>`COUNT(*) FILTER (WHERE ${events.eventType} = 'page_view')`
  const ctaCol = sql<number>`COUNT(*) FILTER (WHERE ${events.eventType} = 'cta_click')`
  const emailCol = sql<number>`COUNT(*) FILTER (WHERE ${events.eventType} = 'email_submit')`

  const sortMap = {
    pv: pvCol,
    ctaClicks: ctaCol,
    emails: emailCol,
    updatedAt: ideas.updatedAt,
  }
  const orderExpr = order === 'asc' ? asc(sortMap[sortBy]) : desc(sortMap[sortBy])

  const rows = await db
    .select({
      id: ideas.id,
      slug: ideas.slug,
      finalPrompt: ideas.finalPrompt,
      finalPageData: ideas.finalPageData,
      status: ideas.status,
      publishedAt: ideas.publishedAt,
      updatedAt: ideas.updatedAt,
      pv: pvCol,
      ctaClicks: ctaCol,
      emails: emailCol,
    })
    .from(ideas)
    .leftJoin(events, eq(ideas.id, events.ideaId))
    .where(inArray(ideas.status, ['draft', 'active']))
    .groupBy(ideas.id)
    .orderBy(orderExpr)

  return rows.map((r) => ({
    ...r,
    finalPageData: r.finalPageData as Record<string, unknown> | null,
    status: r.status as IdeaWithMetrics['status'],
    pv: Number(r.pv),
    ctaClicks: Number(r.ctaClicks),
    emails: Number(r.emails),
  }))
}

export async function getArchivedIdeas(): Promise<IdeaWithMetrics[]> {
  const db = drizzle(getDb())
  const pvCol = sql<number>`COUNT(*) FILTER (WHERE ${events.eventType} = 'page_view')`
  const ctaCol = sql<number>`COUNT(*) FILTER (WHERE ${events.eventType} = 'cta_click')`
  const emailCol = sql<number>`COUNT(*) FILTER (WHERE ${events.eventType} = 'email_submit')`

  const rows = await db
    .select({
      id: ideas.id,
      slug: ideas.slug,
      finalPrompt: ideas.finalPrompt,
      finalPageData: ideas.finalPageData,
      status: ideas.status,
      publishedAt: ideas.publishedAt,
      updatedAt: ideas.updatedAt,
      pv: pvCol,
      ctaClicks: ctaCol,
      emails: emailCol,
    })
    .from(ideas)
    .leftJoin(events, eq(ideas.id, events.ideaId))
    .where(eq(ideas.status, 'archived'))
    .groupBy(ideas.id)
    .orderBy(desc(ideas.updatedAt))

  return rows.map((r) => ({
    ...r,
    finalPageData: r.finalPageData as Record<string, unknown> | null,
    status: r.status as IdeaWithMetrics['status'],
    pv: Number(r.pv),
    ctaClicks: Number(r.ctaClicks),
    emails: Number(r.emails),
  }))
}

export async function archiveIdea(id: string): Promise<void> {
  const db = drizzle(getDb())
  await db
    .update(ideas)
    .set({ status: 'archived', archivedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(ideas.id, id), eq(ideas.status, 'active')))
}

export async function restoreIdea(id: string): Promise<void> {
  const db = drizzle(getDb())
  await db
    .update(ideas)
    .set({ status: 'active', archivedAt: null, updatedAt: new Date() })
    .where(and(eq(ideas.id, id), eq(ideas.status, 'archived')))
}

export async function deleteIdea(id: string): Promise<boolean> {
  const db = drizzle(getDb())
  const result = await db
    .delete(ideas)
    .where(and(eq(ideas.id, id), eq(ideas.status, 'archived')))
    .returning({ id: ideas.id })
  return result.length > 0
}

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

export async function getIdeaBySlug(slug: string): Promise<Idea | null> {
  const db = drizzle(getDb())
  const [row] = await db
    .select()
    .from(ideas)
    .where(and(eq(ideas.slug, slug), eq(ideas.status, 'active')))
  return row ?? null
}

export async function publishIdea(
  id: string,
  slug: string
): Promise<{ id: string; slug: string; publishedAt: string }> {
  const db = drizzle(getDb())
  // First-time publish: set slug + active + published_at atomically
  const [row] = await db
    .update(ideas)
    .set({ slug, status: 'active', publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(ideas.id, id))
    .returning({ id: ideas.id, slug: ideas.slug, publishedAt: ideas.publishedAt })
  return {
    id: row.id,
    slug: row.slug!,
    publishedAt: row.publishedAt!.toISOString(),
  }
}

export async function republishIdea(
  id: string
): Promise<{ id: string; slug: string; publishedAt: string }> {
  const db = drizzle(getDb())
  // Re-publish: only set status='active', slug and published_at are immutable
  const [row] = await db
    .update(ideas)
    .set({ status: 'active', updatedAt: new Date() })
    .where(eq(ideas.id, id))
    .returning({ id: ideas.id, slug: ideas.slug, publishedAt: ideas.publishedAt })
  return {
    id: row.id,
    slug: row.slug!,
    publishedAt: row.publishedAt!.toISOString(),
  }
}
