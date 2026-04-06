import { NextRequest, NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/neon-http'
import { desc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { emailCollections } from '@/lib/db/schema'

export const runtime = 'nodejs'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const db = drizzle(getDb())
    const rows = await db
      .select({ email: emailCollections.email, createdAt: emailCollections.createdAt })
      .from(emailCollections)
      .where(eq(emailCollections.ideaId, id))
      .orderBy(desc(emailCollections.createdAt))

    return NextResponse.json(
      rows.map((r) => ({ email: r.email, createdAt: r.createdAt.toISOString() }))
    )
  } catch (error) {
    console.error('[emails] error:', error)
    return NextResponse.json({ error: '조회에 실패했습니다.' }, { status: 500 })
  }
}
