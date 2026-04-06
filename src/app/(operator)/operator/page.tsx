import { getActiveAndDraftIdeas } from '@/lib/db/queries/ideas'
import EmptyState from '@/components/shared/EmptyState'
import NewIdeaButton from '@/components/operator/NewIdeaButton'

export const dynamic = 'force-dynamic'

export default async function OperatorPage() {
  const ideas = await getActiveAndDraftIdeas()

  if (ideas.length === 0) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-8">Operator Console</h1>
        <EmptyState>
          <NewIdeaButton />
        </EmptyState>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Operator Console</h1>
        <NewIdeaButton />
      </div>
      {/* 아이디어 목록 — Story 2.9에서 완전한 테이블로 확장 */}
      <p className="text-gray-500 text-sm">{ideas.length}개의 아이디어</p>
    </main>
  )
}
