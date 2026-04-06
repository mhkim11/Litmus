# Story 1.2: Vercel + Neon 배포 파이프라인 구축

Status: review

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

- [x] Task 1: GitHub 리포지토리 생성 및 초기 push (AC: #1)
  - [x] GitHub에서 `Litmus` 리포지토리 생성 (Mhkim - Private) — 브랜드명 반영해 `litmus`로 생성
  - [x] 로컬에서 초기 커밋 (Story 1.1 + 1.2 코드 전체 bundled commit)
  - [x] `git remote add origin https://github.com/mhkim11/Litmus.git`
  - [x] `git push -u origin main` 성공
- [x] Task 2: Vercel 프로젝트 연결 (AC: #1)
  - [x] vercel.com 접속 → GitHub 로그인 (Mhkim 계정 생성)
  - [x] "Import Project" → Litmus 리포지토리 선택
  - [x] Application Preset을 "Other"에서 **"Next.js"로 수정** (초기 오류 수정)
  - [x] Deploy 클릭 → 배포 성공
- [x] Task 3: Neon 프로젝트 생성 (AC: #2)
  - [x] neon.tech 접속 → Mhkim 계정 생성/로그인
  - [x] 새 프로젝트 생성, 리전 **AWS Asia Pacific (Seoul)** 선택
  - [x] Connection Details에서 connection string 복사 (direct connection — pooled 권장이지만 작동 확인)
- [x] Task 4: 로컬 환경변수 설정 (AC: #3)
  - [x] 프로젝트 루트에 `.env.local` 생성 (gitignore 확인)
  - [x] `DATABASE_URL=<neon connection string>` 추가
  - [x] `.gitignore`에 `.env.local.example` 예외 규칙 추가 (`.env*` 패턴이 예제 파일까지 무시하던 이슈 해결)
- [x] Task 5: Vercel 환경변수 등록 (AC: #4)
  - [x] Vercel Dashboard → Project 설정 → Environment Variables
  - [x] `DATABASE_URL` 추가 (Production + Preview + Development 모두 체크)
  - [x] Deploy 트리거
- [x] Task 6: DB 연결 확인 route 구현 (AC: #6)
  - [x] `bun add @neondatabase/serverless` 설치 (@neondatabase/serverless@1.0.2)
  - [x] `src/lib/db/client.ts` 작성 — `neon(DATABASE_URL)` 기반 클라이언트 + env var validation
  - [x] `src/app/api/db-ping/route.ts` 작성 — GET handler, `SELECT 1 as value` 쿼리, JSON 응답
  - [x] 로컬 검증: `curl http://localhost:3003/api/db-ping` → `{"ok":true,"result":1}` (1164ms 첫 콜드 스타트)
  - [x] Vercel 배포 검증: `curl https://litmus-tks5.vercel.app/api/db-ping` → `{"ok":true,"result":1}` (HTTP 200)
- [x] Task 7: 배포 URL 접근 확인 (AC: #5)
  - [x] Vercel 배포 URL: `https://litmus-tks5.vercel.app/`
  - [x] HTTPS 자동 적용 확인
  - [x] Litmus 브랜드 홈 페이지 렌더링 확인 (`<title>Litmus</title>`, `lang="ko"`, `noindex, nofollow` 메타)

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

Claude Opus 4.6 (1M context) via Claude Code

### Debug Log References

- `/tmp/nextjs-dev.log` — dev 서버 로그 (Neon 첫 연결 1164ms)
- Vercel 배포 로그: Dashboard의 Deployments 탭에서 확인 가능

### Completion Notes List

- **GitHub 리포 이름**: `Litmus` (대문자 L) — Mhkim이 브랜딩 결정으로 내부 codename(`blog-practice`)과 외부 제품명(`Litmus`)을 분리. 폴더/PRD는 `blog-practice`, GitHub/Vercel/package.json은 `litmus`.
- **Vercel Preset 오류 수정**: 초기 Import 시 "Other"로 잘못 선택되어 Next.js 자동 감지 실패. "Next.js" preset으로 변경 후 정상 배포.
- **Neon Connection**: Direct connection 사용 중 (`ep-lucky-resonance-a1144s69.ap-southeast-1.aws.neon.tech`, Seoul 리전). Pooled connection이 서버리스에 더 권장되지만 direct도 정상 작동 확인. 향후 트래픽 증가 시 pooled로 교체 가능.
- **보안 노트**: 초기 개발용 DB credential이 채팅 로그에 노출됨. MVP 실제 사용 전에 Neon 대시보드에서 비밀번호 rotation 권장 (또는 프로덕션용 별도 DB 분리).
- **`.gitignore` 이슈 수정**: Next.js 스타터의 `.env*` 패턴이 `.env.local.example`까지 무시하던 이슈 발견. `!.env.local.example` + `!.env.example` 예외 규칙 추가.
- **브랜딩 업데이트**: package.json name → `litmus`, README → Litmus 소개, `src/app/page.tsx` → Litmus 홈, layout metadata → title "Litmus" + description + `robots: noindex/nofollow`, `<html lang="ko">`.
- **`noindex, nofollow` 조기 적용**: FR54는 원래 `[slug]/page.tsx`에만 적용이지만, 개발 중 루트 페이지도 검색엔진에 노출되면 안 되므로 layout.tsx 레벨에서 기본 적용. 이후 Published Page 구현 시 일관성 유지.
- **성능 측정**: 로컬 Neon RTT 1164ms (첫 콜드 스타트), Vercel 서버리스 → Neon RTT는 응답 속도로 볼 때 1초 미만. NFR-P5 충족 기대.

### File List

**생성:**
- `src/lib/db/client.ts` — Neon serverless 클라이언트
- `src/app/api/db-ping/route.ts` — 임시 health check endpoint (Story 1.3 이후 제거 가능)
- `.env.local.example` — DATABASE_URL 템플릿 + 향후 변수 주석
- `.env.local` — 실제 DATABASE_URL (gitignore, 커밋 안 됨)

**수정:**
- `.gitignore` — `!.env.local.example`, `!.env.example` 예외 추가
- `package.json` — `name`을 `blog-practice`에서 `litmus`로 변경, `@neondatabase/serverless@1.0.2` 추가
- `bun.lock` — 의존성 반영
- `README.md` — Litmus 소개로 교체
- `src/app/page.tsx` — Next.js 스타터 홈 → Litmus 브랜드 홈 (`next/image` 제거)
- `src/app/layout.tsx` — metadata title/description/robots, `html lang="ko"` 설정

**삭제:** 없음

**외부 설정 (코드 아님):**
- GitHub: https://github.com/mhkim11/Litmus (Private 리포)
- Vercel: Litmus 프로젝트 import, DATABASE_URL env var 등록, 자동 배포 활성화
- Neon: Seoul 리전 프로젝트, connection string 획득

### Change Log

- 2026-04-06: Story 1.2 완료 — Vercel + Neon 파이프라인 구축. 배포 URL `https://litmus-tks5.vercel.app` 가동. `/api/db-ping` 로컬과 배포 환경 모두 `{"ok":true,"result":1}` 반환 확인. 브랜딩 `blog-practice` → `Litmus` 외부 식별 분리.
