# Story 3.5: Event Collector API (Edge Runtime)

Status: review

## Story

As a **System**,
I want **방문자 이벤트를 수신해 DB에 저장하는 Edge Runtime API**,
So that **FR27~FR30, NFR-R1이 구현된다**.

## Acceptance Criteria

1. `src/app/api/events/route.ts`에 POST handler, `export const runtime = 'edge'`
2. Zod 검증: `{ ideaId: UUID, eventType: enum, metadata?: object }`
3. `events` 테이블에 INSERT (서버 타임스탬프만 사용)
4. 성공 시 204 No Content (sendBeacon 호환)
5. 검증 실패 시 400
6. 인증 없음 (public), same-origin CORS
7. `src/lib/db/queries/events.ts`에 `insertEvent()` 쿼리 함수

## Tasks / Subtasks

- [x] Task 1: insertEvent 쿼리 함수
  - [x] `src/lib/db/queries/events.ts` — insertEvent({ ideaId, eventType, metadata? })
- [x] Task 2: Event Collector API Route
  - [x] `src/app/api/events/route.ts` — POST handler, runtime='edge'
  - [x] Zod 검증 (ideaId UUID, eventType enum, metadata optional)
  - [x] 204 No Content 응답
- [x] Task 3: 검증
  - [x] typecheck, lint, test 통과

## Dev Notes

- Edge Runtime: `drizzle-orm/neon-http` + `@neondatabase/serverless` 호환
- 204 응답: `new Response(null, { status: 204 })` — NextResponse.json 불필요
- metadata: `z.record(z.string(), z.unknown()).optional()` (Zod v4 breaking change 적용)
- EventType union: `'page_view' | 'cta_click' | 'email_submit' | 'invalid_email'`

### References
- [Source: epics.md#Story 3.5]

## Dev Agent Record
### Agent Model Used
Claude Sonnet 4.6 via Claude Code
### Completion Notes List
- Edge Runtime: `drizzle-orm/neon-http` + `@neondatabase/serverless` HTTP 클라이언트 호환
- 204 응답: `new Response(null, { status: 204 })` — sendBeacon에서 응답 body 불필요
- JSON 파싱 실패 / Zod 검증 실패 모두 400 반환
### File List
**생성:**
- `src/lib/db/queries/events.ts`
- `src/app/api/events/route.ts`
