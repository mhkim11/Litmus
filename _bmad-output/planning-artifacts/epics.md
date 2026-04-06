---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
status: 'final'
completed: '2026-04-06'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/product-brief-blog-practice.md
workflowType: 'epics'
project_name: 'blog-practice'
---

# blog-practice - Epic Breakdown

## Overview

이 문서는 **blog-practice**의 완전한 Epic 및 Story 분해를 제공한다. PRD(55 FR + 24 NFR)와 Architecture(확정 스택, 스키마, 파일 구조, 패턴)에서 도출된 요구사항을 구현 가능한 스토리로 쪼갠다.

**Primary Stack**: Next.js 15 + Bun + Neon Postgres + Drizzle ORM + Anthropic Claude + Vercel
**Target Builder**: Mhkim (1인, 비개발자) + AI 어시스턴트 (Claude Code / Cursor)
**MVP 완료 기준**: PRD "MVP 완료의 공식 정의" 3개 조건 (기능 완료 + 실사용 3개 + 심리적 완료)

## Requirements Inventory

### Functional Requirements

PRD에서 추출한 55개 FR:

**Idea Creation (FR1~FR7, FR55)**
- FR1: Operator는 한 줄 프롬프트를 입력해 새 아이디어 생성을 시작할 수 있다
- FR2: Operator는 프롬프트 외에 선택적 "지시문(instructions)"을 별도 필드로 제공할 수 있다
- FR3: 시스템은 프롬프트(+ 지시문)를 LLM에 전달해 구조화된 랜딩페이지 데이터(히어로 카피, 서브 카피, 3개 가치제안, CTA 문구, 이메일 폼 라벨)를 생성한다
- FR4: 시스템은 LLM 생성 결과가 정의된 스키마와 일치하는지 검증한다
- FR5: 시스템은 LLM 생성 진행 중에 Operator에게 현재 상태와 대기 안내를 표시한다
- FR6: Operator는 진행 중인 LLM 생성 요청을 취소할 수 있다
- FR7: 시스템은 LLM 생성 실패 또는 스키마 불일치 시 명확한 오류 메시지와 함께 재시도 옵션을 제공한다
- FR55: 시스템은 LLM 호출 전 월간 누적 비용을 확인하고, 월 예산 상한을 초과할 경우 LLM 호출을 차단한다 (Hard Kill Switch)

**Idea Editing (FR8~FR12)**
- FR8: Operator는 생성된 결과를 보고 동일한 프롬프트로 재생성할 수 있다
- FR9: Operator는 프롬프트 또는 지시문을 수정해 재생성할 수 있다
- FR10: Operator는 생성된 텍스트 필드를 인라인으로 직접 수정할 수 있다
- FR11: 시스템은 재생성 시 이전 버전을 보존하지 않고 최신 버전으로 덮어쓴다
- FR12: 시스템은 각 아이디어에 대해 최종 프롬프트와 최종 페이지 데이터 1쌍만 영구 저장한다

**Publishing (FR13~FR19)**
- FR13: Operator는 생성/편집된 아이디어를 공개 URL로 발행할 수 있다
- FR14: 시스템은 발행 시 아이디어에 고유한 slug를 할당하고, 아이디어의 수명 동안 변경되지 않는다
- FR15: 시스템은 발행된 페이지에 OG 메타데이터(title, description, image)를 자동으로 포함시킨다
- FR16: 시스템은 발행된 페이지를 모바일 반응형으로 렌더링한다
- FR17: Operator는 발행 직후 URL을 클립보드에 복사할 수 있다
- FR18: Operator는 이미 발행된 아이디어를 재편집 후 재발행해도 URL이 유지되어야 한다
- FR19: Operator는 발행 전 생성된 랜딩페이지를 방문자 시점 미리보기로 확인할 수 있다

**Published Page Experience (FR20~FR26)**
- FR20: Visitor는 발행된 URL로 접속해 랜딩페이지 콘텐츠를 볼 수 있다
- FR21: Visitor는 페이지에서 "사전 신청하기" 버튼을 탭/클릭할 수 있다
- FR22: Visitor는 이메일 주소를 입력해 제출할 수 있다
- FR23: 시스템은 이메일 제출 성공 시 확인 메시지를 표시한다
- FR24: 시스템은 이메일 형식이 잘못된 경우 명확한 오류 안내를 표시한다
- FR25: 시스템은 모든 "사전 신청"/CTA 버튼 후 "아직 출시 전입니다" 안내 문구를 표시한다 (Operator가 편집할 수 없음)
- FR26: 시스템은 이메일 수집 폼 아래에 개인정보 수집 고지 문구를 표시한다

**Data Collection (FR27~FR32)**
- FR27: 시스템은 방문자가 발행된 페이지를 열 때 PV 이벤트를 기록한다
- FR28: 시스템은 방문자가 "사전 신청" 버튼을 탭/클릭할 때 CTA 클릭 이벤트를 기록한다
- FR29: 시스템은 방문자가 이메일을 제출할 때 이메일 제출 이벤트를 기록한다
- FR30: 각 이벤트는 아이디어 ID, 타임스탬프, 이벤트 타입, 선택적 메타데이터와 함께 저장된다
- FR31: 시스템은 유효하지 않은 이메일 형식 제출 시도도 Invalid Email 이벤트로 별도 집계한다
- FR32: 시스템은 클라이언트사이드 이벤트 수집 실패를 대비해 서버사이드 백업 카운트를 수행한다

**Dashboard & Comparison (FR33~FR41)**
- FR33: Operator는 대시보드에서 모든 활성(Active) 아이디어를 표 형태로 볼 수 있다
- FR34: 대시보드는 각 아이디어별로 PV, CTA 클릭 수, 이메일 수집 수를 나란히 표시한다
- FR35: Operator는 대시보드의 아이디어 목록을 지표 기준으로 정렬할 수 있다
- FR36: Operator는 대시보드에서 각 아이디어의 발행 URL로 이동할 수 있다
- FR37: Operator는 대시보드에서 Archived 섹션을 별도로 확인할 수 있다
- FR38: Operator는 특정 아이디어의 수집된 이메일 목록을 열람할 수 있다
- FR39: 대시보드는 아이디어가 하나도 없는 초기 상태에서 Operator에게 첫 아이디어 생성 가이드(empty state)를 제공한다
- FR40: 시스템은 발행 후 경과 시간과 수집된 데이터 양에 따라 시간 기반 상태 메시지를 대시보드에 표시한다
- FR41: 시스템은 PV가 최소 샘플 사이즈 미만일 때 전환율 표시를 억제하거나 경고 문구를 함께 표시한다

**Archive & Delete Workflow (FR42~FR47)**
- FR42: Operator는 Active 상태의 아이디어를 Archive로 전환할 수 있다
- FR43: 시스템은 Archive 전환 전 Confirm 다이얼로그를 표시해 의도를 재확인한다
- FR44: 시스템은 Archive된 아이디어에 대해서도 기존 수집 데이터를 그대로 보존한다
- FR45: 시스템은 Archive된 아이디어의 발행 URL을 계속 유효하게 유지한다
- FR46: Operator는 Archived 상태의 아이디어를 Active로 복원할 수 있다
- FR47: Operator는 아이디어를 완전히 삭제할 수 있다 (Confirm 다이얼로그 필수)

**Data Management (FR48~FR51)**
- FR48: 시스템은 아이디어별로 id, slug, status, final_prompt, final_page_data, created_at, updated_at, archived_at, noindex 필드를 저장한다
- FR49: 시스템은 각 이벤트를 id, idea_id, event_type, metadata, created_at 필드로 저장한다
- FR50: 시스템은 아이디어의 편집 상태(draft 포함)를 자동으로 저장한다
- FR51: Operator는 모든 아이디어와 이벤트 데이터를 JSON 형식으로 내보낼 수 있다

**System Integrity (FR52~FR54)**
- FR52: 시스템은 slug의 DB 수준 유일성(unique) 제약을 강제한다
- FR53: 시스템은 LLM API 호출 실패 시 재시도 로직을 수행한다
- FR54: 시스템은 모든 발행된 페이지에 기본적으로 noindex 메타 태그를 포함한다

### NonFunctional Requirements

PRD에서 추출한 24개 NFR:

**Performance**
- NFR-P1: 발행된 랜딩페이지 LCP < 2.5초 (Chrome DevTools "4G Slow" + Moto G4)
- NFR-P2: Published Page JS 번들 크기 < 50KB gzip
- NFR-P3: 발행 파이프라인 속도 (LLM 완료 ~ URL 사용 가능) p50 < 60초
- NFR-P4: LLM 생성 호출 p95 < 30초 (초과 시 상태 안내)
- NFR-P5: 대시보드 초기 로딩 < 3초 (아이디어 100개 기준)

**Reliability**
- NFR-R1: 서버 수신 이벤트 100% 저장 + `navigator.sendBeacon` 사용
- NFR-R2: slug 100% 불변 (DB 레벨 강제)
- NFR-R3: LLM 호출 실패 시 자동 재시도 1회 + 오류 안내
- NFR-R4: Draft 자동저장 (blur 또는 idle 10초)
- NFR-R5: 발행된 페이지 가용성 = 호스팅 SLA 수용

**Security**
- NFR-S1: HTTPS 필수
- NFR-S2: 이메일 평문 저장 + at-rest encryption 활성화
- NFR-S3: Secret은 환경변수/secret store에만
- NFR-S4: Visitor 정보는 이메일만 수집 (최소 수집)
- NFR-S5: Operator Console 환경변수 기반 토큰 접근 제어

**Privacy**
- NFR-PR1: 개인정보 수집 고지 문구 항상 표시
- NFR-PR2: "아직 출시 전" 안내 시스템 강제, LLM 카피 덮어쓰기 불가
- NFR-PR3: 수집된 이메일은 수집 목적 외 사용 금지

**Accessibility**
- NFR-A1: 텍스트 대비율 WCAG AA 4.5:1
- NFR-A2: 모바일 터치 타겟 최소 44x44px
- NFR-A3: 폼 요소 명시적 `<label>` 연결
- NFR-A4: 시맨틱 HTML 사용 강제

**Maintainability**
- NFR-M1: AI 어시스턴트 친화 스택 (Architecture 재해석)
- NFR-M2: 단일 리포지토리
- NFR-M3: 5분 이내 로컬 재구축
- NFR-M4: README 한 페이지 미니멀
- NFR-M5: TypeScript 전면 적용

**Observability**
- NFR-O1: LLM 호출 로그 (요청 ID, 토큰, 비용, 성공/실패)
- NFR-O2: 이벤트 수집 감사 로그 (원본 보존)
- NFR-O3: Error tracking (Sentry) — Critical 경로
- NFR-O4: 비용 모니터링 + Hard Kill Switch
- NFR-O5: "아직 출시 전" 자동 검증 (CI grep)

