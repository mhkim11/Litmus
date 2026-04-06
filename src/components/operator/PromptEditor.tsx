'use client'

import { useState } from 'react'

interface PromptEditorProps {
  ideaId: string
  initialPrompt?: string
  initialInstructions?: string
  onGenerate?: (prompt: string, instructions?: string) => void
}

export default function PromptEditor({
  ideaId: _ideaId,
  initialPrompt = '',
  initialInstructions = '',
  onGenerate,
}: PromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [instructions, setInstructions] = useState(initialInstructions)

  function handleGenerate() {
    if (!prompt.trim()) return
    onGenerate?.(prompt.trim(), instructions.trim() || undefined)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="prompt" className="text-sm font-medium text-gray-700">
          프롬프트 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="prompt"
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="예: 퇴근 후 15분 코딩 챌린지 앱"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="instructions" className="text-sm font-medium text-gray-700">
          지시문 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <textarea
          id="instructions"
          rows={4}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="예: 타겟은 직장인 개발자. 톤은 친근하게."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={!prompt.trim()}
        className="self-start px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        생성하기
      </button>
    </div>
  )
}
