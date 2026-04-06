interface EmptyStateProps {
  children?: React.ReactNode
}

export default function EmptyState({ children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-2xl font-semibold text-gray-800 mb-2">
        아직 아이디어가 없습니다
      </p>
      <p className="text-gray-500 mb-8">
        첫 아이디어를 만들어보세요. 한 줄 프롬프트로 랜딩페이지를 생성할 수 있습니다.
      </p>
      {children}
    </div>
  )
}
