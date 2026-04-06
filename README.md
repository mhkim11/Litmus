# Litmus

1인 메이커를 위한 아이디어 검증 랜딩페이지 도구. 한 줄 아이디어를 AI가 랜딩페이지로 만들어주고, 광고 트래픽의 반응(PV, CTA 클릭, 이메일 수집)을 데이터로 기록해 "어떤 아이디어를 실제로 만들지" 판단할 수 있게 돕는다.

**Status**: Epic 1 (Foundation) 진행 중 — 기획 단계 완료, 구현 시작.

**Local dev**: `bun install && bun run dev` (requires `DATABASE_URL` in `.env.local` — see `.env.local.example`)
**Deploy**: Push to `main` → Vercel auto-deploy
**Stack**: Next.js 16 (App Router) + TypeScript + Tailwind v4 + Bun + Neon Postgres + Anthropic Claude

더 자세한 내용은 `_bmad-output/planning-artifacts/` 의 PRD, Architecture, Epics 문서 참조.
