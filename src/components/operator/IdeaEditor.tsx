'use client'

import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import PromptEditor from './PromptEditor'
import GenerationProgress from './GenerationProgress'
import InlineEditor from './InlineEditor'
import type { LandingPageData } from '@/lib/schemas/landing'

interface IdeaEditorProps {
  ideaId: string
  initialPrompt?: string
  initialInstructions?: string
  initialPageData?: LandingPageData | null
}

class BudgetExceededError extends Error {
  code = 'BUDGET_EXCEEDED'
}

async function callGenerate(
  ideaId: string,
  prompt: string,
  instructions?: string,
  signal?: AbortSignal
): Promise<LandingPageData> {
  const res = await fetch(`/api/ideas/${ideaId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, instructions }),
    signal,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    if (body.code === 'BUDGET_EXCEEDED') throw new BudgetExceededError(body.error)
    throw new Error(body.error ?? 'Generation failed')
  }
  return res.json()
}

type ViewMode = 'prompting' | 'result'

export default function IdeaEditor({
  ideaId,
  initialPrompt = '',
  initialInstructions = '',
  initialPageData,
}: IdeaEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialPageData ? 'result' : 'prompting')
  const [isInlineEditing, setIsInlineEditing] = useState(false)
  const [localPageData, setLocalPageData] = useState<LandingPageData | null>(
    initialPageData ?? null
  )
  const [lastPrompt, setLastPrompt] = useState(initialPrompt)
  const [lastInstructions, setLastInstructions] = useState(initialInstructions)
  const abortRef = useRef<AbortController | null>(null)

  const mutation = useMutation({
    mutationFn: ({ prompt, instructions }: { prompt: string; instructions?: string }) => {
      abortRef.current = new AbortController()
      return callGenerate(ideaId, prompt, instructions, abortRef.current.signal)
    },
    onSuccess: (data) => {
      setLocalPageData(data)
      setViewMode('result')
      setIsInlineEditing(false)
    },
    onSettled: () => {
      abortRef.current = null
    },
  })

  function handleGenerate(prompt: string, instructions?: string) {
    setLastPrompt(prompt)
    setLastInstructions(instructions ?? '')
    mutation.mutate({ prompt, instructions })
  }

  function handleCancel() {
    abortRef.current?.abort()
    mutation.reset()
  }

  const isCancelled = mutation.error?.name === 'AbortError'

  return (
    <div className="flex flex-col gap-8">
      {/* 프롬프트 편집 영역 */}
      {viewMode === 'prompting' && !mutation.isPending && (
        <PromptEditor
          ideaId={ideaId}
          initialPrompt={lastPrompt}
          initialInstructions={lastInstructions}
          onGenerate={handleGenerate}
        />
      )}

      {/* 생성 진행 중 */}
      {mutation.isPending && <GenerationProgress onCancel={handleCancel} />}

      {/* 에러 */}
      {mutation.isError && !isCancelled && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 flex items-center justify-between">
          <p className="text-sm text-red-700">
            {mutation.error instanceof BudgetExceededError
              ? '이번 달 LLM 예산을 초과했습니다. MAX_MONTHLY_USD를 조정하거나 다음 달까지 기다려주세요.'
              : '생성에 실패했습니다. 다시 시도해주세요.'}
          </p>
          {!(mutation.error instanceof BudgetExceededError) && (
            <button
              onClick={() => mutation.reset()}
              className="text-sm text-red-600 underline ml-4 shrink-0"
            >
              다시 생성
            </button>
          )}
        </div>
      )}

      {/* 결과 영역 */}
      {viewMode === 'result' && localPageData && !mutation.isPending && (
        <div className="flex flex-col gap-4">
          {/* 3경로 액션 버튼 */}
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => mutation.mutate({ prompt: lastPrompt, instructions: lastInstructions || undefined })}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              재생성
            </button>
            <button
              onClick={() => { setViewMode('prompting'); setIsInlineEditing(false) }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              프롬프트 수정
            </button>
            <button
              onClick={() => setIsInlineEditing((v) => !v)}
              className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                isInlineEditing
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isInlineEditing ? '편집 완료' : '직접 편집'}
            </button>
            <a
              href={`/operator/ideas/${ideaId}/preview`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
            >
              미리보기 ↗
            </a>
            <a
              href={`/operator/ideas/${ideaId}/quick-preview`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Quick Preview ↗
            </a>
          </div>

          {/* 인라인 편집 또는 결과 표시 */}
          {isInlineEditing ? (
            <InlineEditor
              ideaId={ideaId}
              pageData={localPageData}
              onChange={setLocalPageData}
            />
          ) : (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-gray-800">생성 결과</h2>
              <section>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Hero</p>
                <p className="font-bold text-gray-900">{localPageData.hero.title}</p>
                <p className="text-gray-600 text-sm mt-1">{localPageData.hero.subtitle}</p>
              </section>
              <section>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">가치제안</p>
                <ul className="flex flex-col gap-2">
                  {localPageData.valueProps.map((vp, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium text-gray-800">{vp.title}</span>
                      <span className="text-gray-500"> — {vp.description}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">CTA</p>
                <p className="text-sm text-gray-700">
                  버튼: <span className="font-medium">{localPageData.cta.buttonText}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">{localPageData.cta.comingSoonMessage}</p>
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
