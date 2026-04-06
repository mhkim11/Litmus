# Litmus

1인 메이커를 위한 아이디어 검증 랜딩페이지 도구. 한 줄 아이디어를 AI 랜딩페이지로 변환하고 광고 트래픽 반응(PV, CTA, 이메일)으로 검증.

## Setup

1. `bun install`
2. `.env.local.example` → `.env.local` 복사 후 `DATABASE_URL`, `ANTHROPIC_API_KEY`, `OPERATOR_TOKEN` 입력
3. Neon SQL Editor에서 `drizzle/custom/slug_immutable.sql` 1회 실행
4. `bun run dev`

**Deploy:** `git push main` → Vercel 자동 배포 (환경변수는 Vercel Dashboard에서 설정)

**Structure:** `src/app/(operator)` (콘솔), `src/app/[slug]` (발행 페이지), `src/lib/{db,llm,schemas}` (로직)

**Stack:** Next.js 16 · TypeScript · Tailwind v4 · Bun · Neon Postgres · Drizzle ORM · Anthropic Claude · Zod