### Additional Requirements

Architecture 문서에서 추출한 구현 요건:

**Starter Template 설정:**
- Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- Bun 1.x 패키지 매니저 + 런타임
- 초기화 명령: `bunx create-next-app@latest blog-practice --typescript --tailwind --app --src-dir --import-alias "@/*" --turbopack --use-bun`

**핵심 의존성:**
- `drizzle-orm` + `@neondatabase/serverless` (DB)
- `@anthropic-ai/sdk` (LLM)
- `zod` (스키마 검증, Single Source of Truth)
- `@tanstack/react-query` (서버 상태)
- `zustand` (로컬 편집 상태)
- `vitest` + `@testing-library/react` (테스트)

**인프라 & 배포:**
- Neon Postgres 프로젝트 생성 (Free tier)
- Vercel Hobby 배포 (GitHub 자동 연동)
- Sentry 무료 티어 (`instrumentation.ts`)
- GitHub Actions CI (typecheck + lint + test + legal grep + Lighthouse)

**DB 스키마 (4 테이블):**
- `ideas` (id, slug [unique + immutable trigger], status enum, final_prompt, final_page_data [jsonb], noindex, timestamps, archived_at)
- `events` (id, idea_id, event_type enum, metadata jsonb, created_at)
- `email_collections` (id, idea_id, email, created_at, unique on (idea_id, email))
- `llm_calls` (id, idea_id, provider, model, tokens, cost_usd, duration_ms, success, error_message, created_at)

**Postgres 수동 마이그레이션:**
- slug 불변성 트리거 (`prevent_slug_update`) — `drizzle/custom/slug_immutable.sql`

**Runtime 분리:**
- `/api/events` → Edge Runtime (`export const runtime = 'edge'`)
- 그 외 Route Handler → Node Runtime (기본값)

**Core 파일 구조 (일부):**
- `src/middleware.ts` (Operator 토큰 보호)
- `src/app/(operator)/**` (Route group, middleware 적용)
- `src/app/[slug]/page.tsx` (Published Page 동적 라우트)
- `src/lib/llm/{generate.ts, budget.ts, gateway.ts}` (LLM Gateway)
- `src/lib/db/{client.ts, schema.ts, queries/**}` (DB 액세스 층)
- `src/lib/schemas/landing.ts` (Zod SSoT)
- `src/lib/hooks/useDraftAutoSave.ts`
- `src/components/{shared, operator, published}/**` (엄격 분리)
- `scripts/check-legal.ts` (CI grep)
- `.github/workflows/ci.yml`
- `CLAUDE.md` (AI 어시스턴트 규칙)

**환경변수 4개 (`.env.local`):**
- `DATABASE_URL` (Neon 연결 문자열)
- `ANTHROPIC_API_KEY`
- `OPERATOR_TOKEN` (`openssl rand -hex 32`로 생성)
- `MAX_MONTHLY_USD` (기본 50)

**패턴 규칙 (Step 5 Implementation Patterns → CLAUDE.md 복사):**
- 네이밍: snake_case DB / camelCase TS / PascalCase 컴포넌트
- API 응답: data direct return + `{error, code}` 에러 형식
- 테스트 co-location
- `components/operator/` ↔ `components/published/` 코드 공유 금지
- Zod = SSoT
- Provider abstraction 없음 (함수 1개가 경계)
- `enum` 대신 TypeScript union
- 로컬 스토리지 draft 금지 (서버만)

### UX Design Requirements

UX Design 문서 없음 (이 제품은 텍스트 중심, 이미지 없는 미니멀 UI라 별도 UX spec 불필요).
단, 다음 UX 관련 요구는 PRD/Architecture에 내재:

- 발행 전 Visitor 시점 미리보기 (FR19)
- 데이터 공백기 상태 메시지 (FR40, Journey 1.5)
- Archive confirm dialog + 따뜻한 문구 (FR43, Journey 5)
- Empty state 첫 아이디어 가이드 (FR39)
- Published Page mobile-first + 이미지 없음

### FR Coverage Map

| FR | Epic | 설명 |
|---|---|---|
| FR1~FR7 | Epic 2 | Idea Creation (프롬프트 → 생성 + 상태/취소/재시도) |
| FR8~FR12 | Epic 2 | Idea Editing (3 경로 + 덮어쓰기) |
| FR13~FR18 | Epic 3 | Publishing (slug, URL, OG, 반응형, 복사, URL 불변) |
| FR19 | Epic 3 | 발행 전 미리보기 |
| FR20~FR24 | Epic 3 | Visitor UX (페이지 보기, CTA, 이메일 입력/검증) |
| FR25, FR26 | Epic 3 | 법적 가드레일 (disclaimer + 개인정보 고지) |
| FR27~FR32 | Epic 3 | Data Collection (PV/CTA/이메일/Invalid + 서버백업) |
| FR33~FR36 | Epic 4 | Dashboard (목록 표, 지표, 정렬, URL 이동) |
| FR37 | Epic 5 (+ Epic 4) | Archived 섹션 분리 표시 |
| FR38 | Epic 4 | 이메일 목록 열람 |
| FR39 | Epic 4 | Empty State 가이드 |
| FR40 | Epic 4 | 시간 기반 상태 메시지 |
| FR41 | Epic 4 | 최소 샘플 사이즈 전환율 억제 |
| FR42~FR46 | Epic 5 | Archive 워크플로우 |
| FR47 | Epic 5 | 완전 삭제 |
| FR48 | Epic 1 | ideas 테이블 스키마 |
| FR49 | Epic 1 | events 테이블 스키마 |
| FR50 | Epic 2 | Draft 자동저장 |
| FR51 | Epic 1 (debug) + Epic 5 (완전) | JSON Export |
| FR52 | Epic 1 | slug unique 제약 + 트리거 |
| FR53 | Epic 1 (기반) + Epic 2 (적용) | LLM 재시도 로직 |
| FR54 | Epic 3 | noindex 기본값 |
| FR55 | Epic 1 (기반) + Epic 2 (적용) | Kill Switch |

**모든 55개 FR 매핑 완료 ✅**

## Epic List

### Epic 1: Foundation — 프로젝트 세팅 & 가드레일

**Goal**: 프로젝트가 로컬과 프로덕션에서 돌아가고, DB 스키마 + 가드레일 + 핵심 라이브러리가 준비된다. 완료 시점에 "잠긴 빈 앱"이 Vercel URL에서 돌아간다.

**Stories (10개):**

- 1.1 Next.js 15 + Bun 프로젝트 생성
- 1.2 Vercel + Neon 배포 파이프라인 (첫 "Hello, World" 배포)
- 1.3 Drizzle 설정 + 4 테이블 스키마 (`published_at` 컬럼 포함) 마이그레이션
- 1.4 slug 불변성 Postgres 트리거 (수동 마이그레이션)
- 1.5 Operator 토큰 middleware + /auth route
- 1.6 LLM 호출 베이스 (Anthropic SDK 함수) + Zod 스키마 정의 (SSoT)
- 1.7 Kill Switch 순수 함수 + 통합 함수 + llm_calls 로깅
- 1.8 CLAUDE.md + .env.local.example + README + .gitignore (문서/설정)
- 1.9 GitHub Actions CI 스켈레톤 + check-legal.ts 스켈레톤 + Sentry 설치 (품질 인프라)
- 1.10 Debug JSON Export API (데이터 접근 도구)

**FRs covered**: FR48, FR49, FR51 (debug), FR52, FR53 (기반), FR55 (기반)
**NFRs covered**: NFR-M1~M5, NFR-S1, NFR-S3, NFR-S5, NFR-O1, NFR-O3, NFR-O4, NFR-R2

### Epic 2: Idea Creation & Workspace

**Goal**: Operator가 한 줄 프롬프트로 AI 생성 랜딩페이지를 받고, 편집하고, 최소한의 브라우저 확인과 자기 아이디어 목록을 경험한다. **Walking Skeleton 완성** — end-to-end 경로가 처음으로 작동한다.

**Stories (9개):**

- 2.1 새 아이디어 draft 즉시 생성 API + Empty State UI
- 2.2 PromptEditor 컴포넌트 (프롬프트 + 지시문 2-field)
- 2.3 LLM 호출 + tool_use structured output + Zod 검증 (Kill Switch 미적용 상태의 생성 경로)
- 2.4 Kill Switch 통합 + llm_calls 로깅 연결
- 2.5 생성 진행 상태 UI + 취소 기능
- 2.6 Draft 자동저장 (blur + 10s idle) + 저장 실패 경로 처리
- 2.7 편집 3경로 (재생성 / 프롬프트 수정 재생성 / 인라인 텍스트 편집)
- 2.8 Smoke Preview — 별도 route로 pageData HTML 노출 (Walking Skeleton)
- 2.9 Minimal Dashboard — draft + active 목록만 (중간 체크포인트)

**FRs covered**: FR1~FR12, FR50, FR55 (적용), FR53 (적용)
**NFRs covered**: NFR-P4, NFR-R3, NFR-R4

### Epic 3: Publishing & Data Pipeline

**Goal**: 제대로 된 Published Page와 데이터 수집 파이프라인이 한 덩어리로 완성된다. Mhkim이 실제로 광고 트래픽을 받을 수 있는 상태. (이전 Epic 3 + Epic 4 병합)

**Stories (10개):**

- 3.1 발행 전 미리보기 (Visitor 시점)
- 3.2 Publish API + slug 생성 + active 전환 + published_at 설정 + URL 복사
- 3.3 Published Page 렌더링 (Hero / Value Props / CTA 컴포넌트)
- 3.4 법적 가드레일 Footer (하드코딩, LLM 변경 불가) + CI grep 완성
- 3.5 Event Collector API (Edge runtime)
- 3.6 클라이언트 Tracking 유틸 (sendBeacon + fetch fallback)
- 3.7 PV + CTA 클릭 이벤트 연결
- 3.8 이메일 수집 폼 + Zod 검증 + 중복 방지 + Invalid Email 카운터
- 3.9 OG 메타데이터 + 모바일 반응형 + noindex + 재발행 URL 유지 (콘텐츠/동작)
- 3.10 Lighthouse CI + 번들 크기 검증 (성능 게이트)

**FRs covered**: FR13~FR32, FR54
**NFRs covered**: NFR-P1, NFR-P2, NFR-P3, NFR-R1, NFR-S1, NFR-A1~A4, NFR-PR1, NFR-PR2, NFR-O2

### Epic 4: Dashboard & Decision Making

**Goal**: Minimal Dashboard(Epic 2.8)를 완전한 의사결정 도구로 확장한다. Journey 1(일요일 저녁)과 Journey 1.5(데이터 공백기)의 핵심 경험 구현.

**Stories (7개):**

