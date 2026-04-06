'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import DeleteConfirmDialog from './DeleteConfirmDialog'
import type { IdeaWithMetrics } from '@/lib/db/queries/ideas'

interface ArchivedSectionProps {
  ideas: IdeaWithMetrics[]
}

export default function ArchivedSection({ ideas }: ArchivedSectionProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const restoreMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/ideas/${id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' }),
      }).then((r) => { if (!r.ok) throw new Error('Restore failed'); return r.json() }),
    onSuccess: () => router.refresh(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/ideas/${id}`, { method: 'DELETE' }).then((r) => {
        if (!r.ok && r.status !== 204) throw new Error('Delete failed')
      }),
    onSuccess: () => { setDeleteTarget(null); router.refresh() },
    onError: () => setDeleteTarget(null),
  })

  return (
    <>
      <div className="mt-8">
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-3"
        >
          <span>{isOpen ? '▼' : '▶'}</span>
          <span className="font-medium">Archived</span>
          <span className="text-gray-400 dark:text-gray-500">· {ideas.length}개의 아이디어가 잘 쉬고 있어요</span>
        </button>

        {isOpen && ideas.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 opacity-75">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">프롬프트</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-16">PV</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-16">이메일</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">발행 URL</th>
                  <th className="px-4 py-3 w-32" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {ideas.map((idea) => (
                  <tr key={idea.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400">
                    <td
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => { window.location.href = `/operator/ideas/${idea.id}` }}
                    >
                      {idea.finalPrompt
                        ? idea.finalPrompt.slice(0, 50) + (idea.finalPrompt.length > 50 ? '...' : '')
                        : <span className="italic">빈 프롬프트</span>}
                    </td>
                    <td className="px-4 py-3 text-center">{idea.pv || '—'}</td>
                    <td className="px-4 py-3 text-center">{idea.emails || '—'}</td>
                    <td className="px-4 py-3 text-xs">
                      {idea.slug ? (
                        <a href={`/${idea.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">
                          /{idea.slug} ↗
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right flex gap-3 justify-end">
                      <button
                        onClick={() => restoreMutation.mutate(idea.id)}
                        disabled={restoreMutation.isPending}
                        className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50"
                      >
                        복원
                      </button>
                      <button
                        onClick={() => setDeleteTarget(idea.id)}
                        className="text-xs text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isOpen && ideas.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 pl-4">정리된 아이디어가 없습니다.</p>
        )}
      </div>

      {deleteTarget && (
        <DeleteConfirmDialog
          onConfirm={() => deleteMutation.mutate(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          isPending={deleteMutation.isPending}
        />
      )}
    </>
  )
}
