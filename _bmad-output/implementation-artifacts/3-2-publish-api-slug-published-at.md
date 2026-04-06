# Story 3.2: Publish API + slug 생성 + active 전환 + published_at + URL 복사

Status: review

## Story

As a **Operator**,
I want **"발행" 버튼 클릭 시 slug가 할당되고 상태가 active로 전환되며 최초 발행 시각이 기록되고 URL을 바로 복사할 수 있다**,
So that **FR13, FR14, FR17, FR18이 구현되며 Journey 1.5(데이터 공백기 메시지)가 참조할 `published_at` 타임스탬프가 확보된다**.

## Acceptance Criteria

1. `src/app/api/ideas/[id]/publish/route.ts`에 POST handler가 구현된다
2. `src/lib/utils/slug.ts`의 `generateSlug()` 유틸로 고유 slug를 생성한다
3. 최초 발행: `slug`, `status='active'`, `published_at=NOW()` 동시 설정
4. 재발행(slug 이미 존재): `status='active'`만 업데이트 (slug, published_at 불변)
5. 응답: `{ id, slug, publishedUrl: string, publishedAt: string }`
6. 편집 페이지에 "발행" 버튼이 있으며 클릭 후 성공 시 URL을 clipboard에 복사하고 토스트 표시
7. 발행 후 페이지가 published 상태를 반영한다

## Tasks / Subtasks

- [x] Task 1: slug 유틸 생성
  - [x] `src/lib/utils/slug.ts` — `generateSlug()` (crypto 기반, nanoid 불필요)
- [x] Task 2: DB 쿼리 함수 추가
  - [x] `publishIdea(id)` → queries/ideas.ts (slug 유무에 따른 분기)
- [x] Task 3: Publish API Route 구현
  - [x] `src/app/api/ideas/[id]/publish/route.ts` — POST handler
  - [x] slug 없으면 생성 + SET slug, status='active', published_at
  - [x] slug 있으면 SET status='active'만
  - [x] 응답: `{ id, slug, publishedUrl, publishedAt }`
- [x] Task 4: IdeaEditor UI 업데이트
  - [x] `initialStatus`, `initialSlug` props 추가
  - [x] "발행" 버튼 추가 (결과 영역 액션 버튼)
  - [x] 발행 성공 시 clipboard 복사 + 토스트 "URL이 클립보드에 복사되었습니다"
  - [x] `src/app/(operator)/operator/ideas/[id]/page.tsx` — 새 props 전달
- [x] Task 5: 검증
  - [x] typecheck, lint, test 통과

## Dev Notes

- `generateSlug()`: `crypto.randomUUID().replace(/-/g, '').slice(0, 8)` — 8자 hex, 외부 의존성 없음
- `publishedUrl`: `new URL(request.url).origin + '/' + slug` — 서버 요청에서 origin 추출
- 재발행 시 slug 트리거 보호(Story 1.4) + 코드 레벨 분기 모두 유지
- Toast: setTimeout 3초 후 자동 소멸, `useState<string | null>`
- `publishMutation`: `useMutation` 별도 인스턴스, `onSuccess`에서 clipboard + toast

### References
- [Source: epics.md#Story 3.2]

## Dev Agent Record
### Agent Model Used
Claude Sonnet 4.6 via Claude Code
### Completion Notes List
- `generateSlug()`: crypto.randomUUID() 기반 8자 hex slug — 외부 의존성 없음
- 최초 발행 / 재발행 분기: publishIdea(신규) / republishIdea(기존) 쿼리 함수로 명확히 분리
- IdeaEditor: `initialSlug` prop으로 이미 발행된 아이디어도 올바르게 UI 반영
- Toast: 3초 후 자동 소멸, clipboard 실패 시 조용히 무시
### File List
**생성:**
- `src/lib/utils/slug.ts`
- `src/app/api/ideas/[id]/publish/route.ts`
**수정:**
- `src/lib/db/queries/ideas.ts` — publishIdea(), republishIdea() 추가
- `src/components/operator/IdeaEditor.tsx` — 발행 버튼, 토스트, publishedSlug 상태
- `src/app/(operator)/operator/ideas/[id]/page.tsx` — initialStatus, initialSlug props 전달