- 4.1 지표 집계 쿼리 + Dashboard 확장 (PV/CTA/이메일 표시)
- 4.2 지표 기준 정렬 기능
- 4.3 시간 기반 상태 메시지 (Journey 1.5)
- 4.4 최소 샘플 사이즈 미만 전환율 억제
- 4.5 아이디어별 이메일 목록 뷰
- 4.6 LLM 비용 모니터링 표시 (NFR-O4 UI)
- 4.7 Empty State 가이드 개선 (Epic 2.1 확장)

**FRs covered**: FR33~FR36, FR38~FR41
**NFRs covered**: NFR-P5

### Epic 5: Lifecycle Management

**Goal**: Archive, Delete, 완전한 JSON Export로 MVP 라이프사이클을 닫는다. Journey 5("아이디어 놓아주기")의 해방감 완성.

**Stories (5개):**

- 5.1 Archive API + 상태 전환 + Confirm Dialog
- 5.2 Dashboard Archived 섹션 통합
- 5.3 Archived → Active 복원
- 5.4 완전 삭제 API + Confirm Dialog + cascade
- 5.5 JSON Export 완전 버전 (Operator Console UI + 다운로드)

**FRs covered**: FR37, FR42~FR47, FR51 (완전)
**NFRs covered**: (이전 Epic에서 처리)

### Epic Summary

- **Total Epics**: 5
- **Total Stories**: **41** (10 + 9 + 10 + 7 + 5) ★ Party Mode 반영으로 37 → 41
- **Build Order**: Epic 1 → 2 → 3 → 4 → 5
- **Key Checkpoints**:
  - Epic 1 완료: 잠긴 빈 앱 (인프라 기반)
  - Epic 2 완료: **Walking Skeleton** (end-to-end 작동, 비개발자 확신의 순간)
  - Epic 3 완료: **MVP 실질 시작점** (광고 돌려 데이터 쌓을 수 있음)
  - Epic 4 완료: **MVP 핵심 가치** (데이터 기반 의사결정)
  - Epic 5 완료: MVP 완결 (정리/삭제/백업)

**Build 중단 안전 포인트**: Epic 3 완료 시점에 실제 사용 시작 가능. Epic 4~5는 "정돈" 성격이라 필요시 Epic 3 완료 후 실사용 후 진행.

---

## Epic 1: Foundation — 프로젝트 세팅 & 가드레일

**Goal**: 프로젝트가 로컬과 프로덕션에서 돌아가고, DB 스키마 + 가드레일 + 핵심 라이브러리가 준비된다. Epic 완료 시점에 "잠긴 빈 앱"이 Vercel URL에서 접근 가능하고, Neon DB가 연결되며, AI 어시스턴트를 위한 가이드라인이 자리잡는다.

### Story 1.1: Next.js 15 + Bun 프로젝트 생성

As a **Operator (Mhkim)**,
I want **Next.js 15 App Router 프로젝트를 Bun 기반으로 초기화**,
So that **표준 Next.js 개발 환경에서 로컬로 `bun run dev`를 실행할 수 있다**.

**Acceptance Criteria:**

**Given** 로컬 개발 환경에 Bun 1.x와 Git이 설치되어 있다
**When** `bunx create-next-app@latest blog-practice --typescript --tailwind --app --src-dir --import-alias "@/*" --turbopack --use-bun` 명령을 실행한다
**Then** `blog-practice/` 디렉토리가 생성되고 `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`가 포함된다
**And** `cd blog-practice && bun run dev` 명령으로 `localhost:3000`에서 Next.js 기본 환영 페이지가 렌더링된다
**And** `bun run build && bun run start`로 프로덕션 빌드도 성공한다
**And** TypeScript `strict: true`가 tsconfig에 활성화되어 있다

### Story 1.2: Vercel + Neon 배포 파이프라인 구축

As a **Operator**,
I want **GitHub 리포지토리와 Vercel + Neon을 연결한 첫 배포 파이프라인**,
So that **`main` 브랜치에 push하면 자동으로 Vercel에 배포되고 Neon DB에 접근 가능하다**.

**Acceptance Criteria:**

**Given** Story 1.1의 프로젝트가 로컬에 존재한다
**When** GitHub에 리포지토리를 생성하고 초기 커밋을 push한다
**Then** Vercel Dashboard에서 리포지토리를 Import Project로 연결하고 자동 배포가 트리거된다
**And** Neon Dashboard에서 `blog-practice` 프로젝트를 생성하고 connection string을 획득한다
**And** `.env.local`에 `DATABASE_URL=<neon connection string>`이 설정되어 있다
**And** Vercel Environment Variables에 동일한 `DATABASE_URL`이 등록되어 있다
**And** 배포된 URL(예: `blog-practice.vercel.app`)에서 Next.js 환영 페이지가 HTTPS로 접근 가능하다
**And** `src/lib/db/client.ts`에 `@neondatabase/serverless` 기반 클라이언트가 초기화되어 있고, 테스트 route(`/api/db-ping` 임시)에서 `SELECT 1`이 성공한다

### Story 1.3: Drizzle 설정 + 4 테이블 스키마 마이그레이션

As a **Operator**,
I want **Drizzle ORM으로 4개 테이블(ideas, events, email_collections, llm_calls)의 스키마를 정의하고 Neon에 마이그레이션**,
So that **이후 모든 Story가 안정된 DB 스키마 위에서 구현될 수 있다**.

**Acceptance Criteria:**

**Given** Story 1.2까지 Neon DB 연결이 확인된 상태
**When** `bun add drizzle-orm @neondatabase/serverless && bun add -D drizzle-kit`로 의존성을 설치한다
**Then** `drizzle.config.ts`가 프로젝트 루트에 생성되어 Neon DATABASE_URL을 참조한다
**And** `src/lib/db/schema.ts`에 `ideas`, `events`, `email_collections`, `llm_calls` 4개 테이블이 Architecture 문서의 스키마와 정확히 일치하게 정의된다
**And** `ideas` 테이블에 `published_at TIMESTAMP` 컬럼이 포함된다 (nullable, 발행 시점 기록용 — Journey 1.5 데이터 공백기 메시지가 이 값을 참조)
**And** `bunx drizzle-kit generate`로 첫 마이그레이션 SQL 파일이 `drizzle/` 디렉토리에 생성된다
**And** `bunx drizzle-kit migrate`로 Neon에 마이그레이션이 적용되고 4개 테이블이 실제로 생성된다
**And** 각 테이블의 인덱스(`ideas_slug_idx`, `events_idea_id_created_at_idx`, `email_collections_idea_email_idx`, `llm_calls_created_at_idx`)가 포함되어 있다
**And** `ideas.status` 컬럼이 enum 타입 `'draft' | 'active' | 'archived'`로 정의되고 기본값이 `'draft'`이다

### Story 1.4: slug 불변성 Postgres 트리거 마이그레이션

As a **Operator**,
I want **slug 필드의 UPDATE를 거부하는 Postgres 트리거를 DB에 배포**,
So that **NFR-R2(URL 불변성 100%)가 DB 수준에서 강제되며, 애플리케이션 버그로도 slug가 바뀌지 않는다**.

**Acceptance Criteria:**

**Given** Story 1.3의 테이블이 존재한다
**When** `drizzle/custom/slug_immutable.sql` 파일에 `prevent_slug_update()` 함수와 `ideas_slug_immutable` 트리거 SQL을 작성한다
**Then** 해당 SQL을 Neon에 수동으로 적용한다 (psql 또는 Neon SQL Editor)
**And** 기존 `ideas` row의 `slug`를 `UPDATE`로 변경하려는 시도는 `slug is immutable` 예외로 거부된다
**And** 새 row `INSERT` 시에는 정상 작동한다
**And** `updated_at` 같은 다른 필드 UPDATE는 정상 작동한다
**And** 이 마이그레이션은 README의 "Setup" 섹션에 수동 적용 절차로 문서화된다

### Story 1.5: Operator 토큰 middleware + /auth route

As a **Operator**,
I want **환경변수 토큰으로 Operator Console을 보호하는 middleware와 토큰 교환 route**,
So that **NFR-S5(접근 제어)가 구현되어 외부인이 Operator Console에 접근할 수 없다**.

**Acceptance Criteria:**

**Given** `.env.local`에 `OPERATOR_TOKEN=<openssl rand -hex 32로 생성한 값>`이 설정되어 있다
**When** `src/middleware.ts`에 Next.js middleware를 작성하여 `(operator)` route group을 보호한다
**Then** `/operator` 류 경로 접근 시 쿠키의 `op-token`이 `OPERATOR_TOKEN`과 일치하지 않으면 401 Unauthorized가 반환된다
**And** `src/app/auth/route.ts`에 GET handler가 존재해 `?token=<value>` 쿼리 파라미터를 받아 `OPERATOR_TOKEN`과 비교한다
**And** 일치 시 `op-token` 쿠키를 `httpOnly, secure, sameSite=lax, maxAge 1년`으로 설정하고 `/operator`로 리다이렉트한다
**And** 불일치 시 401 Unauthorized를 반환한다
**And** Vercel Environment Variables에도 `OPERATOR_TOKEN`이 등록되어 있다
**And** 임시 페이지 `src/app/(operator)/page.tsx`에 "Operator Console Placeholder" 텍스트가 표시되고, 토큰 없이 접근하면 차단된다

### Story 1.6: LLM 호출 베이스 함수 + Zod 스키마 정의

As a **Operator**,
I want **Anthropic Claude를 호출하는 단일 함수와 LandingPageData Zod 스키마 정의 (Single Source of Truth)**,
So that **이후 Epic 2의 LLM 생성 기능이 이 베이스 위에 구축될 수 있다**.

**Acceptance Criteria:**

**Given** `bun add @anthropic-ai/sdk zod`로 의존성이 설치되어 있다
**And** `.env.local`에 `ANTHROPIC_API_KEY`가 설정되어 있다
**When** `src/lib/schemas/landing.ts`에 `LandingPageData` Zod 스키마를 정의한다 (히어로 카피, 서브 카피, 3개 가치제안, CTA 문구, 이메일 폼 라벨 필드 포함)
**Then** `z.infer<typeof LandingPageData>`로 TypeScript 타입이 자동 추론된다
**And** `src/lib/llm/generate.ts`에 `async function generateLanding(prompt: string, instructions?: string): Promise<LandingPageData>` 함수가 구현된다
**And** 이 함수는 Anthropic SDK의 `messages.create()` + `tool_use`를 사용해 structured output을 받는다
**And** 응답은 `LandingPageData.parse()`로 검증되며 실패 시 `ZodError`를 throw한다
**And** 이 함수는 아직 Kill Switch나 로깅을 적용하지 않는다 (Story 1.7에서 통합)
**And** 간단한 테스트 스크립트 또는 임시 route로 `generateLanding("퇴근 후 15분 코딩 챌린지")` 호출이 성공하는 것을 확인한다

