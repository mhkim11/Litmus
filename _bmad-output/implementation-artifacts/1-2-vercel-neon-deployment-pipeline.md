# Story 1.2: Vercel + Neon 배포 파이프라인 구축

Status: ready-for-dev

## Story

As a **Operator**,
I want **GitHub 리포지토리와 Vercel + Neon을 연결한 첫 배포 파이프라인**,
so that **`main` 브랜치에 push하면 자동으로 Vercel에 배포되고 Neon DB에 접근 가능하다**.

## Acceptance Criteria

1. **Given** Story 1.1의 프로젝트가 로컬에 존재한다, **When** GitHub에 리포지토리를 생성하고 초기 커밋을 push한다, **Then** Vercel Dashboard에서 리포지토리를 Import Project로 연결하고 자동 배포가 트리거된다
2. Neon Dashboard에서 `blog-practice` 프로젝트를 생성하고 connection string을 획득한다
3. `.env.local`에 `DATABASE_URL=<neon connection string>`이 설정되어 있다
4. Vercel Environment Variables에 동일한 `DATABASE_URL`이 등록되어 있다
5. 배포된 URL(예: `blog-practice.vercel.app`)에서 Next.js 환영 페이지가 HTTPS로 접근 가능하다
6. `src/lib/db/client.ts`에 `@neondatabase/serverless` 기반 클라이언트가 초기화되어 있고, 테스트 route(`/api/db-ping` 임시)에서 `SELECT 1`이 성공한다

## Tasks / Subtasks

- [ ] Task 1: GitHub 리포지토리 생성 및 초기 push (AC: #1)
  - [ ] GitHub에서 `blog-practice` 리포지토리 생성 (public 또는 private)
  - [ ] 로컬에서 `git init && git add . && git commit -m "initial commit"` (Story 1.1에서 이미 되어 있다면 스킵)
  - [ ] `git remote add origin <repo-url>`
  - [ ] `git push -u origin main`
- [ ] Task 2: Vercel 프로젝트 연결 (AC: #1)
  - [ ] vercel.com 접속 → GitHub 로그인
  - [ ] "Import Project" → blog-practice 리포지토리 선택
  - [ ] 기본 설정으로 Deploy 클릭
  - [ ] 배포 성공 확인
- [ ] Task 3: Neon 프로젝트 생성 (AC: #2)
  - [ ] neon.tech 접속 → 계정 생성/로그인
  - [ ] 새 프로젝트 "blog-practice" 생성 (리전: 가까운 곳)
  - [ ] 기본 DB 생성 후 Connection Details에서 connection string 복사 (pooled connection 권장)
- [ ] Task 4: 로컬 환경변수 설정 (AC: #3)
  - [ ] 프로젝트 루트에 `.env.local` 생성
  - [ ] `DATABASE_URL=<neon connection string>` 한 줄 추가
  - [ ] `.gitignore`에 `.env.local` 포함 확인 (Next.js 기본 포함)
- [ ] Task 5: Vercel 환경변수 등록 (AC: #4)
  - [ ] Vercel Dashboard → Project → Settings → Environment Variables
  - [ ] `DATABASE_URL` 추가, Production/Preview/Development 모두 체크
  - [ ] 변경 후 Redeploy 트리거 (Deployments → 최신 배포 → Redeploy)
- [ ] Task 6: DB 연결 확인 route 구현 (AC: #6)
  - [ ] `bun add @neondatabase/serverless` 설치
  - [ ] `src/lib/db/client.ts` 작성 — Neon serverless 클라이언트 초기화
  - [ ] `src/app/api/db-ping/route.ts` 작성 — GET handler로 `SELECT 1` 실행 후 JSON 반환
  - [ ] 로컬에서 `bun run dev` → `localhost:3000/api/db-ping` → `{"ok": true, "result": 1}` 확인
  - [ ] Vercel 배포 URL에서도 동일 확인
- [ ] Task 7: 배포 URL 접근 확인 (AC: #5)
  - [ ] Vercel 배포 URL 접속 (HTTPS 자동)
  - [ ] Next.js 환영 페이지 정상 렌더링 확인

## Dev Notes

**Architecture 참조:**

- Hosting: Vercel Hobby (무료 티어) — 대역폭 100GB/월, 함수 100GB-Hrs
- DB: Neon Postgres Free — 스토리지 0.5GB, 컴퓨트 191h/월, 브랜치 10개
- **주의**: Neon Free tier는 비활성 시 자동 일시정지하지만 재개가 즉시. Supabase와 달리 1주 제약 없음.

**`src/lib/db/client.ts` 예시 (Architecture Implementation Patterns 참조):**

```ts
import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

export const sql = neon(process.env.DATABASE_URL)
```

**`src/app/api/db-ping/route.ts` 예시:**

```ts
import { sql } from '@/lib/db/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await sql`SELECT 1 as value`
    return NextResponse.json({ ok: true, result: result[0].value })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }
}
```

**임시 파일**: `/api/db-ping`은 Story 1.3 완료 후 제거 가능 (Drizzle로 대체됨).

### Project Structure Notes

- `src/lib/db/client.ts` — Architecture 문서의 Project Structure에 정의된 위치 그대로
- `src/app/api/db-ping/route.ts` — 임시 경로, Story 1.3 이후 제거 대상

### References

- [Source: architecture.md#Starter Template Evaluation#Selected Starter] — Neon vs Supabase 선정 근거
- [Source: architecture.md#Core Architectural Decisions#결정 8] — DB 스키마 및 client 위치
- [Source: architecture.md#Implementation Patterns#Structure Patterns] — `src/lib/db/` 디렉토리 컨벤션
- [Source: epics.md#Story 1.2] — 원본 AC

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
