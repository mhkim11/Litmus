'use client'

import { useState } from 'react'
import { z } from 'zod'
import { trackEvent } from '@/lib/utils/tracking'

interface EmailFormProps {
  ideaId: string
}

type FormState = 'idle' | 'success' | 'error'

const emailSchema = z.string().email()

export default function EmailForm({ ideaId }: EmailFormProps) {
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = emailSchema.safeParse(email)
    if (!result.success) {
      trackEvent(ideaId, 'invalid_email')
      setFormState('error')
      return
    }

    trackEvent(ideaId, 'email_submit', { email })
    setFormState('success')
  }

  if (formState === 'success') {
    return (
      <p className="text-green-700 font-medium text-center py-4">
        소식을 기다리겠습니다 🙌
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      <p className="text-sm text-gray-600 text-center">
        아직 출시 전이에요. 출시되면 가장 먼저 알려드릴게요
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="email-input" className="text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            id="email-input"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFormState('idle') }}
            placeholder="your@email.com"
            className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[44px]"
          />
          {formState === 'error' && (
            <p className="text-sm text-red-600">이메일 형식이 올바르지 않습니다</p>
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors min-h-[44px]"
        >
          신청하기
        </button>
      </form>
      <p className="text-xs text-gray-400 text-center">
        제출하신 이메일은 출시 알림 목적으로만 사용됩니다.
      </p>
    </div>
  )
}
