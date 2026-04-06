import { getActiveAndDraftIdeas } from '@/lib/db/queries/ideas'
import EmptyState from '@/components/shared/EmptyState'
import NewIdeaButton from '@/components/operator/NewIdeaButton'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  draft: '초안',
  active: '발행됨',
}

const STATUS_CLASS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
}

export default async function OperatorPage() {
  const ideas = await getActiveAndDraftIdeas()

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Operator Console</h1>
        <NewIdeaButton />
      </div>

      {ideas.length === 0 ? (
        <EmptyState>
          <NewIdeaButton />
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">프롬프트</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-20">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-40">수정 시각</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ideas.map((idea) => (
                <tr
                  key={idea.id}
                  onClick={() => { window.location.href = `/operator/ideas/${idea.id}` }}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-gray-900">
                    {idea.finalPrompt
                      ? idea.finalPrompt.slice(0, 50) + (idea.finalPrompt.length > 50 ? '...' : '')
                      : <span className="text-gray-400 italic">빈 프롬프트</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[idea.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[idea.status] ?? idea.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {idea.updatedAt.toLocaleString('ko-KR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
