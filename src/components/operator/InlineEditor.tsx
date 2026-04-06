'use client'

import { useRef, useState } from 'react'
import type { LandingPageData } from '@/lib/schemas/landing'

interface InlineEditorProps {
  ideaId: string
  pageData: LandingPageData
  onChange: (data: LandingPageData) => void
}

async function savePageData(ideaId: string, data: LandingPageData): Promise<void> {
  await fetch(`/api/ideas/${ideaId}/draft`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ finalPageData: data as Record<string, unknown> }),
  })
}

function EditableField({
  value,
  onCommit,
  className,
  tag: Tag = 'p',
}: {
  value: string
  onCommit: (val: string) => void
  className?: string
  tag?: 'p' | 'span'
}) {
  const ref = useRef<HTMLElement>(null)

  return (
    <Tag
      ref={ref as React.RefObject<HTMLParagraphElement>}
      contentEditable
      suppressContentEditableWarning
      onBlur={() => onCommit(ref.current?.innerText.trim() ?? value)}
      className={`outline-none border-b border-dashed border-gray-300 focus:border-blue-400 cursor-text ${className ?? ''}`}
    >
      {value}
    </Tag>
  )
}

export default function InlineEditor({ ideaId, pageData, onChange }: InlineEditorProps) {
  const [data, setData] = useState<LandingPageData>(pageData)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function commitField(updated: LandingPageData) {
    setData(updated)
    onChange(updated)
    setSaveStatus('saving')
    try {
      await savePageData(ideaId, updated)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }

  return (
    <div className="border border-blue-200 rounded-lg p-6 bg-blue-50 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-blue-600 font-medium">직접 편집 모드 — 필드를 클릭해 수정하세요</p>
        <span className={`text-xs ${saveStatus === 'error' ? 'text-red-500' : 'text-gray-400'}`}>
          {saveStatus === 'saving' ? '저장 중...' : saveStatus === 'saved' ? '저장됨' : saveStatus === 'error' ? '❌ 저장 실패' : ''}
        </span>
      </div>

      <section>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Hero</p>
        <EditableField
          tag="p"
          value={data.hero.title}
          className="font-bold text-gray-900 text-lg mb-1"
          onCommit={(v) => commitField({ ...data, hero: { ...data.hero, title: v } })}
        />
        <EditableField
          tag="p"
          value={data.hero.subtitle}
          className="text-gray-600 text-sm"
          onCommit={(v) => commitField({ ...data, hero: { ...data.hero, subtitle: v } })}
        />
      </section>

      <section>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">가치제안</p>
        {data.valueProps.map((vp, i) => (
          <div key={i} className="mb-3">
            <EditableField
              tag="p"
              value={vp.title}
              className="font-medium text-gray-800 text-sm"
              onCommit={(v) => {
                const updated = data.valueProps.map((p, idx) =>
                  idx === i ? { ...p, title: v } : p
                ) as LandingPageData['valueProps']
                commitField({ ...data, valueProps: updated })
              }}
            />
            <EditableField
              tag="p"
              value={vp.description}
              className="text-gray-500 text-sm mt-0.5"
              onCommit={(v) => {
                const updated = data.valueProps.map((p, idx) =>
                  idx === i ? { ...p, description: v } : p
                ) as LandingPageData['valueProps']
                commitField({ ...data, valueProps: updated })
              }}
            />
          </div>
        ))}
      </section>

      <section>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">CTA</p>
        <EditableField
          tag="p"
          value={data.cta.buttonText}
          className="font-medium text-gray-800 text-sm"
          onCommit={(v) => commitField({ ...data, cta: { ...data.cta, buttonText: v } })}
        />
        <EditableField
          tag="p"
          value={data.cta.comingSoonMessage}
          className="text-gray-500 text-sm mt-1"
          onCommit={(v) => commitField({ ...data, cta: { ...data.cta, comingSoonMessage: v } })}
        />
      </section>
    </div>
  )
}
