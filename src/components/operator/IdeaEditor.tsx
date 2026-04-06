'use client'

import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import PromptEditor from './PromptEditor'
import GenerationProgress from './GenerationProgress'
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

export default function IdeaEditor({
  ideaId,
  initialPrompt,
  initialInstructions,
  initialPageData,
}: IdeaEditorProps) {
  const abortRef = useRef<AbortController | null>(null)

  const mutation = useMutation({
    mutationFn: ({ prompt, instructions }: { prompt: string; instructions?: string }) => {
      abortRef.current = new AbortController()
      return callGenerate(ideaId, prompt, instructions, abortRef.current.signal)
    },
    onSettled: () => {
      abortRef.current = null
    },
  })

  function handleCancel() {
    abortRef.current?.abort()
    mutation.reset()
  }

  const pageData = mutation.data ?? initialPageData
  const isCancelled = mutation.error?.name === 'AbortError'

  return (
    <div className="flex flex-col gap-8">
      {!mutation.isPending && (
        <PromptEditor
          ideaId={ideaId}
          initialPrompt={initialPrompt}
          initialInstructions={initialInstructions}
          onGenerate={(prompt, instructions) => mutation.mutate({ prompt, instructions })}
        />
      )}

      {mutation.isPending && <GenerationProgress onCancel={handleCancel} />}

      {mutation.isError && !isCancelled && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 flex items-center justify-between">
          <p className="text-sm text-red-700">
            {mutation.error instanceof BudgetExceededError
              ? '이번 달 LLM 예산을 초과했습니다. .env.local의 MAX_MONTHLY_USD를 조정하거나 다음 달까지 기다려주세요.'
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

      {pageData && !mutation.isPending && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-800">생성 결과</h2>

          <section>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Hero</p>
            <p className="font-bold text-gray-900">{pageData.hero.title}</p>
            <p className="text-gray-600 text-sm mt-1">{pageData.hero.subtitle}</p>
          </section>

          <section>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">가치제안</p>
            <ul className="flex flex-col gap-2">
              {pageData.valueProps.map((vp, i) => (
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
              버튼: <span className="font-medium">{pageData.cta.buttonText}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">{pageData.cta.comingSoonMessage}</p>
          </section>
        </div>
      )}
    </div>
  )
}
