'use client'

import Link from 'next/link'

export default function ExportPage() {
  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/operator" className="text-sm text-blue-600 hover:underline">
          ← Operator Console
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">데이터 내보내기</h1>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          이 파일은 모든 아이디어, 이벤트, 이메일, LLM 호출 기록을 포함합니다. 안전한 곳에 보관하세요.
        </p>
        <ul className="mt-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <li>• ideas — 모든 아이디어와 생성된 페이지 데이터</li>
          <li>• events — 방문자 이벤트 (PV, CTA, 이메일 제출)</li>
          <li>• email_collections — 수집된 이메일 주소</li>
          <li>• llm_calls — LLM API 호출 기록 및 비용</li>
        </ul>
      </div>
      {/* window.location.href로 다운로드 — Content-Disposition attachment 트리거 */}
      <button
        onClick={() => { window.location.href = '/operator/api/export' }}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
      >
        전체 데이터 JSON 다운로드
      </button>
    </main>
  )
}
