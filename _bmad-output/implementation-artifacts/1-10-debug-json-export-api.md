# Story 1.10: Debug JSON Export API (데이터 접근 도구)

Status: done

## Story

As a **Operator**,
I want **개발 중 DB 상태를 JSON으로 덤프할 수 있는 Operator 전용 엔드포인트**,
so that **디버깅·테스트·초기 백업 편의가 확보되고 FR51의 간이 버전이 먼저 완성된다**.

## Acceptance Criteria

1. **Given** Story 1.3의 4개 테이블과 Story 1.5의 Operator 미들웨어가 있다, **When** `src/app/api/export/route.ts`에 GET handler가 구현된다, **Then** 이 handler는 ideas + events + email_collections + llm_calls 4개 테이블 전체를 JSON으로 반환한다 (`{ ideas: [...], events: [...], email_collections: [...], llm_calls: [...] }`)
2. 응답 `Content-Type`은 `application/json; charset=utf-8`
3. 이 route는 Operator middleware가 적용된 경로에 있어 토큰 없이는 접근 불가하다
4. 에러 발생 시 500 + `{ error, code }` 응답
5. 완전한 Operator UI 다운로드 버전은 Epic 5 Story 5.5에서 확장된다 (이 스토리는 API만)

## Tasks / Subtasks

- [x] Task 1: Operator 보호 경로 설계 결정 (AC: #3)
  - [x] `src/app/(operator)/operator/api/export/route.ts` 선택 → URL: `/operator/api/export`
  - [x] proxy matcher `/operator/:path*`가 자동으로 보호 (별도 설정 불필요)
- [x] Task 2: GET handler 작성 (AC: #1, #2)
  - [x] Drizzle로 4개 테이블 Promise.all SELECT
  - [x] `{ ideas, events, email_collections, llm_calls, exported_at }` 반환
- [x] Task 3: 에러 처리 (AC: #4)
  - [x] try/catch + 500 `{ error, code }` 응답
- [x] Task 5: 로컬 테스트 (AC: #1, #2, #3, #4)
  - [x] `/operator/api/export` (쿠키 있음) → 200 + 4개 키 배열 반환 확인
  - [x] `exported_at` ISO 8601 포함 확인

## Dev Notes

**목적**:

- 개발 중 DB 상태를 한눈에 확인할 수 있는 편의 도구
- 초기 백업 수단 (수동 curl/wget으로 다운로드 가능)
- Story 5.5의 완전한 UI 버전 (다운로드 버튼 + Operator 페이지) 이전의 간이 버전

**왜 Epic 1에 있나**:

- Party Mode 결정(John 제안): JSON Export는 개발 초기에 가장 유용
- 디버깅, 테스트 데이터 검증, 스키마 확인 등에 즉시 활용
- Epic 5까지 기다리면 개발 생산성 저하

**Route handler 예시:**

```ts
// src/app/(operator)/api/export/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import {
  ideas as ideasTable,
  events as eventsTable,
  emailCollections as emailCollectionsTable,
  llmCalls as llmCallsTable,
} from '@/lib/db/schema'

export async function GET() {
  try {
    const [ideas, events, emails, llmCalls] = await Promise.all([
      db.select().from(ideasTable),
      db.select().from(eventsTable),
      db.select().from(emailCollectionsTable),
      db.select().from(llmCallsTable),
    ])

    return NextResponse.json({
      ideas,
      events,
      email_collections: emails,
      llm_calls: llmCalls,
      exported_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Export failed:', err)
    return NextResponse.json(
      { error: 'Export failed', code: 'EXPORT_ERROR' },
      { status: 500 }
    )
  }
}
```

**주의**:

- Story 1.2의 `/api/db-ping` route가 아직 남아있다면 이 스토리 완료 후 제거 고려
- Neon free tier 컴퓨트 시간 절약을 위해 자주 호출하지 말 것 (수동 디버깅 용도만)

### Project Structure Notes

- 옵션 A (권장): `src/app/(operator)/api/export/route.ts`
  - Route group 내부라 middleware 자동 보호
  - URL 경로: `/api/export` (route group은 URL에 포함 안 됨)
- **주의**: route group `(operator)` 내부에 `api/` 디렉토리가 있으면 Next.js 라우팅상 URL은 여전히 `/api/export`가 됨. middleware matcher가 `(operator)`를 감지해야 하는데, Next.js matcher는 경로 패턴 매칭이므로 실제로 URL 경로 기준으로 매칭한다. **이 점이 애매하므로 로컬 테스트로 반드시 확인 필요**.
- 애매하면 옵션 B (matcher 확장)로 전환

### References

- [Source: architecture.md#Core Architectural Decisions#결정 1] — Data Architecture
- [Source: prd.md#FR51] — JSON Export 전체 요구사항
- [Source: epics.md#Story 1.10] — 원본 AC
- [Source: (Party Mode) Epic Review] — JSON Export 조기 도입 결정

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 via Claude Code

### Debug Log References

- `/operator/api/export` → `{"ideas":[],"events":[],"email_collections":[],"llm_calls":[],"exported_at":"2026-04-06T14:11:06.195Z"}`

### Completion Notes List

- **URL 구조**: `(operator)/operator/api/export/route.ts` → URL `/operator/api/export`. proxy matcher `/operator/:path*`로 자동 보호. Options A/B 대신 이 패턴 사용.
- **Drizzle lazy init**: Story 1.7 패턴과 동일하게 `drizzle(getDb())` 함수 내부 호출.

### File List

**생성:**
- `src/app/(operator)/operator/api/export/route.ts` — JSON export GET handler (URL: /operator/api/export)
