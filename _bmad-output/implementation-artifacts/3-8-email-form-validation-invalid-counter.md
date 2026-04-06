# Story 3.8: 이메일 수집 폼 + Zod 검증 + 중복 방지 + Invalid 카운터

Status: review

## Story

As a **Visitor**,
I want **"사전 신청" 버튼 클릭 후 이메일을 입력해 제출**,
So that **FR21~FR24, FR26, FR31이 구현된다**.

## Acceptance Criteria

1. `EmailForm.tsx` 구현: CTA 클릭 후 표시, 안내 문구 + 개인정보 고지 포함
2. 유효 이메일 제출: email_collections INSERT (ON CONFLICT DO NOTHING), 성공 메시지
3. 무효 이메일: "이메일 형식이 올바르지 않습니다" + invalid_email 이벤트 전송
4. 제출은 trackEvent를 통해 Event Collector 경유
5. 서버 측: email_submit 수신 시 email_collections INSERT, 무효 metadata면 invalid_email 기록
6. 시맨틱 HTML + label 연결 + 터치 타겟 44x44px

## Tasks / Subtasks

- [x] Task 1: email_collections 쿼리 함수
  - [x] `src/lib/db/queries/emailCollections.ts` — insertEmailCollection (ON CONFLICT DO NOTHING)
- [x] Task 2: events route 업데이트
  - [x] email_submit: metadata.email 유효 → email_collections INSERT
  - [x] metadata.email 무효 → invalid_email 이벤트 기록
- [x] Task 3: EmailForm 컴포넌트 생성
  - [x] `src/components/published/EmailForm.tsx` — 'use client'
  - [x] 클라이언트 Zod 검증, 성공/에러 상태, 개인정보 고지
- [x] Task 4: CTASection 업데이트
  - [x] CTA 클릭 후 showForm 상태로 EmailForm 표시
- [x] Task 5: 검증
  - [x] typecheck, lint, test 통과

## Dev Notes

- 클라이언트 검증: `z.string().email()` — 즉시 UI 피드백
- 서버 검증(방어): email_submit metadata.email 재검증 후 email_collections INSERT
- ON CONFLICT DO NOTHING: Drizzle `.onConflictDoNothing()` 사용
- trackEvent fire-and-forget: 성공/실패 여부 무관하게 즉시 UI 전환
- 개인정보 고지 문구: "제출하신 이메일은 출시 알림 목적으로만 사용됩니다."

### References
- [Source: epics.md#Story 3.8]

## Dev Agent Record
### Agent Model Used
Claude Sonnet 4.6 via Claude Code
### Completion Notes List
- 클라이언트 먼저 검증 → UI 즉시 피드백 → trackEvent fire-and-forget
- 서버(events route)도 email_submit 재검증 → 방어적 중복 저장 방지
- CTASection: ideaId 없으면(preview) showForm 전환 안 함 — operator 경로 자동 차단
### File List
**생성:**
- `src/lib/db/queries/emailCollections.ts`
- `src/components/published/EmailForm.tsx`
**수정:**
- `src/app/api/events/route.ts` — email_submit 특별 처리 추가
- `src/components/published/CTASection.tsx` — showForm 상태 + EmailForm 렌더링
