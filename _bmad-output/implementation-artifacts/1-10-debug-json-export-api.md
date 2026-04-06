# Story 1.10: Debug JSON Export API (데이터 접근 도구)

Status: ready-for-dev

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

- [ ] Task 1: Operator 보호 경로 설계 결정 (AC: #3)
  - [ ] 옵션 A: `src/app/(operator)/api/export/route.ts` — route group 내부. middleware matcher가 `(operator)` 적용되면 자동 보호.
  - [ ] 옵션 B: `src/app/api/export/route.ts` + middleware matcher 확장 `['/(operator)/:path*', '/api/export']`
  - [ ] 옵션 A 권장 (더 깔끔)
  - [ ] **결정**: 옵션 A 선택 시 middleware matcher 조정 불필요, route group 내부로 이동
- [ ] Task 2: GET handler 작성 (AC: #1, #2)
  - [ ] Task 1에서 결정한 경로에 `route.ts` 생성
  - [ ] Drizzle로 4개 테이블 전체 SELECT:
    ```ts
    const [ideas, events, emails, llmCalls] = await Promise.all([
      db.select().from(ideasTable),
      db.select().from(eventsTable),
      db.select().from(emailCollectionsTable),
      db.select().from(llmCallsTable),
    ])
    ```
  - [ ] `NextResponse.json({ ideas, events, email_collections: emails, llm_calls: llmCalls })` 반환
- [ ] Task 3: 에러 처리 (AC: #4)
  - [ ] try/catch로 감싸기
  - [ ] catch 블록에서 `console.error(err)`, `return NextResponse.json({ error: 'Export failed', code: 'EXPORT_ERROR' }, { status: 500 })`
- [ ] Task 4: DB 쿼리 모듈로 추출 (선택, AC: #1)
  - [ ] `src/lib/db/queries/export.ts` 파일 생성
  - [ ] `exportAll()` 함수로 4개 쿼리 묶기 (Clean Architecture 관점)
  - [ ] route handler는 이 함수만 호출
- [ ] Task 5: 로컬 테스트 (AC: #1, #2, #3, #4)
  - [ ] `bun run dev`
  - [ ] 토큰 없이 `/api/export` 접근 → 401 (middleware 보호 확인)
  - [ ] `/auth?token=<OPERATOR_TOKEN>` 실행 → 쿠키 설정
  - [ ] 다시 `/api/export` 접근 → 200 + JSON
  - [ ] 응답에 4개 키 모두 존재 확인 (`ideas`, `events`, `email_collections`, `llm_calls`)
  - [ ] 각 테이블이 배열로 반환 (비어 있어도 `[]`)
- [ ] Task 6: Vercel 배포 및 확인 (AC: #3)
  - [ ] git push → Vercel 자동 배포
  - [ ] 배포 URL에서 동일 흐름 테스트

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