### Story 1.7: Kill Switch 순수 함수 + 통합 + llm_calls 로깅

As a **Operator**,
I want **월 예산 초과 시 LLM 호출을 차단하는 Kill Switch와 호출 로깅**,
So that **NFR-O4(비용 모니터링 + Hard Kill Switch)와 NFR-O1(LLM 호출 로그)이 구현된다**.

**Acceptance Criteria:**

**Given** Story 1.6의 `generateLanding` 함수가 존재한다
**And** `.env.local`에 `MAX_MONTHLY_USD=50`과 `KILL_SWITCH_OVERRIDE=false`가 설정되어 있다
**When** `src/lib/llm/budget.ts`에 `isBudgetExceeded(currentMonthUsage, maxBudget, overrideEnabled)` 순수 함수를 구현한다
**Then** 이 함수는 DB 의존 없이 순수 계산만 하며 `src/lib/llm/budget.test.ts`에 유닛 테스트가 있다 (overflow, override 등 케이스 포함)
**And** `src/lib/llm/gateway.ts`에 `checkAndEnforceBudget()` 함수가 구현되어 `llm_calls` 테이블에서 이번 달 cost_usd 합산을 쿼리하고, `isBudgetExceeded`로 판정 후 초과 시 `BudgetExceededError`를 throw한다
**And** `src/lib/db/queries/llmCalls.ts`에 `logLLMCall(params)` 함수가 구현되어 provider, model, tokens, cost_usd, duration_ms, success 등을 `llm_calls` 테이블에 INSERT한다
**And** `generateLanding` 함수가 호출 전 `checkAndEnforceBudget()`를 실행하고, 호출 후 `logLLMCall()`을 실행하도록 업데이트된다
**And** `BudgetExceededError`는 별도 클래스로 정의되어 `name`과 `usage, max` 필드를 가진다
**And** 임시 테스트로 DB에 cost_usd 합계가 MAX_MONTHLY_USD를 초과하는 row들을 삽입한 뒤 `generateLanding` 호출이 `BudgetExceededError`로 실패하는지 확인한다

### Story 1.8: CLAUDE.md + 환경변수 템플릿 + README + .gitignore (문서/설정)

As a **Operator**,
I want **AI 어시스턴트 가이드와 프로젝트 메타 문서가 자리잡음**,
So that **Claude Code/Cursor가 세션 시작 시마다 규칙을 자동 로드하고 NFR-M4(미니멀 README)가 충족된다**.

**Acceptance Criteria:**

**Given** Epic 1의 Story 1.1~1.7이 완료되었다
**When** Architecture 문서의 "Implementation Patterns & Consistency Rules" 섹션을 프로젝트 루트의 `CLAUDE.md`로 복사한다
**Then** `CLAUDE.md`는 Naming/Structure/Format/Communication/Process Patterns와 Enforcement Guidelines 6개 MUST 규칙을 포함한다
**And** `.env.local.example` 파일이 `DATABASE_URL`, `ANTHROPIC_API_KEY`, `OPERATOR_TOKEN`, `MAX_MONTHLY_USD`, `KILL_SWITCH_OVERRIDE` 5개 변수 템플릿과 주석으로 작성되어 있다
**And** `.gitignore`에 `.env.local`, `.next`, `node_modules` 등이 적절히 추가되어 있다
**And** `README.md`가 5줄 이내로 (1) 로컬 실행법 (2) 배포 방법 (3) 주요 디렉토리 구조 (4) 주요 의존성 목적을 기록한다

### Story 1.9: GitHub Actions CI 스켈레톤 + check-legal 스켈레톤 + Sentry (품질 인프라)

As a **Operator**,
I want **기본 CI 파이프라인과 에러 트래킹이 자리잡음**,
So that **NFR-O3(Error tracking)와 NFR-O5(법적 가드레일 자동 검증 기반)가 충족되고, 이후 Epic 3에서 확장 가능하다**.

**Acceptance Criteria:**

**Given** Story 1.8이 완료되어 CLAUDE.md와 환경변수 템플릿이 있다
**When** `.github/workflows/ci.yml`이 작성된다
**Then** CI는 `bun install → bun run typecheck → bun run lint → bun run test` 순서로 실행된다
**And** CI는 `main` 브랜치 push 및 모든 PR에 대해 트리거된다
**And** `scripts/check-legal.ts`는 스켈레톤만 존재한다 (실제 grep 로직은 Epic 3 Story 3.4에서 완성). 지금은 "TODO: Epic 3 Story 3.4에서 구현" 주석과 함께 `process.exit(0)`만 수행
**And** `package.json` scripts에 `"check:legal"`이 등록되어 있지만 실제로는 아직 아무것도 검증하지 않는다
**And** `bun add @sentry/nextjs`로 Sentry가 설치된다
**And** `src/instrumentation.ts`에 Sentry 초기화 코드가 있다 (Next.js 15 표준)
**And** Sentry DSN은 환경변수 `SENTRY_DSN`에서 읽어 오며, 환경변수가 없어도 앱은 정상 작동한다 (개발 환경에서 Sentry 없이도 OK)

### Story 1.10: Debug JSON Export API (데이터 접근 도구)

As a **Operator**,
I want **개발 중 DB 상태를 JSON으로 덤프할 수 있는 Operator 전용 엔드포인트**,
So that **디버깅·테스트·초기 백업 편의가 확보되고 FR51의 간이 버전이 먼저 완성된다**.

**Acceptance Criteria:**

**Given** Story 1.3의 4개 테이블과 Story 1.5의 Operator 미들웨어가 있다
**When** `src/app/api/export/route.ts`에 GET handler가 구현된다
**Then** 이 handler는 ideas + events + email_collections + llm_calls 4개 테이블 전체를 JSON으로 반환한다 (`{ ideas: [...], events: [...], email_collections: [...], llm_calls: [...] }`)
**And** 응답 `Content-Type`은 `application/json; charset=utf-8`
**And** 이 route는 Operator middleware가 적용된 경로에 있어 토큰 없이는 접근 불가하다 (예: `/api/export`가 `(operator)` group 내부이거나, 별도로 middleware matcher 확장)
**And** 에러 발생 시 500 + `{ error, code }` 응답
**And** 완전한 Operator UI 다운로드 버전은 Epic 5 Story 5.5에서 확장된다 (이 스토리는 API만)

---

## Epic 2: Idea Creation & Workspace

**Goal**: Operator가 한 줄 프롬프트로 AI 생성 랜딩페이지를 받고, 편집하고, 최소한의 브라우저 확인과 자기 아이디어 목록을 경험한다. **Walking Skeleton** 완성 — end-to-end 경로가 처음으로 작동하는 체크포인트.

### Story 2.1: 새 아이디어 draft 즉시 생성 API + Empty State UI

As a **Operator**,
I want **"새 아이디어" 버튼 클릭 시 즉시 draft row가 DB에 생성되고 편집 페이지로 이동**,
So that **"없는 id vs 있는 id" 상태 머신 없이 단순한 흐름으로 시작할 수 있다 (FR50 기반)**.

**Acceptance Criteria:**

**Given** Operator가 토큰 인증된 상태로 Operator Console 메인(`/operator`)에 접속한다
**When** `src/app/api/ideas/route.ts`에 POST handler가 구현되어 빈 draft row를 생성한다
**Then** 이 handler는 `INSERT INTO ideas (status) VALUES ('draft') RETURNING id`로 새 row를 만들고 id를 반환한다 (slug는 null 또는 임시값)
**And** 반환 형식은 `{ id: string, status: 'draft', createdAt: string }`이다 (direct data return, wrapper 없음)
**And** `src/app/(operator)/page.tsx`에 "새 아이디어 만들기" 버튼이 있으며 클릭 시 `POST /api/ideas`를 호출하고 응답의 `id`로 `/operator/ideas/{id}`로 리다이렉트한다
**And** 아이디어가 0개일 때 Empty State 컴포넌트(`src/components/shared/EmptyState.tsx`)가 표시되어 "첫 아이디어를 만들어보세요" 가이드 메시지를 보여준다 (FR39)
**And** 이 Empty State는 Story 4.7에서 확장될 기반이다

### Story 2.2: PromptEditor 컴포넌트 (프롬프트 + 지시문 2-field)

As a **Operator**,
I want **한 줄 프롬프트와 선택적 지시문을 입력하는 편집 UI**,
So that **FR1, FR2(프롬프트 입력과 지시문 분리)가 구현된다**.

**Acceptance Criteria:**

**Given** Story 2.1에서 draft가 생성된 후 `/operator/ideas/[id]`에 진입한 상태
**When** `src/components/operator/PromptEditor.tsx` 컴포넌트가 구현된다
**Then** 이 컴포넌트는 두 개의 textarea를 제공한다: "프롬프트" (필수, 한 줄) + "지시문 (선택)" (여러 줄)
**And** 각 textarea는 명시적 `<label>`과 연결되어 있다 (NFR-A3)
**And** "생성하기" 버튼이 있으며, 프롬프트가 비어 있으면 비활성화된다
**And** 현재 컴포넌트는 서버 호출을 하지 않고 로컬 state만 관리한다 (실제 생성은 Story 2.3에서 연결)
**And** 컴포넌트는 `'use client'` 지시자로 클라이언트 컴포넌트이다

### Story 2.3: LLM 호출 + structured output + Zod 검증 (순수 생성 경로)

As a **Operator**,
I want **"생성하기" 버튼이 실제 LLM 호출로 연결되어 랜딩페이지 데이터를 받아오는 기본 경로**,
So that **FR3, FR4, FR7, FR53 적용이 구현된다. Kill Switch 통합은 Story 2.4에서 분리 처리**.

**Acceptance Criteria:**

**Given** Story 1.6의 `generateLanding` 함수가 존재한다 (Kill Switch 미적용 상태)
**When** `src/app/api/ideas/[id]/generate/route.ts`에 POST handler가 구현된다
**Then** 이 handler는 Node runtime으로 `export const runtime = 'nodejs'` 명시
**And** request body에서 `{ prompt, instructions? }`를 Zod로 검증한다
**And** `generateLanding(prompt, instructions)`를 호출하며 실패 시 1회 자동 재시도 (NFR-R3)
**And** 반환된 `LandingPageData`를 `ideas` 테이블의 `final_prompt`, `final_instructions`, `final_page_data` 컬럼에 저장 (UPDATE)
**And** 최종 응답은 `LandingPageData` JSON을 반환한다
**And** PromptEditor 컴포넌트(2.2)가 "생성하기" 버튼 클릭 시 TanStack Query `useMutation`으로 이 API를 호출한다
**And** 2회 재시도 실패 시 에러가 UI에 표시되며 "다시 생성" 버튼이 나타난다 (FR7)
**And** 이 스토리 완료 시점에 Kill Switch는 아직 적용되지 않았으므로 비용 초과 시 차단되지 않는다 (Story 2.4에서 해결)

