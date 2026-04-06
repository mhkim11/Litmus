# Story 3.7: PV + CTA 클릭 이벤트 연결

Status: review

## Story

As a **System**,
I want **Published Page 로드 시 PV 이벤트를, CTA 버튼 클릭 시 CTA 이벤트를 자동 기록**,
So that **FR27, FR28이 구현된다**.

## Acceptance Criteria

1. `TrackingBoundary.tsx` 클라이언트 컴포넌트: 마운트 시 `trackEvent(ideaId, 'page_view')`
2. `CTASection.tsx` 클라이언트 컴포넌트: 클릭 시 `trackEvent(ideaId, 'cta_click')`
3. Preview 모드(operator 경로)에서는 이벤트 미발생
4. `[slug]/page.tsx`에 TrackingBoundary + CTASection에 ideaId 전달

## Tasks / Subtasks

- [x] Task 1: TrackingBoundary 컴포넌트 생성
  - [x] `src/components/published/TrackingBoundary.tsx` — 'use client', useEffect로 page_view
- [x] Task 2: CTASection 업데이트
  - [x] `ideaId?: string` prop 추가, 'use client' 추가
  - [x] 클릭 시 ideaId 있으면 trackEvent(ideaId, 'cta_click') 호출
- [x] Task 3: [slug]/page.tsx 업데이트
  - [x] TrackingBoundary, CTASection에 ideaId 전달
- [x] Task 4: 검증
  - [x] typecheck, lint, test 통과

## Dev Notes

- TrackingBoundary: `ideaId` prop, `useEffect(() => trackEvent(ideaId, 'page_view'), [ideaId])`, returns null
- CTASection의 `ideaId` optional — preview 페이지에선 전달 안 해도 트래킹 skip
- Preview/QuickPreview 페이지는 TrackingBoundary 포함 안 함, CTASection에 ideaId 미전달

### References
- [Source: epics.md#Story 3.7]

## Dev Agent Record
### Agent Model Used
Claude Sonnet 4.6 via Claude Code
### Completion Notes List
- TrackingBoundary: null 반환 invisible 컴포넌트, [slug]/page.tsx에만 포함 (preview 제외)
- CTASection: ideaId optional — preview/quick-preview에서 미전달 시 트래킹 자동 skip
### File List
**생성:**
- `src/components/published/TrackingBoundary.tsx`
**수정:**
- `src/components/published/CTASection.tsx` — 'use client', ideaId prop, cta_click 트래킹
- `src/app/[slug]/page.tsx` — TrackingBoundary + CTASection에 ideaId 전달
