export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-16 font-sans">
      <div className="max-w-lg text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Litmus
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
          1인 메이커를 위한 아이디어 검증 도구.
          <br />한 줄 아이디어 → AI 랜딩페이지 → 데이터로 판단.
        </p>
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-500">
          🛠 현재 Epic 1 (Foundation) 구축 중입니다.
        </p>
      </div>
    </main>
  )
}
