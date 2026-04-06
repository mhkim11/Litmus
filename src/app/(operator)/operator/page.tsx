import Link from 'next/link'
import { getIdeasWithMetrics, getArchivedIdeas } from '@/lib/db/queries/ideas'
import { getCurrentMonthLLMCost } from '@/lib/db/queries/llmCalls'
import EmptyState from '@/components/shared/EmptyState'
import NewIdeaButton from '@/components/operator/NewIdeaButton'
import DashboardTable from '@/components/operator/DashboardTable'
import ArchivedSection from '@/components/operator/ArchivedSection'
import type { SortBy, SortOrder } from '@/lib/db/queries/ideas'

export const dynamic = 'force-dynamic'

const VALID_SORT: SortBy[] = ['pv', 'ctaClicks', 'emails', 'updatedAt']
const VALID_ORDER: SortOrder[] = ['asc', 'desc']

interface Props {
  searchParams: Promise<{ sortBy?: string; order?: string }>
}

export default async function OperatorPage({ searchParams }: Props) {
  const { sortBy: rawSort, order: rawOrder } = await searchParams
  const sortBy: SortBy = VALID_SORT.includes(rawSort as SortBy) ? (rawSort as SortBy) : 'updatedAt'
  const order: SortOrder = VALID_ORDER.includes(rawOrder as SortOrder) ? (rawOrder as SortOrder) : 'desc'

  const [ideas, archived, llmCost] = await Promise.all([
    getIdeasWithMetrics(sortBy, order),
    getArchivedIdeas(),
    getCurrentMonthLLMCost(),
  ])

  const maxBudget = Number(process.env.MAX_MONTHLY_USD ?? 50)
  const costPct = (llmCost / maxBudget) * 100

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Operator Console</h1>
        <div className="flex items-center gap-3">
          <Link href="/operator/export" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
            데이터 내보내기
          </Link>
          <NewIdeaButton />
        </div>
      </div>

      {/* LLM 비용 배지 */}
      <div className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full mb-6 ${
        costPct >= 100
          ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
          : costPct >= 80
          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
      }`}>
        💰 이번 달 LLM 비용: ${llmCost.toFixed(2)} / ${maxBudget.toFixed(2)} ({costPct.toFixed(0)}%)
        {costPct >= 100 && <span className="font-semibold">— Kill Switch 활성</span>}
      </div>

      {ideas.length === 0 && archived.length === 0 ? (
        <EmptyState>
          <NewIdeaButton />
        </EmptyState>
      ) : (
        <>
          <DashboardTable ideas={ideas} sortBy={sortBy} order={order} />
          <ArchivedSection ideas={archived} />
        </>
      )}
    </main>
  )
}
