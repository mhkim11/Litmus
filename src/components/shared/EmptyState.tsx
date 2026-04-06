interface EmptyStateProps {
  children?: React.ReactNode
}

export default function EmptyState({ children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto">
      <p className="text-2xl font-semibold text-gray-800 mb-2">
        안녕하세요! 👋
      </p>
      <p className="text-gray-500 mb-6">
        아이디어를 한 줄로 입력하면 AI가 랜딩페이지를 만들어줍니다.
      </p>
      <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left w-full border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">3단계로 시작하기</p>
        <ol className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><span className="text-blue-500 font-bold">1.</span> 아래 버튼으로 새 아이디어 만들기</li>
          <li className="flex gap-2"><span className="text-blue-500 font-bold">2.</span> 프롬프트 입력 후 AI 생성</li>
          <li className="flex gap-2"><span className="text-blue-500 font-bold">3.</span> 발행 → 광고에 URL 붙이기</li>
        </ol>
      </div>
      {children}
    </div>
  )
}
