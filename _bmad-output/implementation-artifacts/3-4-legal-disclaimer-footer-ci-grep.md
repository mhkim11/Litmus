# Story 3.4: 법적 가드레일 Footer + CI grep 검증

Status: review

## Story

As a **Visitor & Operator**,
I want **모든 Published Page 하단에 "아직 출시 전" 안내가 자동으로 표시되고, CI가 빌드 시 이를 자동 검증**,
So that **FR25, NFR-PR2, NFR-O5가 구현되어 허위표시 리스크가 차단된다**.

## Acceptance Criteria

1. `LegalDisclaimerFooter`에 하드코딩 텍스트 + `data-legal-disclaimer` 포함 (Story 3.1에서 완성)
2. `src/app/[slug]/layout.tsx`에서 Footer가 자동으로 포함된다
3. `scripts/check-legal.ts`가 소스 파일 grep으로 disclaimer 존재를 검증한다
4. `bun run check:legal` 스크립트가 누락 시 process.exit(1)으로 CI 실패
5. `/operator/ideas/[id]/preview`에도 Footer가 표시된다 (Story 3.1에서 완성)

## Tasks / Subtasks

- [x] Task 1: [slug] layout에 Footer 자동 포함
  - [x] `src/app/[slug]/layout.tsx` 생성 — LegalDisclaimerFooter 포함
- [x] Task 2: check-legal.ts 스켈레톤 완성
  - [x] 소스 파일 grep으로 `data-legal-disclaimer` 속성 확인
  - [x] `[slug]/layout.tsx`에 LegalDisclaimerFooter import 확인
  - [x] 누락 시 exit(1), 성공 시 exit(0)
- [x] Task 3: 검증
  - [x] typecheck, lint, test 통과

## Dev Notes

- LegalDisclaimerFooter + data-legal-disclaimer: Story 3.1에서 이미 구현 완료
- preview/page.tsx에도 이미 포함됨 (Story 3.1)
- check-legal.ts: 빌드 없이 소스 grep — CI에 DATABASE_URL 등 secrets 없어도 동작
- `[slug]/layout.tsx`: `src/app/layout.tsx`와 별도 — Published Page 전용 레이아웃

### References
- [Source: epics.md#Story 3.4]

## Dev Agent Record
### Agent Model Used
Claude Sonnet 4.6 via Claude Code
### Completion Notes List
- check-legal.ts: 빌드 없이 소스 파일 grep — CI secrets 없어도 동작, 4개 체크 포인트
- [slug]/layout.tsx: children + LegalDisclaimerFooter 자동 래핑 — 모든 published page에 자동 적용
- preview/page.tsx LegalDisclaimerFooter는 Story 3.1에서 이미 포함됨 (확인)
### File List
**생성:**
- `src/app/[slug]/layout.tsx`
**수정:**
- `scripts/check-legal.ts` — 스켈레톤 → 실제 grep 구현