### Story 2.4: Kill Switch 통합 + llm_calls 로깅 연결

As a **Operator**,
I want **Story 2.3의 생성 경로에 Kill Switch와 LLM 호출 로깅이 통합됨**,
So that **FR55와 NFR-O1, NFR-O4가 완전히 구현되어 비용 폭주로부터 안전하다**.

**Acceptance Criteria:**

**Given** Story 2.3의 generate route가 동작하고 Story 1.7의 `checkAndEnforceBudget`, `logLLMCall`이 존재한다
**When** `src/app/api/ideas/[id]/generate/route.ts`가 업데이트된다
**Then** `generateLanding` 호출 직전에 `checkAndEnforceBudget()`가 호출된다
**And** `BudgetExceededError`가 throw되면 429 상태로 `{ error, code: 'BUDGET_EXCEEDED', usage, max }` 반환한다
**And** LLM 호출 완료 직후 (성공/실패 무관) `logLLMCall()`이 provider, model, promptTokens, completionTokens, costUsd, durationMs, success, errorMessage 필드로 `llm_calls` 테이블에 기록한다
**And** 비용 계산은 Anthropic 공개 단가 기준으로 `src/lib/llm/pricing.ts` 모듈에 하드코딩된 값을 사용한다 (모델별)
**And** UI는 `code: 'BUDGET_EXCEEDED'` 응답 수신 시 "이번 달 LLM 예산을 초과했습니다. `.env.local`의 `MAX_MONTHLY_USD`를 조정하거나 다음 달까지 기다려주세요." 안내 표시
**And** 수동으로 `llm_calls` 테이블에 cost_usd 합계가 `MAX_MONTHLY_USD` 초과 row를 삽입한 뒤 새 생성 호출이 429로 차단되는지 확인한다

### Story 2.5: 생성 진행 상태 UI + 취소 기능

As a **Operator**,
I want **LLM 생성 중에 진행 상태를 보고 원하면 취소할 수 있다**,
So that **FR5, FR6이 구현되고 Journey 2(점심시간 15분)의 "너무 오래 걸림" 상황에 빠져나갈 수 있다**.

**Acceptance Criteria:**

**Given** Story 2.4까지 LLM 호출 경로가 Kill Switch 통합 완료된 상태
**When** `src/components/operator/GenerationProgress.tsx` 컴포넌트가 구현된다
**Then** LLM 호출 시작부터 응답/에러까지 이 컴포넌트가 화면에 표시된다 (예: "아이디어를 만들고 있어요... (N초 경과)")
**And** 30초 이상 경과 시 "평소보다 오래 걸립니다" 추가 안내가 표시된다 (NFR-P4)
**And** "취소" 버튼이 있으며 클릭 시 `AbortController.abort()`로 진행 중인 fetch를 취소한다
**And** 취소된 경우 UI는 원래 상태(PromptEditor)로 복귀하고 DB에는 아무것도 저장되지 않는다 (또는 진행 중 row는 그대로 두되 에러 로깅)
**And** 취소 후 다시 "생성하기"를 누르면 새로 호출할 수 있다

### Story 2.6: Draft 자동저장 (blur + 10s idle) + 저장 실패 경로

As a **Operator**,
I want **편집 중인 프롬프트/지시문이 blur 또는 10초 idle 시 자동 저장되며, 저장 실패 시 명확한 안내와 복구 경로**,
So that **NFR-R4 충족 및 네트워크 장애·서버 오류 상황에서도 데이터 손실이 방지된다**.

**Acceptance Criteria:**

**Given** Story 2.1의 draft row가 있고 PromptEditor(2.2)에서 편집 중이다
**When** `src/lib/hooks/useDraftAutoSave.ts` 커스텀 훅이 구현된다
**Then** 이 훅은 `ideaId`와 `formState`(prompt, instructions)를 받아 다음 조건에 자동 PATCH를 수행한다:
- (a) 필드 blur 이벤트 발생 시 즉시
- (b) 타이핑 멈춘 후 10초 경과 시 (debounce)
**And** `src/app/api/ideas/[id]/draft/route.ts`에 PATCH handler가 구현되어 `{ finalPrompt?, finalInstructions? }`를 Zod 검증 후 UPDATE한다
**And** PromptEditor 컴포넌트가 이 훅을 사용한다
**And** 새로고침 또는 다른 브라우저에서 `/operator/ideas/[id]` 접근 시 최신 draft 상태가 복원된다
**And** 저장 중·완료 상태를 작은 indicator로 표시한다 (예: "저장됨" / "저장 중...")
**And** **저장 실패 경로**: 네트워크 실패, 서버 5xx, 4xx 에러 수신 시 indicator가 빨간색 "❌ 저장 실패" 상태로 변경되고, 명시적 "다시 저장" 버튼이 노출된다
**And** **저장 실패 상태에서 페이지 이탈 시**: `beforeunload` 이벤트 리스너가 브라우저 기본 경고("변경사항이 저장되지 않았습니다. 정말 나가시겠습니까?")를 띄워 데이터 손실을 방지한다
**And** 저장 성공 시에는 `beforeunload` 리스너가 해제된다 (경고 오작동 방지)

### Story 2.7: 편집 3경로 (재생성 / 프롬프트 수정 / 인라인 편집)

As a **Operator**,
I want **생성된 결과를 세 가지 경로로 편집: (a) 같은 프롬프트로 재생성 (b) 프롬프트 수정 후 재생성 (c) 생성된 텍스트 필드 직접 인라인 편집**,
So that **FR8, FR9, FR10이 구현되며 Journey 2의 "복구" 경로가 작동한다**.

**Acceptance Criteria:**

**Given** Story 2.4까지 LLM 생성 결과가 화면에 표시된 상태
**When** 결과 표시 영역에 "재생성", "프롬프트 수정", "직접 편집" 3개 액션이 제공된다
**Then** "재생성" 클릭 시 동일한 `POST /api/ideas/[id]/generate`를 다시 호출하고 결과로 `final_page_data`를 덮어쓴다 (FR11)
**And** "프롬프트 수정" 클릭 시 PromptEditor 필드가 다시 활성화되어 편집 후 재생성 가능하다
**And** `src/components/operator/InlineEditor.tsx`로 생성된 각 텍스트 필드(hero, valueProps, cta 등)가 `contentEditable` 방식으로 인라인 편집 가능하다
**And** 인라인 편집 결과는 `useDraftAutoSave`(2.6)를 통해 `final_page_data`에 저장된다 (덮어쓰기)
**And** 편집 히스토리는 저장되지 않는다 (FR11, Decision 8)

### Story 2.8: Smoke Preview — 별도 route로 pageData HTML 노출 (Walking Skeleton)

As a **Operator**,
I want **생성된 아이디어를 Operator 전용 임시 경로에서 브라우저로 확인**,
So that **Walking Skeleton이 완성되어 "내가 만든 것이 웹에 존재한다"는 것을 중간 체크포인트에서 확인할 수 있고, Epic 3 Story 3.3의 정식 Published Page와 경로 충돌 없이 공존 가능하다**.

**Acceptance Criteria:**

**Given** Story 2.7까지 완료되어 아이디어가 `final_page_data`를 갖춘 상태
**When** `src/app/(operator)/ideas/[id]/quick-preview/page.tsx`가 구현된다 (별도 route, `src/app/[slug]/page.tsx`와 충돌하지 않음)
**Then** 이 페이지는 Operator middleware로 보호된 `(operator)` route group 내부에 있다
**And** URL 파라미터의 `[id]`로 DB에서 `ideas` row를 조회한다
**And** `final_page_data` JSON을 최소한의 HTML로 렌더링한다 (hero 제목, 서브 카피, 3개 가치제안, CTA 문구만 — 스타일링 최소)
**And** 디자인은 Tailwind 기본값만 사용하고 별도 컴포넌트화는 하지 않는다 (Epic 3 Story 3.3에서 정식 컴포넌트가 구축됨)
**And** 이메일 폼, 이벤트 수집, 법적 가드레일 footer 등은 포함하지 않는다
**And** 편집 페이지에 "Quick Preview 열기" 버튼이 있어 이 경로로 새 탭 이동 가능하다
**And** 이 route는 Epic 3 완료 후에도 유지되며, 정식 Published Page(`src/app/[slug]/page.tsx`)와 독립적으로 존재한다 (Operator 전용 내부 미리보기)
**And** 이 스토리 완료 시점에 Operator가 "한 줄 프롬프트 → 생성 → 편집 → 브라우저에서 확인"의 end-to-end 경로를 완주한다

### Story 2.9: Minimal Dashboard — draft + active 목록

As a **Operator**,
I want **내가 만든 아이디어 목록을 대시보드에서 확인**,
So that **자기 아이디어로 돌아올 수 있고 "내가 지금까지 만든 것"을 한 화면에서 볼 수 있다**.

**Acceptance Criteria:**

**Given** Story 2.1~2.8까지 완료되어 DB에 draft 또는 active 상태의 아이디어가 존재할 수 있다
**When** `src/app/(operator)/page.tsx`가 업데이트되어 draft + active 상태의 아이디어 목록을 테이블로 표시한다
**Then** 목록은 `SELECT * FROM ideas WHERE status IN ('draft', 'active') ORDER BY updated_at DESC`로 조회한다
**And** 각 row는 최소한 id, final_prompt 앞 50자 요약, status, updated_at를 표시한다
**And** 각 row 클릭 시 `/operator/ideas/[id]`로 이동한다
**And** "새 아이디어 만들기" 버튼이 여전히 존재한다 (Story 2.1)
**And** 아이디어가 없으면 Story 2.1의 Empty State가 표시된다
**And** 이 Dashboard는 아직 지표(PV/CTA/이메일) 표시나 정렬 기능은 없다 (Epic 4에서 확장)
**And** 이 스토리 완료 시점에 Mhkim은 "내가 만든 아이디어 앱"이라는 완결된 경험을 가진다 (Walking Skeleton + 중간 체크포인트)

---

## Epic 3: Publishing & Data Pipeline

**Goal**: 제대로 된 Published Page와 데이터 수집 파이프라인이 한 덩어리로 완성된다. Epic 완료 시점에 Mhkim이 실제로 광고 트래픽을 받아 데이터를 쌓을 수 있는 MVP 실질 시작점에 도달한다.

### Story 3.1: 발행 전 미리보기 (Visitor 시점)

As a **Operator**,
I want **발행 버튼을 누르기 전에 방문자가 보게 될 실제 화면을 미리 확인**,
So that **FR19가 구현되어 안심하고 광고에 URL을 붙일 수 있다**.

