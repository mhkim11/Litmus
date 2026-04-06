'use client'

interface ArchiveConfirmDialogProps {
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}

export default function ArchiveConfirmDialog({ onConfirm, onCancel, isPending }: ArchiveConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900">💤 이 아이디어를 정리할까요?</h2>
        <ul className="text-sm text-gray-600 space-y-1 list-none">
          <li>• 페이지는 유지되지만 대시보드 상단에서 사라집니다</li>
          <li>• 지금까지 수집한 데이터는 그대로 보존됩니다</li>
          <li>• 언제든 Archive 섹션에서 다시 꺼낼 수 있어요</li>
        </ul>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            {isPending ? '처리 중...' : '정리하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
