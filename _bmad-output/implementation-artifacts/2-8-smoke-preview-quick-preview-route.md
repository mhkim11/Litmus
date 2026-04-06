# Story 2.8: Smoke Preview — Quick Preview 경로 (Walking Skeleton)

Status: review

## Story

As a **Operator**,
I want **생성된 아이디어를 Operator 전용 임시 경로에서 브라우저로 확인**,
so that **Walking Skeleton이 완성되어 "내가 만든 것이 웹에 존재한다"는 것을 중간 체크포인트에서 확인할 수 있다**.

## Acceptance Criteria

1. `src/app/(operator)/operator/ideas/[id]/quick-preview/page.tsx`가 구현된다 (별도 route)
2. `(operator)` route group 내부라 proxy 자동 보호
3. URL 파라미터 [id]로 DB에서 ideas row 조회
4. `final_page_data` JSON을 최소한의 HTML로 렌더링 (hero, subtitle, 3개 가치제안, CTA — Tailwind 기본값만)
5. 이메일 폼, 이벤트 수집, 법적 가드레일 footer 없음 (후속 Story)
6. 편집 페이지에 "Quick Preview 열기" 버튼이 있어 새 탭으로 이동
7. 이 스토리 완료 시점에 "프롬프트 → 생성 → 편집 → 브라우저 확인" end-to-end 완주

## Tasks / Subtasks

- [x] Task 1: Quick Preview 페이지 (AC: #1~#5)
  - [x] `src/app/(operator)/operator/ideas/[id]/quick-preview/page.tsx`
  - [x] getIdeaById → finalPageData 없으면 안내 메시지
  - [x] finalPageData 있으면 최소 HTML 렌더링 (Hero/ValueProps/CTA)
  - [x] Operator 전용 배너 표시
- [x] Task 2: "Quick Preview 열기" 버튼 (AC: #6)
  - [x] IdeaEditor 결과 영역에 버튼 추가 (target="_blank")
- [x] Task 3: 검증
  - [x] typecheck: 통과
  - [x] lint: 에러/경고 없음
  - [x] test: 3/3 통과

## Dev Notes

- quick-preview URL: `/operator/ideas/{id}/quick-preview`
- finalPageData 타입 캐스팅: `idea.finalPageData as LandingPageData`
- 별도 컴포넌트화 하지 않음 (Epic 3 Story 3.3에서 정식 컴포넌트 구축)

### References
- [Source: epics.md#Story 2.8]

## Dev Agent Record
### Agent Model Used
Claude Sonnet 4.6 via Claude Code
### Completion Notes List

- **Operator 배너**: 방문자와 구분하기 위해 상단에 "Operator 전용 Quick Preview" 배너 표시.
- **finalPageData 없음 처리**: 생성 전 접근 시 안내 메시지 + 편집 페이지 링크.
- **"Quick Preview 열기" 위치**: IdeaEditor 결과 영역 3경로 버튼 옆에 배치 (pageData 있을 때만 노출).

### File List

**생성:**
- `src/app/(operator)/operator/ideas/[id]/quick-preview/page.tsx` — Quick Preview 페이지

**수정:**
- `src/components/operator/IdeaEditor.tsx` — "Quick Preview 열기" 버튼 추가
