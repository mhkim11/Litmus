'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import ArchiveConfirmDialog from './ArchiveConfirmDialog'
import StatusMessage from './StatusMessage'
import { MIN_SAMPLE_SIZE_FOR_RATE } from '@/lib/utils/constants'
import type { IdeaWithMetrics, SortBy, SortOrder } from '@/lib/db/queries/ideas'

interface DashboardTableProps {
  ideas: IdeaWithMetrics[]
  sortBy: SortBy
  order: SortOrder
}

function fmt(n: number) {
  return n === 0 ? '—' : n.toLocaleString()
}

function rate(num: number, pv: number): string {
  if (pv < MIN_SAMPLE_SIZE_FOR_RATE) return '데이터 부족'
  return `${((num / pv) * 100).toFixed(1)}%`
}

function SortLink({
  label,
  col,
  current,
  order,
}: {
  label: string
  col: SortBy
  current: SortBy
  order: SortOrder
}) {
  const isActive = current === col
  const nextOrder = isActive && order === 'desc' ? 'asc' : 'desc'
  const arrow = isActive ? (order === 'desc' ? ' ↓' : ' ↑') : ''
  return (
    <a
      href={`?sortBy=${col}&order=${nextOrder}`}
      className={`hover:underline cursor-pointer select-none ${isActive ? 'text-blue-600' : ''}`}
    >
      {label}{arrow}
    </a>
  )
}

export default function DashboardTable({ ideas, sortBy, order }: DashboardTableProps) {
  const router = useRouter()
  const [archiveTarget, setArchiveTarget] = useState<string | null>(null)
  const [now] = useState<number>(() => Date.now())

  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/ideas/${id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive' }),
      }).then((r) => { if (!r.ok) throw new Error('Archive failed'); return r.json() }),
    onSuccess: () => { setArchiveTarget(null); router.refresh() },
    onError: () => setArchiveTarget(null),
  })

  if (ideas.length === 0) return null

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">프롬프트</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-20">상태</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600 w-16">
                <SortLink label="PV" col="pv" current={sortBy} order={order} />
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-600 w-16">
                <SortLink label="CTA" col="ctaClicks" current={sortBy} order={order} />
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-600 w-16">
                <SortLink label="이메일" col="emails" current={sortBy} order={order} />
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-600 w-20">CTA율</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600 w-20">이메일율</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-24">발행 URL</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-32">
                <SortLink label="수정 시각" col="updatedAt" current={sortBy} order={order} />
              </th>
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ideas.map((idea) => (
              <tr key={idea.id} className="hover:bg-gray-50 transition-colors">
                <td
                  className="px-4 py-3 text-gray-900 cursor-pointer"
                  onClick={() => { window.location.href = `/operator/ideas/${idea.id}` }}
                >
                  {idea.finalPrompt
                    ? idea.finalPrompt.slice(0, 50) + (idea.finalPrompt.length > 50 ? '...' : '')
                    : <span className="text-gray-400 italic">빈 프롬프트</span>}
                  <StatusMessage publishedAt={idea.publishedAt} pv={idea.pv} now={now} />
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    idea.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {idea.status === 'active' ? '발행됨' : '초안'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-700">{fmt(idea.pv)}</td>
                <td className="px-4 py-3 text-center text-gray-700">{fmt(idea.ctaClicks)}</td>
                <td className="px-4 py-3 text-center">
                  {idea.emails > 0 ? (
                    <a
                      href={`/operator/ideas/${idea.id}/emails`}
                      className="text-blue-600 hover:underline"
                    >
                      {idea.emails}
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-gray-500 text-xs">
                  {rate(idea.ctaClicks, idea.pv)}
                </td>
                <td className="px-4 py-3 text-center text-gray-500 text-xs">
                  {rate(idea.emails, idea.pv)}
                </td>
                <td className="px-4 py-3 text-xs">
                  {idea.slug ? (
                    <a
                      href={`/${idea.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      /{idea.slug} ↗
                    </a>
                  ) : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {idea.updatedAt.toLocaleString('ko-KR')}
                </td>
                <td className="px-4 py-3 text-right">
                  {idea.status === 'active' && (
                    <button
                      onClick={() => setArchiveTarget(idea.id)}
                      className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      정리
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {archiveTarget && (
        <ArchiveConfirmDialog
          onConfirm={() => archiveMutation.mutate(archiveTarget)}
          onCancel={() => setArchiveTarget(null)}
          isPending={archiveMutation.isPending}
        />
      )}
    </>
  )
}