**Acceptance Criteria:**

**Given** Story 2.6까지 편집 완료된 아이디어(final_page_data 보유)가 있다
**When** `src/app/(operator)/ideas/[id]/preview/page.tsx`가 구현된다
**Then** 이 페이지는 Story 3.3의 Published Page 컴포넌트를 그대로 사용해 렌더링한다 (동일한 Hero/ValueProps/CTA 컴포넌트)
**And** Story 3.4의 법적 가드레일 Footer가 포함된다
**And** 이벤트 트래킹(Story 3.5~3.7)은 미리보기 모드에서 비활성화된다 (쿼리 파라미터 `?preview=true` 또는 `(operator)` route group이기 때문에 자동 차단)
**And** 편집 페이지에 "미리보기" 버튼이 있으며 이 페이지로 새 탭 열기로 이동한다
**And** 미리보기 URL은 Operator middleware로 보호되어 외부 접근 불가하다

### Story 3.2: Publish API + slug 생성 + active 전환 + published_at + URL 복사

As a **Operator**,
I want **"발행" 버튼 클릭 시 slug가 할당되고 상태가 active로 전환되며 최초 발행 시각이 기록되고 URL을 바로 복사할 수 있다**,
So that **FR13, FR14, FR17, FR18이 구현되며 Journey 1.5(데이터 공백기 메시지)가 참조할 `published_at` 타임스탬프가 확보된다**.

**Acceptance Criteria:**

**Given** 아이디어가 `status='draft'`이고 `final_page_data`가 완성된 상태
**When** `src/app/api/ideas/[id]/publish/route.ts`에 POST handler가 구현된다
**Then** 이 handler는 `src/lib/utils/slug.ts`의 `generateSlug()` 유틸로 고유 slug를 생성한다 (id 기반 nanoid 또는 단어 기반)
**And** `UPDATE ideas SET slug=?, status='active', published_at=NOW() WHERE id=? AND slug IS NULL`로 slug 할당 + 상태 전환 + 발행 시각 기록을 동시에 수행한다
**And** 이미 `slug`가 있는 아이디어(재발행 시나리오)는 slug와 `published_at`을 바꾸지 않고 `status='active'`만 유지한다 (FR18). 즉 최초 발행 시각이 보존된다.
**And** Postgres 트리거(Story 1.4) 덕분에 기존 slug의 UPDATE 시도는 DB 수준에서 거부된다
**And** 응답은 `{ id, slug, publishedUrl: string, publishedAt: string }`을 반환한다
**And** 편집 페이지에 "발행" 버튼이 있으며 클릭 시 호출 후 성공 시 URL을 `navigator.clipboard.writeText()`로 복사하고 "URL이 클립보드에 복사되었습니다" 토스트 표시
**And** `/operator/ideas/[id]` 페이지는 발행 후 status 변경을 반영한다

### Story 3.3: Published Page 렌더링 (Hero / Value Props / CTA 컴포넌트)

As a **Visitor**,
I want **발행된 URL에서 깔끔한 랜딩페이지 콘텐츠를 본다**,
So that **FR20이 구현되고 Story 2.7의 임시 페이지가 정식 버전으로 대체된다**.

**Acceptance Criteria:**

**Given** Story 3.2로 slug가 할당된 active 아이디어가 DB에 존재한다
**When** `src/app/[slug]/page.tsx`가 정식 버전으로 구현된다
**Then** 이 페이지는 `src/components/published/HeroSection.tsx`, `ValueProps.tsx`, `CTASection.tsx`를 사용한다
**And** 각 컴포넌트는 `final_page_data`에서 해당 필드를 받아 시맨틱 HTML로 렌더링한다 (`<h1>`, `<section>`, `<button>` 등)
**And** 모바일 우선 Tailwind 레이아웃을 적용한다 (NFR-A2 44x44px 터치 타겟 포함)
**And** 이 페이지는 서버 컴포넌트이며 (기본), DB 조회는 `src/lib/db/queries/ideas.ts`의 `getIdeaBySlug(slug)`를 사용한다
**And** slug가 존재하지 않으면 404를 반환한다 (Next.js `notFound()`)
**And** Story 2.7의 임시 렌더링 로직은 제거된다
**And** 이 시점에는 아직 법적 가드레일 Footer, 이메일 폼, 이벤트 수집이 없다 (후속 Story)

### Story 3.4: 법적 가드레일 Footer + CI grep 검증

As a **Visitor & Operator**,
I want **모든 Published Page 하단에 "아직 출시 전" 안내가 자동으로 표시되고, CI가 빌드 시 이를 자동 검증**,
So that **FR25, NFR-PR2, NFR-O5가 구현되어 허위표시 리스크가 차단된다**.

**Acceptance Criteria:**

**Given** Story 3.3의 Published Page가 렌더링 가능한 상태
**When** `src/components/published/LegalDisclaimerFooter.tsx`가 구현된다
**Then** 이 컴포넌트는 하드코딩된 텍스트를 반환한다: "⚠️ 이 서비스는 아직 출시 전입니다. 관심 신호를 남겨주시면 출시 시 가장 먼저 알려드립니다."
**And** `<footer data-legal-disclaimer>` 셀렉터를 포함한다
**And** `src/app/[slug]/layout.tsx`에서 이 Footer가 자동으로 포함되어 LLM 생성 콘텐츠 영역 밖에 렌더링된다
**And** `scripts/check-legal.ts`가 완성되어 `.next/server/app/[slug]` 빌드 결과물을 grep으로 검사해 disclaimer 문구 존재를 확인한다 (Story 1.8의 스켈레톤 확장)
**And** `package.json` scripts에 `"check:legal": "tsx scripts/check-legal.ts"` 또는 `"check:legal": "bun scripts/check-legal.ts"`가 추가된다
**And** `.github/workflows/ci.yml`이 업데이트되어 `bun run build` 후 `bun run check:legal`을 실행하며, 누락 시 CI 실패한다
**And** 현재 `/preview/[id]`(Story 3.1)에도 동일한 Footer가 나타난다

### Story 3.5: Event Collector API (Edge Runtime)

As a **System**,
I want **방문자 이벤트를 수신해 DB에 저장하는 Edge Runtime API**,
So that **FR27~FR30, NFR-R1이 구현된다**.

**Acceptance Criteria:**

**Given** `events` 테이블(Story 1.3)이 존재한다
**When** `src/app/api/events/route.ts`에 POST handler가 구현된다
**Then** 이 handler는 `export const runtime = 'edge'`를 명시한다
**And** request body는 `{ ideaId: string (UUID), eventType: 'page_view' | 'cta_click' | 'email_submit' | 'invalid_email', metadata?: object }` Zod 검증
**And** `@neondatabase/serverless`로 `events` 테이블에 INSERT한다
**And** 서버 타임스탬프(`NOW()`)만 사용하며 클라이언트 타임스탬프는 무시한다
**And** 성공 시 204 No Content 반환 (body 없음, sendBeacon 호환)
**And** 검증 실패 시 400 반환하지만 클라이언트는 sendBeacon으로 호출하므로 응답을 확인하지 않는다
**And** 인증 없음 (public), CORS는 same-origin 기본 정책
**And** `src/lib/db/queries/events.ts`에 `insertEvent` 쿼리 함수가 있다

### Story 3.6: 클라이언트 Tracking 유틸

As a **System**,
I want **Published Page에서 이벤트를 안정적으로 서버로 보내는 클라이언트 유틸**,
So that **NFR-R1(데이터 수신 100%) 달성 경로가 구현된다**.

**Acceptance Criteria:**

**Given** Story 3.5의 Event Collector API가 존재한다
**When** `src/lib/utils/tracking.ts`에 `trackEvent(ideaId, eventType, metadata?)` 함수가 구현된다
**Then** 이 함수는 먼저 `navigator.sendBeacon('/api/events', payload)`를 시도한다
**And** sendBeacon 실패 시 `fetch('/api/events', { method: 'POST', body, keepalive: true })`로 fallback
**And** payload는 `{ ideaId, eventType, metadata? }` JSON
**And** 이 함수는 Promise를 반환하지만 호출자는 await하지 않을 수 있다 (fire-and-forget)
**And** 브라우저 환경에서만 동작 (`typeof window !== 'undefined'` 가드)
**And** 이 유틸은 아직 어느 곳에서도 호출되지 않는다 (Story 3.7에서 연결)

### Story 3.7: PV + CTA 클릭 이벤트 연결

As a **System**,
I want **Published Page 로드 시 PV 이벤트를, CTA 버튼 클릭 시 CTA 이벤트를 자동 기록**,
So that **FR27, FR28이 구현된다**.

**Acceptance Criteria:**

**Given** Story 3.6의 `trackEvent` 유틸과 Story 3.5의 Event Collector가 존재한다
**When** `src/components/published/TrackingBoundary.tsx` 또는 동등한 클라이언트 컴포넌트가 구현되어 Published Page에 포함된다
**Then** 이 컴포넌트는 페이지 마운트 시 `trackEvent(ideaId, 'page_view')`를 호출한다
**And** `CTASection.tsx`가 클라이언트 컴포넌트로 업데이트되어 "사전 신청" 버튼 클릭 시 `trackEvent(ideaId, 'cta_click')`을 호출한다
**And** Preview 모드(Story 3.1)에서는 이벤트가 발생하지 않는다 (환경 조건 또는 `(operator)` 경로 감지)
**And** 이벤트 발생 후에도 UI는 정상 작동 (이메일 폼 표시로 이어짐)
**And** DB의 `events` 테이블에 실제로 row가 쌓이는 것을 브라우저 테스트로 확인한다

### Story 3.8: 이메일 수집 폼 + Zod 검증 + 중복 방지 + Invalid 카운터

As a **Visitor**,
I want **"사전 신청" 버튼 클릭 후 이메일을 입력해 제출**,
So that **FR21~FR24, FR26, FR31이 구현된다**.

**Acceptance Criteria:**

**Given** Story 3.7까지 CTA 클릭이 작동한다
**When** `src/components/published/EmailForm.tsx`가 구현된다
**Then** CTA 클릭 후 이메일 입력 필드가 표시된다 ("아직 출시 전이에요. 출시되면 가장 먼저 알려드릴게요" 안내 포함)
**And** 이메일 폼 아래 개인정보 수집 고지 문구가 항상 표시된다 (NFR-PR1, FR26)
**And** `src/app/api/events/route.ts`는 `email_submit` 이벤트 수신 시 추가 로직을 수행한다:
- 이메일 형식을 Zod `z.string().email()`로 검증
- 유효하면 `email_collections` 테이블에 `INSERT ... ON CONFLICT (idea_id, email) DO NOTHING` (중복 방지)
- 검증 실패하면 `events` 테이블에 `invalid_email` 이벤트만 기록 (FR31)
**And** 클라이언트는 성공 시 "소식을 기다리겠습니다" 확인 메시지 표시 (FR23)
**And** 검증 실패 시 "이메일 형식이 올바르지 않습니다" 안내 표시 (FR24)
**And** 제출은 `trackEvent(ideaId, 'email_submit', { email })`로 Event Collector에 전달된다
**And** 폼은 시맨틱 HTML과 `<label>` 연결, 터치 타겟 44x44px 이상 (NFR-A2, A3)

