'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewIdeaButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/ideas', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.error('Failed to create idea:', body)
        return
      }
      const { id } = await res.json()
      router.push(`/operator/ideas/${id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? '생성 중...' : '새 아이디어 만들기'}
    </button>
  )
}
