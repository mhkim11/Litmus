# Story 3.6: 클라이언트 Tracking 유틸

Status: review

## Story

As a **System**,
I want **Published Page에서 이벤트를 안정적으로 서버로 보내는 클라이언트 유틸**,
So that **NFR-R1(데이터 수신 100%) 달성 경로가 구현된다**.

## Acceptance Criteria

1. `src/lib/utils/tracking.ts`에 `trackEvent(ideaId, eventType, metadata?)` 구현
2. `navigator.sendBeacon` 우선 시도
3. sendBeacon 실패 시 `fetch(..., { keepalive: true })` fallback
4. 브라우저 환경 가드 (`typeof window !== 'undefined'`)
5. fire-and-forget 패턴 (Promise 반환하지만 await 강제 아님)
6. 아직 어디서도 호출되지 않음 (Story 3.7에서 연결)

## Tasks / Subtasks

- [x] Task 1: trackEvent 유틸 구현
  - [x] `src/lib/utils/tracking.ts`
  - [x] sendBeacon 우선, fetch fallback
  - [x] 브라우저 환경 가드
- [x] Task 2: 검증
  - [x] typecheck, lint, test 통과

## Dev Notes

- `navigator.sendBeacon` 반환값: `false`면 fallback 실행
- payload: `JSON.stringify({ ideaId, eventType, metadata })`, Content-Type: `text/plain;charset=UTF-8` (sendBeacon 제약)
- fetch fallback: `{ method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }`
- EventType: `'page_view' | 'cta_click' | 'email_submit' | 'invalid_email'`

### References
- [Source: epics.md#Story 3.6]

## Dev Agent Record
### Agent Model Used
Claude Sonnet 4.6 via Claude Code
### Completion Notes List
- sendBeacon은 Blob(text/plain) 래핑 — Content-Type 제약 우회
- fetch fallback: keepalive:true로 페이지 언로드 중에도 전송 보장
- EventType은 DB schema에서 import — SSoT 유지
### File List
**생성:**
- `src/lib/utils/tracking.ts`
