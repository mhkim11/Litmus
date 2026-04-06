# Story 3.3: Published Page 렌더링 (Hero / Value Props / CTA 컴포넌트)

Status: review

## Story

As a **Visitor**,
I want **발행된 URL에서 깔끔한 랜딩페이지 콘텐츠를 본다**,
So that **FR20이 구현되고 정식 Published Page가 완성된다**.

## Acceptance Criteria

1. `src/app/[slug]/page.tsx`가 정식 서버 컴포넌트로 구현된다
2. HeroSection, ValueProps, CTASection(published/) 컴포넌트를 사용해 렌더링한다
3. `getIdeaBySlug(slug)` 쿼리 함수로 DB 조회
4. slug가 존재하지 않거나 status != 'active'이면 404
5. 시맨틱 HTML + 모바일 우선 Tailwind 레이아웃 (NFR-A2 44x44px 터치 타겟)
6. 이 시점엔 법적 가드레일 Footer, 이메일 폼, 이벤트 수집 없음 (후속 Story)

## Tasks / Subtasks

- [x] Task 1: getIdeaBySlug 쿼리 함수 추가
  - [x] `src/lib/db/queries/ideas.ts` — `getIdeaBySlug(slug)`
- [x] Task 2: Published Page 구현
  - [x] `src/app/[slug]/page.tsx` — 서버 컴포넌트
  - [x] slug 없음 / status != 'active' → notFound()
  - [x] HeroSection + ValueProps + CTASection 렌더링
- [x] Task 3: 검증
  - [x] typecheck, lint, test 통과

## Dev Notes

- `getIdeaBySlug`: `WHERE slug = ? AND status = 'active'` — 미발행(draft/archived) 아이디어는 404
- CTASection에서 onClick은 서버 컴포넌트이므로 전달 안 함 (후속 Story에서 클라이언트 wiring)
- `export const dynamic = 'force-dynamic'` — DB 조회 페이지이므로 SSR
- 법적 가드레일 Footer는 Story 3.4에서 추가

### References
- [Source: epics.md#Story 3.3]

## Dev Agent Record
### Agent Model Used
Claude Sonnet 4.6 via Claude Code
### Completion Notes List
- `getIdeaBySlug`: `WHERE slug=? AND status='active'` — draft/archived 아이디어는 자동 404
- CTASection에 onClick 전달 안 함 — 서버 컴포넌트; 이벤트 wiring은 Story 3.7에서
- `/operator/ideas/[id]/page.tsx`의 `<a>` → `<Link>` 로 교체 (lint 오류 수정)
### File List
**생성:**
- `src/app/[slug]/page.tsx`
**수정:**
- `src/lib/db/queries/ideas.ts` — getIdeaBySlug() 추가, and import 추가
- `src/app/(operator)/operator/ideas/[id]/page.tsx` — Link 컴포넌트로 교체
