import Link from 'next/link'
import { notFound } from 'next/navigation'
import { drizzle } from 'drizzle-orm/neon-http'
import { desc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { emailCollections } from '@/lib/db/schema'
import { getIdeaById } from '@/lib/db/queries/ideas'
import EmailList from '@/components/operator/EmailList'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EmailsPage({ params }: Props) {
  const { id } = await params
  const idea = await getIdeaById(id)
  if (!idea) notFound()

  const db = drizzle(getDb())
  const rows = await db
    .select({ email: emailCollections.email, createdAt: emailCollections.createdAt })
    .from(emailCollections)
    .where(eq(emailCollections.ideaId, id))
    .orderBy(desc(emailCollections.createdAt))

  const emails = rows.map((r) => ({ email: r.email, createdAt: r.createdAt.toISOString() }))

  const title = (idea.finalPageData as { hero?: { title?: string } } | null)?.hero?.title ?? '아이디어'

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-2">
        <Link href="/operator" className="text-sm text-blue-600 hover:underline">
          ← Operator Console
        </Link>
        <span className="text-gray-400 dark:text-gray-500">/</span>
        <Link href={`/operator/ideas/${id}`} className="text-sm text-blue-600 hover:underline truncate max-w-xs">
          {title}
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-2">이메일 목록</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">수집된 이메일: {emails.length}개</p>
      <EmailList emails={emails} ideaId={id} />
    </main>
  )
}
