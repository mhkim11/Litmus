'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseDraftAutoSaveOptions {
  ideaId: string
  prompt: string
  instructions: string
}

interface UseDraftAutoSaveResult {
  status: SaveStatus
  saveNow: () => void
}

async function saveDraft(ideaId: string, prompt: string, instructions: string): Promise<void> {
  const res = await fetch(`/api/ideas/${ideaId}/draft`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ finalPrompt: prompt, finalInstructions: instructions }),
  })
  if (!res.ok) throw new Error('Save failed')
}

export function useDraftAutoSave({
  ideaId,
  prompt,
  instructions,
}: UseDraftAutoSaveOptions): UseDraftAutoSaveResult {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const latestRef = useRef({ prompt, instructions })
  const isMountedRef = useRef(true)

  // 최신 값 동기화
  useEffect(() => {
    latestRef.current = { prompt, instructions }
  }, [prompt, instructions])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const save = useCallback(async () => {
    setStatus('saving')
    try {
      const { prompt: p, instructions: i } = latestRef.current
      await saveDraft(ideaId, p, i)
      if (isMountedRef.current) setStatus('saved')
    } catch {
      if (isMountedRef.current) setStatus('error')
    }
  }, [ideaId])

  // 10초 debounce 자동저장
  useEffect(() => {
    if (status === 'saving') return
    const timer = setTimeout(save, 10_000)
    return () => clearTimeout(timer)
  }, [prompt, instructions, save, status])

  // beforeunload: error 상태일 때만 등록
  useEffect(() => {
    if (status !== 'error') return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [status])

  return { status, saveNow: save }
}
