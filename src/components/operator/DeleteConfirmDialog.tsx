'use client'

interface DeleteConfirmDialogProps {
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}

export default function DeleteConfirmDialog({ onConfirm, onCancel, isPending }: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">⚠️ 완전 삭제</h2>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-none">
          <li>• 이 아이디어와 수집된 모든 데이터 (이벤트, 이메일)가 복구 불가능하게 삭제됩니다</li>
          <li>• 발행된 URL도 즉시 404가 됩니다</li>
          <li className="font-semibold text-red-600 dark:text-red-400">• 이 작업은 되돌릴 수 없습니다</li>
        </ul>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isPending ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  )
}
