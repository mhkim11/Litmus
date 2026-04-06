interface EmailEntry {
  email: string
  createdAt: string
}

interface EmailListProps {
  emails: EmailEntry[]
  ideaId: string
}

export default function EmailList({ emails, ideaId }: EmailListProps) {
  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">수집된 이메일이 없습니다.</p>
        <a href={`/operator/ideas/${ideaId}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
          ← 아이디어 편집으로
        </a>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">이메일</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300 w-44">수집 시각</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {emails.map((entry) => (
            <tr key={entry.email} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{entry.email}</td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                {new Date(entry.createdAt).toLocaleString('ko-KR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
