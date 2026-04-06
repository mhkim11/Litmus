# Story 3.9: OG 메타 + 모바일 반응형 + noindex + 재발행 URL 유지

Status: review

## Story

As a **Visitor & Operator**,
I want **광고 공유 시 미리보기가 잘 보이고, 모바일에서 깔끔하며, 검색엔진에는 노출되지 않고, 재발행해도 URL이 유지되는 페이지**,
So that **FR15, FR16, FR18, FR54, NFR-A1~A4가 구현된다**.

## Acceptance Criteria

1. `generateMetadata` — title, description, openGraph, robots(noindex)
2. `opengraph-image.tsx` — hero title 기반 동적 OG 이미지 (ImageResponse)
3. `ideas.noindex` 컬럼 기반 robots 토글 (기본값 true → noindex)
4. HeroSection 반응형 개선 (`text-3xl sm:text-5xl`, `py-16 sm:py-24`)
5. 재발행 URL 유지: Story 3.2 로직 코드 확인 (slug 불변 분기 이미 구현)

## Tasks / Subtasks

- [x] Task 1: generateMetadata + opengraph-image
  - [x] `src/app/[slug]/page.tsx` — generateMetadata 추가
  - [x] `src/app/[slug]/opengraph-image.tsx` — ImageResponse, Edge Runtime
- [x] Task 2: 반응형 개선
  - [x] HeroSection — 모바일/데스크톱 폰트·패딩 분리
- [x] Task 3: 검증
  - [x] typecheck, lint, test 통과

## Dev Notes

- generateMetadata: `idea.noindex` true → `robots: { index: false, follow: false }`
- opengraph-image: `export const runtime = 'edge'`, `size = { width: 1200, height: 630 }`
- 재발행 URL 유지: publishIdea/republishIdea 분기가 이미 Story 3.2에서 구현됨

### References
- [Source: epics.md#Story 3.9]

## Dev Agent Record
### Agent Model Used
Claude Sonnet 4.6 via Claude Code
### Completion Notes List
- generateMetadata: idea.noindex(기본 true) → robots noindex, false면 index 허용
- opengraph-image.tsx: Edge Runtime, 1200×630, hero.title 텍스트 기반 동적 이미지
- 재발행 URL 유지: publishIdea(신규)/republishIdea(기존) 분기가 Story 3.2에서 이미 구현됨
### File List
**생성:**
- `src/app/[slug]/opengraph-image.tsx`
**수정:**
- `src/app/[slug]/page.tsx` — generateMetadata 추가
- `src/components/published/HeroSection.tsx` — 반응형 폰트·패딩
