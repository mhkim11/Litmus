import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-dvh bg-white text-zinc-900 font-sans flex flex-col">

      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center px-6 pt-24 pb-16 max-w-2xl mx-auto w-full">
        <p className="text-sm font-medium tracking-widest text-zinc-400 uppercase mb-6">
          Litmus
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-zinc-900">
          AI로 딸깍 만들었는데<br />아무도 안 쓰나요?
        </h1>

        <p className="mt-6 text-xl sm:text-2xl font-semibold text-zinc-700 leading-snug">
          만들기 전에 팔아보세요.
        </p>

        <p className="mt-4 text-base text-zinc-400">
          한 줄 아이디어 → AI 랜딩페이지 → 데이터로 판단.
        </p>

        <div className="mt-10">
          <Link
            href="/operator"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-700 transition-colors"
          >
            지금 검증 시작하기 →
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 bg-zinc-50 border-t border-zinc-100">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-10">
            How it works
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Step number="01" title="아이디어 한 줄" description="떠오른 아이디어를 프롬프트로 입력하세요." />
            <Arrow />
            <Step number="02" title="AI 랜딩페이지" description="30초 안에 카피·가치제안·CTA가 완성됩니다." />
            <Arrow />
            <Step number="03" title="데이터로 판단" description="광고를 붙이고, PV·클릭·이메일로 될 놈을 찾으세요." />
          </div>
        </div>
      </section>

      {/* Pain vs Litmus */}
      <section className="px-6 py-16 border-t border-zinc-100">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-10">
            Before / After
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-zinc-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-zinc-400">기존 검증</p>
              </div>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="line-through">Framer 디자인</li>
                <li className="line-through">Tally 폼 연동</li>
                <li className="line-through">GA4 세팅</li>
                <li className="line-through">광고 소재 제작</li>
                <li className="line-through">스프레드시트 정리</li>
              </ul>
              <p className="mt-6 text-sm font-semibold text-zinc-500">아이디어 하나에 반나절</p>
            </div>
            <div className="rounded-xl border border-zinc-900 bg-zinc-900 p-6 text-white">
              <p className="text-xs font-semibold text-zinc-400 mb-4">Litmus</p>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>✓ 프롬프트 입력</li>
                <li>✓ AI 생성 (30초)</li>
                <li>✓ URL 복사 → 광고</li>
                <li>✓ 대시보드에서 비교</li>
              </ul>
              <p className="mt-6 text-sm font-semibold text-white">아이디어 하나에 30초</p>
            </div>
          </div>
        </div>
      </section>

      {/* Crystal teaser */}
      <section className="px-6 py-16 bg-zinc-50 border-t border-zinc-100">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-2">
              자매품
            </p>
            <p className="text-xl font-bold text-zinc-900">Crystal</p>
            <p className="mt-1 text-sm text-zinc-500">
              Litmus로 검증된 아이디어를 빠르게 구현해보세요.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-zinc-200 text-xs text-zinc-400 font-medium shrink-0">
            Coming Soon
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-zinc-100">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <p className="text-xs text-zinc-400">Litmus · 1인 메이커를 위한 아이디어 검증 도구</p>
          <Link href="/operator" className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
            Operator Console →
          </Link>
        </div>
      </footer>

    </main>
  )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex-1">
      <p className="text-xs font-semibold text-zinc-400 mb-1">{number}</p>
      <p className="text-base font-bold text-zinc-900">{title}</p>
      <p className="mt-1 text-sm text-zinc-500 leading-relaxed">{description}</p>
    </div>
  )
}

function Arrow() {
  return (
    <span className="text-zinc-300 text-xl font-light hidden sm:block shrink-0">→</span>
  )
}