### Story 3.9: OG 메타 + 모바일 반응형 + noindex + 재발행 URL 유지 (콘텐츠/동작)

As a **Visitor & Operator**,
I want **광고 공유 시 미리보기가 잘 보이고, 모바일에서 깔끔하며, 검색엔진에는 노출되지 않고, 재발행해도 URL이 유지되는 페이지**,
So that **FR15, FR16, FR18, FR54, NFR-A1~A4가 구현된다. (성능 CI 검증은 Story 3.10에서 분리 처리)**.

**Acceptance Criteria:**

**Given** Story 3.8까지 페이지가 기능적으로 완성된 상태
**When** `src/app/[slug]/page.tsx`에 `generateMetadata` 함수를 추가한다
**Then** Next.js의 `Metadata` API로 `title`, `description`, `openGraph.title`, `openGraph.description`, `openGraph.images` 설정
**And** `og:image`는 초기에 `public/og-default.png` 정적 파일 또는 Next.js `ImageResponse`로 `hero` 텍스트 기반 동적 생성
**And** `robots: { index: false, follow: false }` 또는 `<meta name="robots" content="noindex">` 기본 적용 (FR54)
**And** `ideas.noindex` 컬럼을 읽어 아이디어별로 토글 가능하되 기본값은 `true`
**And** Tailwind의 반응형 유틸(`sm:`, `md:`, `lg:`)로 모바일 → 데스크톱 적응
**And** Story 3.2의 재발행 로직(slug 유지)을 실제로 테스트하여 이미 발행된 아이디어를 재편집 후 다시 발행해도 URL이 동일함을 확인한다
**And** 시맨틱 HTML + `<label>` 연결 + 터치 타겟 44x44px 이상이 Published Page 전체에 적용되어 있다 (NFR-A1~A4)

### Story 3.10: Lighthouse CI + 번들 크기 검증 (성능 게이트)

As a **Operator**,
I want **Published Page의 성능(LCP, JS 번들 크기)이 CI 단계에서 자동 측정되고 기준 미달 시 배포 차단**,
So that **NFR-P1(LCP < 2.5s), NFR-P2(JS 번들 < 50KB gzip)가 지속적으로 보장된다**.

**Acceptance Criteria:**

**Given** Story 3.9까지 Published Page가 기능 완성된 상태
**When** `bun add -D @lhci/cli`로 Lighthouse CI를 설치한다
**Then** `lighthouserc.json` 설정 파일이 프로젝트 루트에 생성되어 Published Page 샘플 URL(예: 사전 시드된 테스트 아이디어의 slug)을 측정 대상으로 설정한다
**And** Lighthouse CI 설정에 다음 assertions가 포함된다:
- `largest-contentful-paint`: max 2500ms (NFR-P1)
- `cumulative-layout-shift`: max 0.1
- `first-contentful-paint`: max 1500ms
- `interactive`: max 3500ms
**And** `.github/workflows/ci.yml`이 업데이트되어 `bun run build` 후 `bunx lhci autorun`을 실행한다
**And** Lighthouse 측정은 모바일 프리셋("4G Slow" 네트워크 + Moto G4급 CPU throttling)으로 수행된다
**And** 기준 미달 시 CI가 실패해 배포가 차단된다
**And** Published Page JS 번들 크기는 `next build` 출력의 Route별 First Load JS 값을 parse하여 50KB gzip 초과 시 경고 또는 실패한다 (별도 스크립트 `scripts/check-bundle-size.ts` 또는 Next.js `experimental.bundlePagesRouterDependencies` 활용)

---

## Epic 4: Dashboard & Decision Making

**Goal**: Minimal Dashboard(Epic 2.8)를 완전한 의사결정 도구로 확장한다. Epic 완료 시점에 Mhkim이 일요일 저녁 대시보드 한 화면에서 "어떤 아이디어가 반응 좋은가"를 데이터로 판단할 수 있다. Journey 1(의사결정)과 Journey 1.5(데이터 공백기) 완성.

### Story 4.1: 지표 집계 쿼리 + Dashboard 확장 (PV/CTA/이메일 표시)

As a **Operator**,
I want **Dashboard 표에서 각 아이디어별 PV, CTA 클릭, 이메일 수집 수를 나란히 확인**,
So that **FR33, FR34가 구현되고 아이디어 간 비교가 한눈에 가능하다**.

**Acceptance Criteria:**

**Given** Epic 3까지 완료되어 `events` 테이블에 실제 데이터가 쌓이고 있다
**When** `src/lib/db/queries/ideas.ts`에 `getIdeasWithMetrics()` 함수가 구현된다
**Then** 이 쿼리는 `ideas` 테이블을 `events` 테이블과 LEFT JOIN하여 각 아이디어별로 `pageViews`, `ctaClicks`, `emailSubmits` 카운트를 집계한다
**And** `COUNT(*) FILTER (WHERE event_type = 'page_view')` 같은 conditional aggregation 사용
**And** 결과는 `{ id, slug, finalPageData, status, pv, ctaClicks, emails, createdAt, updatedAt }[]` 형식
**And** `src/components/operator/DashboardTable.tsx`가 Story 2.8의 최소 버전에서 확장되어 지표 컬럼(PV, CTA, Emails)을 표시한다
**And** Story 2.8의 prompt 요약 컬럼은 유지된다
**And** 발행 URL 컬럼이 추가되어 클릭 시 새 탭에서 Published Page로 이동한다 (FR36)

### Story 4.2: 지표 기준 정렬 기능

As a **Operator**,
I want **대시보드에서 지표별로 정렬 (PV 많은 순, 이메일 많은 순 등)**,
So that **FR35가 구현되어 "반응 좋은 아이디어"를 빠르게 찾을 수 있다**.

**Acceptance Criteria:**

**Given** Story 4.1의 Dashboard 표가 작동한다
**When** 각 지표 컬럼 헤더(PV, CTA, Emails, Updated)를 클릭하면 해당 컬럼 기준 정렬이 토글된다
**Then** 정렬 상태는 URL 쿼리 파라미터(`?sortBy=emails&order=desc`)에 반영된다
**And** 정렬된 헤더에 시각적 표시 (화살표 아이콘 등)
**And** 서버 쿼리는 `ORDER BY` 절을 사용해 DB 수준에서 정렬한다 (클라이언트 정렬 아님)
**And** 기본 정렬은 `updatedAt DESC`

### Story 4.3: 시간 기반 상태 메시지 (Journey 1.5 데이터 공백기)

As a **Operator**,
I want **방금 발행한 아이디어가 데이터 없을 때 "조급해하지 말라"는 해석 가이드**,
So that **FR40이 구현되고 Journey 1.5(월요일 저녁 의심 → 안도)의 경험이 완성된다**.

**Acceptance Criteria:**

**Given** 발행 후 72시간 미만의 아이디어가 존재한다
**When** DashboardTable의 각 row에 `StatusMessage` 컴포넌트가 표시된다
**Then** `src/components/operator/StatusMessage.tsx`가 구현되어 발행 후 경과 시간(hours since `publishedAt` 또는 slug 부여 시점)에 따라 다른 메시지를 반환한다:
- 0~24시간: "📊 발행 N시간 경과. 광고 본격 도달까지는 보통 48~72시간 걸려요."
- 24~72시간: "📊 발행 N시간 경과. 광고가 점차 도달 중입니다."
- 72시간+ & PV < 100: "📊 72시간 경과했지만 PV가 적어요. 광고 카피나 타겟팅을 점검해보세요."
- 72시간+ & PV ≥ 100: (메시지 없음 또는 "데이터 수집 중")
**And** 이 메시지는 각 row 확장 시 또는 인라인으로 표시된다 (레이아웃 결정은 구현 시)

### Story 4.4: 최소 샘플 사이즈 미만 전환율 억제

As a **Operator**,
I want **PV가 100 미만인 아이디어의 전환율(CTA click rate, email rate)을 표시하지 않음**,
So that **FR41이 구현되고 너무 적은 데이터로 잘못된 판단을 막는다**.

**Acceptance Criteria:**

**Given** DashboardTable이 작동한다
**When** 전환율 컬럼(CTA click rate, Email rate)이 추가된다
**Then** 각 row의 `pv >= 100`일 때만 전환율을 계산해 표시한다 (`ctaClicks / pv * 100%`, `emails / pv * 100%`)
**And** `pv < 100`이면 전환율 자리에 "—" 또는 "데이터 부족" 표시
**And** 이 임계값(100)은 `src/lib/utils/constants.ts`에 `MIN_SAMPLE_SIZE_FOR_RATE = 100`으로 정의된다

### Story 4.5: 아이디어별 이메일 목록 뷰

As a **Operator**,
I want **특정 아이디어의 수집된 이메일 목록을 볼 수 있음**,
So that **FR38이 구현되어 실제 관심을 남긴 사람들을 확인할 수 있다**.

**Acceptance Criteria:**

**Given** `email_collections` 테이블에 데이터가 있는 아이디어가 존재한다
**When** `src/app/api/ideas/[id]/emails/route.ts`에 GET handler가 구현된다
**Then** 이 handler는 `SELECT email, created_at FROM email_collections WHERE idea_id = ? ORDER BY created_at DESC` 쿼리 실행
**And** Operator middleware로 보호된다
**And** `src/components/operator/EmailList.tsx`가 구현되어 아이디어별로 이메일과 수집 시각을 표 형태로 표시한다
**And** DashboardTable의 이메일 카운트 셀을 클릭하면 이 EmailList 뷰로 드릴다운 (또는 `/operator/ideas/[id]/emails` 페이지)
**And** 이메일 수가 0이면 "수집된 이메일이 없습니다" 표시

### Story 4.6: LLM 비용 모니터링 표시

As a **Operator**,
I want **Dashboard 한 구석에 이번 달 LLM API 사용 비용과 예산 대비 % 표시**,
So that **NFR-O4 UI 부분이 구현되고 Kill Switch 상황을 예측 가능하다**.

**Acceptance Criteria:**

