import { NextRequest } from 'next/server'
import { z } from 'zod'
import { insertEvent } from '@/lib/db/queries/events'

export const runtime = 'edge'

const bodySchema = z.object({
  ideaId: z.string().uuid(),
  eventType: z.enum(['page_view', 'cta_click', 'email_submit', 'invalid_email']),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Validation failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    await insertEvent(parsed.data)
  } catch (error) {
    console.error('[events] insert error:', error)
    return new Response(JSON.stringify({ error: 'Failed to record event' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(null, { status: 204 })
}
