'use client'

import { useEffect, useState } from 'react'

interface GenerationProgressProps {
  onCancel: () => void
}

export default function GenerationProgress({ onCancel }: GenerationProgressProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">
          아이디어를 만들고 있어요... ({elapsed}초 경과)
        </span>
        <button
          onClick={onCancel}
          className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 underline"
        >
          취소
        </button>
      </div>
      {elapsed >= 30 && (
        <p className="text-xs text-amber-600">
          평소보다 오래 걸립니다. 잠시만 기다려주세요.
        </p>
      )}
    </div>
  )
}
