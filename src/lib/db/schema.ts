import {
  boolean,
  index,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

// Forward reference for jsonb typing. The actual Zod schema lives in
// src/lib/schemas/landing.ts (created in Story 1.6). Importing here would
// cause a circular dependency between schemas/ and db/, so we keep a
// structural placeholder and cast at query/write time.
// This matches Architecture Cross-Cutting Concern #7 (Single Source of Truth)
// while avoiding module cycles.
type LandingPageDataPlaceholder = Record<string, unknown>
type EventMetadata = Record<string, unknown>

/**
 * `ideas` — One row per idea.
 *
 * Business rules:
 * - `slug` is immutable after assignment (enforced by Postgres trigger in Story 1.4).
 * - `status` transitions: draft → active → archived. No reverse from archived to draft.
 * - `final_page_data` is the LLM-generated LandingPageData snapshot (see src/lib/schemas/landing.ts).
 * - `published_at` is set once at first publish and never changed (even on republish).
 * - `noindex` defaults to true to prevent accidental search engine exposure (FR54).
 */
export const ideas = pgTable(
  'ideas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug'),
    status: text('status', { enum: ['draft', 'active', 'archived'] })
      .notNull()
      .default('draft'),
    finalPrompt: text('final_prompt'),
    finalInstructions: text('final_instructions'),
    finalPageData: jsonb('final_page_data').$type<LandingPageDataPlaceholder>(),
    noindex: boolean('noindex').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('ideas_slug_idx').on(t.slug),
    index('ideas_status_idx').on(t.status),
    index('ideas_updated_at_idx').on(t.updatedAt),
  ],
)

/**
 * `events` — Visitor interaction events captured on published pages.
 *
 * Event types:
 * - `page_view`: Published page loaded.
 * - `cta_click`: CTA ("사전 신청") button clicked.
 * - `email_submit`: Valid email submitted successfully.
 * - `invalid_email`: Attempted submission with invalid email format (FR31 counter).
 *
 * `metadata` holds optional context (user agent, referrer, etc.) — kept as jsonb
 * to allow schema evolution without migrations.
 */
export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ideaId: uuid('idea_id')
      .notNull()
      .references(() => ideas.id, { onDelete: 'cascade' }),
    eventType: text('event_type', {
      enum: ['page_view', 'cta_click', 'email_submit', 'invalid_email'],
    }).notNull(),
    metadata: jsonb('metadata').$type<EventMetadata>(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('events_idea_id_created_at_idx').on(t.ideaId, t.createdAt),
    index('events_event_type_idx').on(t.eventType),
  ],
)

/**
 * `email_collections` — Emails captured from published landing pages.
 *
 * - Stored in plaintext (NFR-S2) but Neon at-rest encryption must be active.
 * - Unique (idea_id, email) prevents duplicate submissions from the same visitor.
 * - Cascades on idea deletion (permanent delete, Story 5.4).
 */
export const emailCollections = pgTable(
  'email_collections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ideaId: uuid('idea_id')
      .notNull()
      .references(() => ideas.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('email_collections_idea_email_idx').on(t.ideaId, t.email),
  ],
)

/**
 * `llm_calls` — Audit log of every LLM API invocation.
 *
 * Used by:
 * - Kill Switch (Story 1.7): Monthly SUM(cost_usd) comparison against MAX_MONTHLY_USD.
 * - Cost dashboard (Story 4.6): Current month usage display.
 * - NFR-O1: LLM observability audit.
 *
 * - `idea_id` is nullable and `SET NULL` on delete — keeps cost history even if
 *   the originating idea is permanently deleted (Story 5.4).
 * - `cost_usd` uses numeric(10, 6) for sub-cent precision (tokens × rate).
 */
export const llmCalls = pgTable(
  'llm_calls',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ideaId: uuid('idea_id').references(() => ideas.id, {
      onDelete: 'set null',
    }),
    provider: text('provider').notNull(),
    model: text('model').notNull(),
    promptTokens: numeric('prompt_tokens').notNull(),
    completionTokens: numeric('completion_tokens').notNull(),
    costUsd: numeric('cost_usd', { precision: 10, scale: 6 }).notNull(),
    durationMs: numeric('duration_ms').notNull(),
    success: boolean('success').notNull(),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('llm_calls_created_at_idx').on(t.createdAt)],
)

// Type exports — inferred from table definitions. Used by db query modules.
export type Idea = typeof ideas.$inferSelect
export type NewIdea = typeof ideas.$inferInsert
export type IdeaStatus = Idea['status']

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type EventType = Event['eventType']

export type EmailCollection = typeof emailCollections.$inferSelect
export type NewEmailCollection = typeof emailCollections.$inferInsert

export type LlmCall = typeof llmCalls.$inferSelect
export type NewLlmCall = typeof llmCalls.$inferInsert