**Given** `llm_calls` 테이블에 Story 1.7의 로그가 쌓이고 있다
**When** `src/lib/db/queries/llmCalls.ts`에 `getCurrentMonthLLMCost()` 쿼리 함수가 있고 Story 1.7에서 이미 사용 중이다
**And** Dashboard 상단에 비용 표시 컴포넌트가 추가된다 (예: "💰 이번 달 LLM 비용: $X.XX / $50.00 (YY%)")
**Then** 비용이 예산의 80% 초과 시 노란색 경고 표시
**And** 비용이 예산의 100% 도달 시 빨간색 + "Kill Switch 활성" 안내
**And** 이 집계는 Dashboard 첫 진입 시 1회 조회 (실시간 업데이트 없음)

### Story 4.7: Empty State 가이드 개선

As a **Operator**,
I want **아이디어가 0개일 때 풍부한 Empty State 가이드**,
So that **FR39가 완전히 충족되어 첫 사용자 경험이 혼란스럽지 않다**.

**Acceptance Criteria:**

**Given** Story 2.1의 기본 Empty State가 존재한다
**When** `src/components/shared/EmptyState.tsx`가 확장된다
**Then** 아이디어 0개 상태에서 다음이 표시된다:
- 환영 메시지 ("안녕하세요, Mhkim님!")
- 이 도구의 목적 한 줄 요약 ("아이디어를 한 줄로 입력하면 AI가 랜딩페이지를 만들어줍니다")
- 간단한 3단계 가이드 (1. 새 아이디어 버튼 클릭 → 2. 프롬프트 입력 → 3. 발행 & 광고)
- "새 아이디어 만들기" 버튼 (Story 2.1과 동일)
**And** 이 Empty State는 Dashboard에서만 표시되며, 편집 페이지나 다른 페이지에는 영향 없다

---

## Epic 5: Lifecycle Management

**Goal**: Archive, Delete, 완전한 JSON Export로 MVP 라이프사이클을 닫는다. Epic 완료 시점에 Mhkim은 더 이상 필요 없는 아이디어를 정리하고, 실수로 만든 걸 지우고, 전체 데이터를 JSON으로 백업할 수 있다. Journey 5("아이디어 놓아주기")의 해방감 완성.

### Story 5.1: Archive API + 상태 전환 + Confirm Dialog

As a **Operator**,
I want **반응 없는 아이디어를 Archive 상태로 전환하며 실수 방지 Confirm 다이얼로그**,
So that **FR42, FR43이 구현되고 Journey 5("정리하기") 경험이 가능하다**.

**Acceptance Criteria:**

**Given** `status='active'`인 아이디어가 Dashboard에 존재한다
**When** `src/app/api/ideas/[id]/archive/route.ts`에 POST handler가 구현된다
**Then** 이 handler는 request body의 `{ action: 'archive' | 'restore' }`를 Zod 검증한다
**And** `action='archive'`일 때 `UPDATE ideas SET status='archived', archived_at=NOW() WHERE id=? AND status='active'` 실행
**And** 응답은 업데이트된 `{ id, status, archivedAt }` 반환
**And** Dashboard 각 row에 "Archive" 버튼 또는 메뉴가 추가된다
**And** `src/components/operator/ArchiveConfirmDialog.tsx`가 구현되어 다음 내용 표시:
- "💤 이 아이디어를 정리할까요?"
- "페이지는 유지되지만 대시보드 상단에서 사라집니다"
- "지금까지 수집한 데이터는 그대로 보존됩니다"
- "언제든 Archive 섹션에서 다시 꺼낼 수 있어요"
- [정리하기] [취소] 버튼
**And** "정리하기" 클릭 시 API 호출 및 성공 후 Dashboard 목록에서 해당 row가 사라진다
**And** Archive된 아이디어의 Published URL은 여전히 접근 가능하다 (FR45, 이 스토리 이후 유지되는 성질)

### Story 5.2: Dashboard Archived 섹션 통합

As a **Operator**,
I want **Dashboard 하단에 "Archived" 섹션이 있어 정리된 아이디어를 확인 가능**,
So that **FR37이 구현되고 "정리된 아이디어들이 잘 쉬고 있다"는 시각적 완결감을 얻는다**.

**Acceptance Criteria:**

**Given** Story 5.1로 archived 상태 아이디어가 존재할 수 있다
**When** `src/components/operator/ArchivedSection.tsx`가 구현된다
**Then** Dashboard의 active 목록 아래에 "Archived" 섹션 헤더가 표시된다 (접을 수 있으면 더 좋음)
**And** 섹션 헤더 옆에 카운트 표시 ("Archived · N개의 아이디어가 잘 쉬고 있어요")
**And** archived 아이디어 목록이 표시되며 active 섹션과 동일한 표 형식이지만 흐린(dimmed) 스타일
**And** 각 row는 읽기 전용이 아니라 active 섹션처럼 편집 페이지로 이동 가능
**And** `getIdeasWithMetrics()`(Story 4.1)가 status 필터 없이 전체 반환하거나, 별도 `getArchivedIdeas()` 쿼리 함수를 추가

### Story 5.3: Archived → Active 복원

As a **Operator**,
I want **Archived 아이디어를 다시 Active로 되돌릴 수 있음**,
So that **FR46이 구현되어 "역시 이 아이디어 다시 검토하자"는 상황에 대응한다**.

**Acceptance Criteria:**

**Given** Story 5.1의 archive API가 존재하고 Story 5.2의 Archived 섹션이 작동한다
**When** Archived 섹션의 각 row에 "복원" 버튼이 추가된다
**Then** 복원 버튼 클릭 시 `POST /api/ideas/[id]/archive`가 `action='restore'`로 호출된다
**And** handler가 `action='restore'`일 때 `UPDATE ideas SET status='active', archived_at=NULL WHERE id=? AND status='archived'` 실행
**And** 성공 후 Dashboard가 refresh되어 해당 row가 Archived 섹션에서 Active 섹션으로 이동한다
**And** Confirm dialog는 없다 (복원은 되돌릴 수 있는 액션)

### Story 5.4: 완전 삭제 API (archived-only) + Confirm Dialog + cascade

As a **Operator**,
I want **archived 상태의 아이디어만 완전히 삭제할 수 있으며, active 아이디어는 먼저 archive로 전환한 후에만 삭제 가능**,
So that **FR47이 구현되어 테스트 데이터나 이상한 결과를 영구 제거할 수 있되, 광고 중인 URL을 실수로 삭제해 광고비와 수집 데이터를 잃는 사고가 방지된다**.

**Acceptance Criteria:**

**Given** Dashboard의 Archived 섹션에 아이디어가 존재한다
**When** `src/app/api/ideas/[id]/route.ts`에 DELETE handler가 구현된다 (또는 기존 route.ts에 추가)
**Then** 이 handler는 먼저 대상 아이디어의 `status`를 조회한다
**And** `status !== 'archived'`이면 **409 Conflict** 상태로 `{ error: 'Only archived ideas can be deleted. Please archive first.', code: 'NOT_ARCHIVED' }` 반환한다
**And** `status === 'archived'`일 때만 `DELETE FROM ideas WHERE id=? AND status='archived'` 실행
**And** Drizzle 스키마의 `onDelete: 'cascade'` 옵션 덕분에 관련 events, email_collections도 함께 삭제된다 (Story 1.3)
**And** `llm_calls`는 `onDelete: 'set null'` 정책으로 idea_id만 null로 설정된다 (비용 기록 보존)
**And** 삭제 성공 시 응답은 204 No Content 반환
**And** **UI 수준 제약**: "삭제" 메뉴 옵션은 **Archived 섹션의 row에만** 노출된다. Active 섹션의 row에는 "삭제" 옵션이 없고 "Archive"만 있다
**And** `src/components/operator/DeleteConfirmDialog.tsx`가 구현되어 강한 경고 메시지 표시:
- "⚠️ 완전 삭제"
- "이 아이디어와 수집된 모든 데이터 (이벤트, 이메일)가 복구 불가능하게 삭제됩니다"
- "발행된 URL도 즉시 404가 됩니다"
- "이 작업은 되돌릴 수 없습니다"
- [삭제] [취소] 버튼
**And** 성공 후 Dashboard가 refresh되어 해당 row가 Archived 섹션에서 사라진다
**And** **의도적 2단계 삭제 플로우**: Active 상태 아이디어를 제거하려면 먼저 Story 5.1의 Archive 플로우를 거친 후 이 Story의 Delete를 사용해야 한다. 이 강제는 광고비·수집 데이터 보호를 위한 의도적 UX 결정이다.

### Story 5.5: JSON Export 완전 버전 (Operator UI + 다운로드)

As a **Operator**,
I want **모든 데이터를 JSON 파일로 다운로드할 수 있는 UI**,
So that **FR51이 완전히 구현되고 백업/이전/분석 옵션이 열린다 (Story 1.8의 debug 버전 확장)**.

**Acceptance Criteria:**

**Given** Story 1.8의 debug JSON Export API가 존재한다
**When** `src/app/api/export/route.ts`가 완전 버전으로 업데이트된다
**Then** 이 handler는 `ideas`, `events`, `email_collections`, `llm_calls` 4개 테이블 전체를 JSON으로 직렬화한다
**And** 응답 헤더에 `Content-Type: application/json; charset=utf-8`과 `Content-Disposition: attachment; filename="blog-practice-backup-YYYY-MM-DD.json"` 설정
**And** 파일명의 날짜는 서버 시간 기준 ISO 날짜
**And** `src/app/(operator)/export/page.tsx`가 구현되어 "전체 데이터 JSON 다운로드" 버튼을 제공한다
**And** 버튼 클릭 시 `window.location.href = '/api/export'`로 다운로드 트리거
**And** 페이지에 간단한 설명 표시: "이 파일은 모든 아이디어, 이벤트, 이메일, LLM 호출 기록을 포함합니다. 안전한 곳에 보관하세요."
**And** Dashboard 또는 Operator Console 내비게이션에 "데이터 내보내기" 링크가 추가된다

---

## Document Completion Summary

- **Total Epics**: 5
- **Total Stories**: **41** (Party Mode 반영 후)
  - Epic 1 (Foundation): 10 stories
  - Epic 2 (Idea Creation & Workspace): 9 stories
  - Epic 3 (Publishing & Data Pipeline): 10 stories
  - Epic 4 (Dashboard & Decision Making): 7 stories
  - Epic 5 (Lifecycle Management): 5 stories
- **FR Coverage**: 55/55 ✅
- **NFR Coverage**: 24/24 ✅ (Epic별로 분산)
- **Build Order**: Epic 1 → 2 → 3 → 4 → 5
- **Key Checkpoints**:
  - Epic 1: 잠긴 빈 앱 (인프라)
  - Epic 2: Walking Skeleton (end-to-end 첫 작동)
  - Epic 3: MVP 실질 시작점 (광고 트래픽 가능)
  - Epic 4: MVP 핵심 가치 (데이터 기반 의사결정)
  - Epic 5: MVP 완결 (정리/삭제/백업)
