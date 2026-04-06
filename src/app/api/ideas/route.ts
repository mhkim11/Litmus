import { NextResponse } from 'next/server'
import { createDraftIdea } from '@/lib/db/queries/ideas'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const idea = await createDraftIdea()
    return NextResponse.json(idea, { status: 201 })
  } catch (err) {
    console.error('Failed to create draft idea:', err)
    return NextResponse.json(
      { error: 'Failed to create idea', code: 'CREATE_ERROR' },
      { status: 500 }
    )
  }
}
