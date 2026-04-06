# Story 3.1: 발행 전 미리보기 (Visitor 시점)

Status: review

## Story

As a **Operator**,
I want **발행 버튼을 누르기 전에 방문자가 보게 될 실제 화면을 미리 확인**,
so that **FR19가 구현되어 안심하고 광고에 URL을 붙일 수 있다**.

## Acceptance Criteria

1. `src/app/(operator)/operator/ideas/[id]/preview/page.tsx`가 구현된다
2. Story 3.3의 Published Page 컴포넌트(Hero/ValueProps/CTA)를 그대로 사용해 렌더링한다
3. Story 3.4의 법적 가드레일 Footer가 포함된다
4. 이벤트 트래킹은 미리보기 모드에서 비활성화된다 (`(operator)` route group이므로 자동 차단)
5. 편집 페이지에 "미리보기" 버튼이 있으며 새 탭으로 이동한다
6. 미리보기 URL은 Operator proxy로 보호된다

## Tasks / Subtasks

- [x] Task 1: Published Page 공유 컴포넌트 생성 (Story 3.3에서 재사용)
  - [x] `src/components/published/HeroSection.tsx`
  - [x] `src/components/published/ValueProps.tsx`
  - [x] `src/components/published/CTASection.tsx`
  - [x] `src/components/published/LegalDisclaimerFooter.tsx` (하드코딩 문구, Story 3.4에서 CI grep 완성)
- [x] Task 2: 미리보기 페이지 (AC: #1~#4)
  - [x] `src/app/(operator)/operator/ideas/[id]/preview/page.tsx`
  - [x] getIdeaById → finalPageData 없으면 안내
  - [x] Published Page 컴포넌트 + LegalDisclaimerFooter 렌더링
- [x] Task 3: "미리보기" 버튼 추가 (AC: #5)
  - [x] IdeaEditor 결과 영역에 "미리보기 ↗" 버튼 (새 탭)
- [x] Task 4: 검증
  - [x] typecheck, lint, test 통과

## Dev Notes

- LegalDisclaimerFooter: `<footer data-legal-disclaimer>` 셀렉터 포함 (Story 3.4 CI grep 대상)
- 하드코딩 문구: "⚠️ 이 서비스는 아직 출시 전입니다."
- Quick Preview(2.8)와 별도 경로 공존: quick-preview는 최소 뷰, preview는 정식 컴포넌트

### References
- [Source: epics.md#Story 3.1, 3.3, 3.4]

## Dev Agent Record
### Agent Model Used
Claude Sonnet 4.6 via Claude Code
### Completion Notes List
- Published Page 공유 컴포넌트(HeroSection, ValueProps, CTASection, LegalDisclaimerFooter)를 Story 3.1에서 선제적으로 생성해 Story 3.3에서 재사용 가능하도록 구성
- LegalDisclaimerFooter에 `data-legal-disclaimer` 속성 포함 — Story 3.4 CI grep 대상
- Quick Preview(2.8)와 별도 경로 공존: quick-preview 최소 뷰, preview 정식 컴포넌트
### File List
**생성:**
- `src/components/published/HeroSection.tsx`
- `src/components/published/ValueProps.tsx`
- `src/components/published/CTASection.tsx`
- `src/components/published/LegalDisclaimerFooter.tsx`
- `src/app/(operator)/operator/ideas/[id]/preview/page.tsx`
**수정:**
- `src/components/operator/IdeaEditor.tsx` — "미리보기 ↗" 버튼 추가
