---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
status: 'final'
completed: '2026-04-06'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-blog-practice.md
workflowType: 'architecture'
project_name: 'blog-practice'
user_name: 'Mhkim'
date: '2026-04-06'
---

# Architecture Decision Document - blog-practice

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (55개, 10개 카테고리)**

PRD가 정의한 55개 FR은 아키텍처 관점에서 다음과 같이 재분류된다:

- **LLM 파이프라인 (FR1~FR7, FR12, FR55)** — 프롬프트 → 구조화 JSON → 스키마 검증 → 렌더링. Kill Switch, 취소, 진행 상태 UI 포함. 이 파이프라인이 제품의 기술적 심장이다.
- **상태 편집 & 저장 (FR8~FR11, FR48~FR51)** — 재생성 / 인라인 편집 / 프롬프트 수정, 덮어쓰기, draft 자동저장, JSON export. 이력 없는 단순 저장 모델.
- **발행 & 렌더링 (FR13~FR19)** — slug 할당, OG 메타, 모바일 반응형, 방문자 시점 미리보기, 슬러그 불변성.
- **Visitor UX + 법적 가드레일 (FR20~FR26)** — 이메일 수집, "아직 출시 전" 강제 문구.
- **이벤트 수집 (FR27~FR32)** — PV/CTA/이메일/Invalid 4종 이벤트, 서버사이드 백업.
- **Operator Dashboard (FR33~FR41)** — 표 비교, 정렬, Archive 섹션, Empty State, 해석 가이드.
- **Archive & Delete (FR42~FR47)** — 상태 전환, confirm 다이얼로그, URL 영속성, 완전 삭제.
- **Data & Integrity (FR48~FR54)** — 스키마, 자동저장, Export, slug 유일성, LLM 재시도, noindex 기본값.

**Non-Functional Requirements (24개, 6 카테고리 + 의도적 제외)**

NFR이 아키텍처에 미치는 영향:

- **Performance (NFR-P1~P5)**: Published Page는 **정적 렌더링 + CDN 엣지**가 필수 (LCP < 2.5s at p75, JS 번들 < 50KB gzip). Operator Console은 성능 타깃 제외.
- **Reliability (NFR-R1~R5)**: `sendBeacon` 기반 이벤트 전송, 서버 수신 100% 저장, slug DB 제약, draft 자동저장 (blur 또는 idle 10초), LLM 자동 재시도 1회.
- **Security (NFR-S1~S5)**: HTTPS, 이메일 at-rest encryption, secret store, 최소 수집, Operator Console 토큰 접근.
- **Privacy (NFR-PR1~PR3)**: "아직 출시 전" 시스템 강제, 개인정보 고지 항상 노출, 수집 목적 외 사용 금지.
- **Accessibility (NFR-A1~A4)**: WCAG AA 대비율, 터치 타겟, label 연결, 시맨틱 HTML.
- **Maintainability (NFR-M1~M5)**: 익숙한 스택, 단일 리포, 5분 로컬 재구축, TypeScript 필수, 미니멀 README.
- **Observability (NFR-O1~O5)**: LLM 호출 로그, 이벤트 감사, Error tracking, 비용 모니터링 + Kill Switch, "아직 출시 전" 자동 검증 파이프라인.

**의도적 제외 항목**: Scalability, Integration, HA/DR, i18n, multi-region, compliance 인증.

### Scale & Complexity

- **Primary domain**: Full-stack web application (Frontend + Backend + DB + LLM integration)
- **Complexity level**: **Medium** (PRD Classification 확정)
- **Architectural component count (추정, 6~8개)**:
  1. Operator Console SPA
  2. Published Page Renderer
  3. LLM Gateway
  4. **Schema Validator** (LLM Gateway 내 서브모듈, OpenAI structured output vs Anthropic tool use 차이가 재시도 로직·fallback 설계를 결정)
  5. Event Collector API
  6. Storage Layer (ideas + events)
  7. Kill Switch 모니터
  8. 법적 가드레일 Validation 파이프라인 (CI/빌드 훅)

**Scale은 의도적으로 "1명 사용자 + 무한 Visitor"**로 양분된다:

- Operator Side: 트래픽 0~1 동시 사용자. 성능 느슨.
- Visitor Side: 광고 트래픽 spike 가능, 수십~수백 동시 접속. 정적 배포 + CDN으로 처리.

### Technical Constraints & Dependencies

**확정된 제약:**

1. **단일 사용자 전제** — 인증, 멀티테넌시, 권한 관리 아키텍처 없음. 환경변수 기반 토큰 보안만.
2. **이원 구조** — Operator Console (SPA, 가볍고 빠른 수정) vs Published Pages (SSG/SSR, 엣지 배포, 성능 최우선). 이 두 모드가 같은 코드베이스에서 공존해야 함.
3. **LLM 의존성** — 외부 LLM API (OpenAI/Anthropic) 없이는 제품이 작동하지 않음. API 키는 환경변수로만.
4. **이미지 없음** — LLM의 이미지 생성, 스톡 이미지, 업로드 전부 제외. 아키텍처에서 이미지 파이프라인 불필요.
5. **법적 가드레일 자동 검증** — 발행 파이프라인에서 "아직 출시 전" 문구 검증이 반드시 통과되어야 배포 가능. CI/빌드 단계 훅 필요.
6. **slug 불변성** — DB 제약 (`UNIQUE`, `UPDATE` 불허 트리거 또는 애플리케이션 수준 가드).
7. **Draft 자동저장** — 브라우저 종료에도 안전. 서버 사이드 저장 필수 (localStorage만으로는 부족).
8. **Kill Switch** — LLM 호출 전 비용 누적 확인 → 차단 로직. 환경변수 override 경로.
9. **JSON Export** — 전체 DB 덤프를 JSON으로 내보내는 경로 필요 (GDPR 유사 요건 + 백업 안전망).
10. **로컬 DX 제약 (NFR-M3)** — 스택은 `git clone → env 설정 → 단일 명령 5분 이내` 가능해야 함. DB 선택(Turso/SQLite vs Supabase Pro), 렌더링 전략(SSG vs SSR), 호스팅 플랫폼(로컬 에뮬레이션 필요 여부)을 실질적으로 좁히는 hard constraint.
11. **월 예산 상한 (PRD Scoping)** — 호스팅 ≤ $10, DB ≤ $25, LLM ≤ $50. 스택 선택의 1순위 필터. 유료 티어를 전제로 한 설계는 즉시 탈락.
12. **Vendor lock-in 최소화 원칙** — 가능한 한 **표준 Postgres, 표준 HTTP, 표준 Web API**를 사용한다. 플랫폼 독점 기능(Vercel KV, Supabase Realtime 등)은 "대체 가능한 수준에서만" 허용. 3년 후 이전 가능성을 열어두는 것이 목적.
13. **LLM Provider Abstraction 요구** — LLM 선택은 설정 파일로 교체 가능해야 함. 가격 변동·모델 deprecation·rate limit 변경에 대비. Gateway 내에 provider interface 설계 필수.

**Dependencies:**

- **런타임**: Node.js 또는 Deno (TypeScript 필수 — NFR-M5)
- **외부 서비스**: LLM API, 호스팅 플랫폼(Vercel/Cloudflare Pages), DB(Supabase/Turso/동급)
- **개발 도구**: TypeScript, Lighthouse(CI에서 LCP 측정), Sentry 또는 동급

### Cross-Cutting Concerns Identified

다음 관심사는 단일 컴포넌트에 국한되지 않고 아키텍처 전반에 걸친다:

1. **LLM I/O 경계의 신뢰성** — Operator Console(요청) → LLM Gateway(프록시·로그·Kill Switch) → Schema Validator(JSON 강제) → Storage(덮어쓰기) → Renderer(Published Page). 한 고리가 깨지면 Journey 2가 무너진다. 이 아키텍처의 가장 위험한 지점.
2. **데이터 수집 파이프라인** — Published Page(클라이언트 이벤트) → `sendBeacon`(브라우저 종료 방어) → Collector API(서버 수신) → Storage(이벤트 테이블) → Operator Dashboard(집계 조회). 이중 기록(클라이언트 카운터 + 서버 카운터).
3. **법적 가드레일의 템플릿 레이어 보호** — "아직 출시 전" 문구가 LLM 생성 콘텐츠 영역 밖에 있어야 하고, 발행 파이프라인이 검증한다. 이 관심사가 Renderer, Template, CI 빌드에 동시에 존재.
4. **URL 불변성** — slug는 DB, API, Renderer, OG 메타, Operator Dashboard에서 모두 동일한 불변 값으로 사용된다. 리네임 시도 자체를 막아야 한다.
5. **상태 관리 2중성** — Operator Console은 편집 중 상태(draft) + 확정 상태(published) + Archive 상태 세 종류를 관리한다. 대시보드는 이 상태 분류를 제1 시민으로 다룬다.
6. **Observability & Cost Control** — LLM 호출, 이벤트 수집, Kill Switch가 모두 같은 로그/모니터링 인프라를 공유.
7. **Single Source of Truth (Schema)** — `ideas.final_page_data`의 JSON schema가 LLM 요청, Validator, Renderer, 편집 UI에서 모두 참조되어야 한다. 타입 정의 1곳만 유지.
8. **CI/Build 파이프라인** — NFR-O5(법적 가드레일 자동 검증) + NFR-P1(LCP 측정) + NFR-M3(로컬 재구축)이 모두 CI에서 실행되는 검사를 전제로 한다. "배포 플랫폼 선택"과 "CI 전략"이 묶여 있음 (Vercel Lighthouse CI vs GitHub Actions + Playwright vs Cloudflare Pages Functions + Action). Step 4 스택 선택과 Step 5 패턴 결정에 모두 영향.
9. **테스트 가능한 경계 (Testability Boundaries)** — 비즈니스 로직과 인프라 의존성이 명시적으로 분리되어야 한다:
   - Kill Switch 체크 → LLM Gateway의 데코레이터/미들웨어로 분리 (독립 유닛 테스트 가능)
   - "아직 출시 전" 검증 → 발행 함수의 의존성 주입으로 (mock 가능)
   - LLM Provider → interface 뒤에 (fake provider로 테스트)
   - 이벤트 Collector → 저장소 의존성 추상화

### Architectural Implications Summary

이 분석으로부터 이후 step에서 결정해야 할 핵심 질문들:

- **Starter Template** (Step 3): 이 이원 구조(SPA + SSG/SSR)를 한 코드베이스에서 지원하는 템플릿은?
- **프레임워크 & 런타임** (Step 4): Next.js vs SvelteKit vs 자체 조합? 월 예산과 로컬 DX가 1순위 필터.
- **데이터베이스 & 저장소** (Step 4): Supabase vs Turso vs 다른 것? Vendor lock-in 최소화 원칙 적용.
- **LLM 선택 & Provider Abstraction** (Step 4): OpenAI structured output vs Anthropic tool use vs JSON mode? Provider interface 설계 전제.
- **배포 전략 & CI 파이프라인** (Step 4): Vercel vs Cloudflare Pages + CI 전략 결합.
- **상태 관리 패턴** (Step 5): React Query/SWR + Zustand vs 다른 조합?
- **이벤트 수집 엔드포인트 설계** (Step 5): Edge function vs Regular API route?
- **테스트 가능한 경계의 구현 패턴** (Step 5): 의존성 주입 vs 데코레이터 vs 함수 파라미터?
- **프로젝트 구조** (Step 6): 모노리식 단일 앱 vs 앱/패키지 분리?

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack web application** (Operator Console SPA + Published Pages SSG/SSR + LLM pipeline + 데이터 수집 API)

이 프로젝트는 "1인 비개발자가 AI 어시스턴트(Claude Code/Cursor)와 함께 빌드"하는 것이 전제다. 따라서 스타터 선택의 1순위 기준은 **"AI 어시스턴트가 이 스택에 얼마나 능숙한가"** 이다. 비용은 모든 후보가 $0으로 시작 가능하므로 변별력이 약하고, **완성 확률이 가장 중요한 변수**다.

> **Note**: PRD의 NFR-M1 ("Operator가 이미 능숙한 스택 사용")은 "AI 어시스턴트 도움으로 작업 가능한 수준"으로 재해석된다. Mhkim은 본격 개발자가 아니므로, 스택 선택 기준이 "혼자 구현할 수 있는가"가 아니라 "AI 어시스턴트와 함께 구현할 수 있는가"이다.

### Starter Options Considered (2026년 4월 기준, 웹 검색으로 확인)

**옵션 1: Next.js 15 + Vercel + Neon Postgres + Anthropic Claude** ⭐ 선정

- Vercel Hobby: 대역폭 100GB/월, 함수 100GB-Hrs, 커스텀 도메인 무제한
- Neon Free: 스토리지 0.5GB, 컴퓨트 191h/월, 브랜치 10개, 자동 일시정지 (재개 즉시)
- Anthropic Claude: Sonnet 4.5 약 $3/$15 per 1M tok
- 비개발자 친화도 **5/5** — AI 어시스턴트 학습 데이터 압도적, GitHub push 자동 배포, 단일 대시보드

**옵션 2: Astro 5 + Cloudflare Pages + D1 + Claude**

- Cloudflare Pages: 대역폭 무제한, 빌드 500/월
- D1 Free: 스토리지 5GB, 읽기 5M/일
- 비개발자 친화도 **3.5/5** — $0 유지력은 최고지만 Wrangler CLI, D1 마이그레이션 학습 필요. AI 어시스턴트의 Astro+CF 조합 학습량이 Next.js 대비 매우 적음

**옵션 3: SvelteKit 2 + Vercel + Supabase + Claude**

- Supabase Free: DB 500MB, 대역폭 5GB/월, **1주 비활성 시 일시정지**
- 비개발자 친화도 **3/5** — Svelte 문법 간결하지만 AI 어시스턴트 학습 약함. Supabase 1주 비활성 일시정지는 주말 사용 패턴(Journey 1)과 부적합

### Selected Starter: Next.js 15 (App Router) + Bun + Vercel + Neon + Anthropic Claude

**Rationale for Selection:**

1. **비개발자 + AI 어시스턴트 조합에 최적** — Next.js + Vercel + Postgres 조합은 Claude Code, Cursor가 가장 잘 다루는 스택이다. 막혔을 때 검색되는 튜토리얼·에러 해결법의 양이 다른 옵션 합친 것보다 많다. 비개발자에게는 **"막혔을 때 풀 방법이 있는가"** 가 비용보다 중요하다.
2. **월 예산 준수** — 호스팅·DB·LLM 모두 무료 티어에서 시작. 트래픽 50k까지 $0, 이후 LLM이 주요 비용 요인 (페이지 생성당 ~$0.01-0.03).
3. **Vendor lock-in 최소화** — Neon은 표준 Postgres이므로 "3년 후 다른 곳으로 이전"이 가능. Vercel 전용 API(KV, Blob)는 사용하지 않는다는 원칙 동시 확정.
4. **이원 구조 지원** — Next.js App Router는 Operator Console(클라이언트 컴포넌트 기반 SPA)과 Published Pages(서버 컴포넌트 + SSG)를 한 코드베이스에서 자연스럽게 지원.
5. **Neon vs Supabase** — Supabase는 PRD 1순위 후보였으나 **"1주 비활성 일시정지"** 제약이 주말 사용 패턴과 충돌. Neon은 사용량 기반 컴퓨트(191h/월)로 관대하며, 비활성 자동 일시정지도 재개가 즉시 가능. 표준 Postgres라 lock-in도 더 낮다.
6. **Package Manager: Bun** — npm 대신 Bun 채택. 이유: (a) NFR-M3 "5분 재구축" 달성에 유리 (install 5초 내), (b) TypeScript 내장 실행으로 `tsx`/`ts-node` 불필요 → 설정 단순화, (c) Vercel 공식 지원, (d) 2026년 기준 AI 어시스턴트 친화도 npm과 동등. 단점은 Google 튜토리얼이 아직 npm 위주지만 `npm install X → bun add X` 수준의 1:1 매핑이라 AI가 쉽게 변환.

**Initialization Command:**

```bash
bunx create-next-app@latest blog-practice \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --turbopack \
  --use-bun
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**

- **TypeScript** (NFR-M5 필수)
- **Bun 1.x** 런타임 (로컬 개발 + 스크립트) + **Node.js 20+** (Vercel 프로덕션 런타임)
- **React 19** (Next.js 15 기본)

**Styling Solution:**

- **Tailwind CSS v4** — AI 어시스턴트가 가장 잘 쓰는 유틸리티 CSS. 이 제품은 이미지 없고 타이포·여백 중심이라 Tailwind의 기본 유틸만으로 충분.

**Build Tooling:**

- **Turbopack** (Next.js 15 기본 번들러)
- **Next.js App Router** (SPA + SSG/SSR 이원 구조 지원)

**Testing Framework:**

- 기본 제공 없음 → MVP에서 수동으로 **Vitest + Playwright** 최소 추가. Smoke test 1~2개만 (PRD Scoping의 "MVP에서 수용하는 타협" 참조).

**Code Organization:**

- `src/app/` — App Router
- `src/app/(operator)/` — Operator Console route group (토큰 보호 middleware 적용)
- `src/app/[slug]/` — Published Pages 동적 라우트
- `src/app/api/` — Route Handlers (LLM Gateway, Event Collector, Export)
- `src/lib/` — 비즈니스 로직, LLM Provider interface
- `src/db/` — Drizzle schema + 쿼리

**Development Experience:**

- `bun run dev` 단일 명령으로 로컬 실행 (NFR-M3 "5분 재구축" 달성)
- Hot reload 기본 제공
- Next.js DevTools

### 스타터 외에 수동으로 추가 확정되는 의존성

- **ORM**: **Drizzle ORM** — Prisma보다 가볍고 타입 추론 강력, Neon/Postgres 완벽 지원, Edge runtime 호환
- **DB 클라이언트**: `@neondatabase/serverless` — Edge runtime 호환
- **LLM SDK**: `@anthropic-ai/sdk` (기본) + Provider abstraction 레이어로 OpenAI 교체 가능 (Context Analysis Constraint #13)
- **State Management**: TanStack Query (서버 상태) + Zustand (로컬 편집 상태)
- **에러 트래킹**: Sentry 무료 티어 (NFR-O3)
- **CI**: GitHub Actions (Lighthouse + "아직 출시 전" 자동 검증) + Vercel 자동 배포

### Epic 1 Story 1: 프로젝트 초기 세팅

첫 번째 스토리의 구체적 구현 단계:

```bash
# 1. 프로젝트 생성 (Bun 사용)
bunx create-next-app@latest blog-practice \
  --typescript --tailwind --app --src-dir \
  --import-alias "@/*" --turbopack --use-bun

cd blog-practice

# 2. 추가 의존성 설치
bun add drizzle-orm @neondatabase/serverless
bun add -D drizzle-kit @types/node
bun add @anthropic-ai/sdk
bun add @tanstack/react-query zustand
bun add -D vitest @vitejs/plugin-react @testing-library/react

# 3. 환경변수 .env.local 생성
#    DATABASE_URL=(Neon dashboard에서 복사)
#    ANTHROPIC_API_KEY=(Anthropic console에서 발급)
#    OPERATOR_TOKEN=(본인이 임의 지정한 긴 문자열, NFR-S5)
#    MAX_MONTHLY_USD=50 (NFR-O4 Kill Switch)

# 4. Neon DB 초기화 (브라우저)
#    - neon.tech 접속 → 프로젝트 생성
#    - Connection string 복사하여 .env.local에 붙여넣기

# 5. GitHub 리포 생성 + Vercel 연결
#    - GitHub에 리포 push
#    - vercel.com에서 "Import Project" → 환경변수 복사 → 배포

# 6. 완료 확인
#    - 로컬에서 bun run dev → localhost:3000 기본 페이지 표시
#    - Vercel 배포 URL 방문 → 기본 페이지 표시
#    - Neon DB 연결 확인 (Drizzle studio: bunx drizzle-kit studio)
```

**Story Acceptance Criteria:**

- [ ] `bun run dev` 로컬 실행 성공, `localhost:3000`에서 기본 페이지 표시
- [ ] Vercel 배포 URL 접근 가능, 기본 페이지 표시
- [ ] Neon DB 연결 확인 (최소 `SELECT 1` 쿼리 성공)
- [ ] `.env.local.example` 파일에 필요한 환경변수 문서화
- [ ] README에 로컬 실행 명령, 배포 방법, 주요 디렉토리 구조 5줄 이내 기록 (NFR-M4)
- [ ] GitHub Actions 워크플로우 스켈레톤 (CI/CD 준비)

**Note:** 이 스토리가 완료된 후 나머지 기능 스토리들이 의존한다. "MVP 완료의 공식 정의" 중 **기능적 완료**는 이 스토리부터 시작한다.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical (Block Implementation):**

- 데이터베이스 스키마 (Decision 8)
- LLM Gateway + Runtime 분리 (Decision 3)
- Kill Switch 구현 (Decision 4)
- Operator Console 접근 제어 (Decision 7)

**Important (Shape Architecture):**

- Structured Output 전략 (Decision 2)
- Draft 자동저장 구조 (Decision 6)
- 법적 가드레일 검증 (Decision 5)

**Deferred (Post-MVP Growth 재검토):**

- 법적 가드레일 강화안 (DOM 파서 + Publish 런타임 검증 + Playwright smoke test) — Party Mode Winston·Quinn 제안, MVP는 grep + 하드코딩 footer로 충분
- Provider Abstraction 재검토 — 현재는 함수 1개 수준(YAGNI), OpenAI 전환 필요 시 재설계

### Data Architecture

**결정 1: LLM Provider Abstraction → 제거 (YAGNI)**

Context Constraint #13 ("LLM Provider 교체 가능")은 **인터페이스 없이 함수 1개로** 달성한다.

```ts
// src/lib/llm/generate.ts
export async function generateLanding(
  prompt: string,
  instructions?: string
): Promise<LandingPageData> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  // Claude tool_use 호출 + Zod 검증
}
```

나중에 OpenAI로 교체하려면 **이 파일 하나만 다시 쓰면 됨**. Interface, factory, provider config switch 모두 불필요. 비개발자 + AI 어시스턴트 맥락에서 코드 복잡도를 최소화하는 것이 더 중요.

**결정 2: Structured Output = Anthropic `tool_use` + Zod 검증**

- Anthropic Claude는 `tool_use` 기능으로 강타입 structured output 지원 (OpenAI `response_format: json_schema`와 동급).
- `LandingPageData` 스키마는 **Zod 단일 정의**로 프로젝트 전역에서 사용 (Cross-cutting Concern #7 — Single Source of Truth).
- 스키마 위치: `src/lib/schemas/landing.ts`
- 실패 시 1회 자동 재시도 (NFR-R3).
- Zod 스키마가 곧 LLM 요청 파라미터, 검증, Renderer 타입, 편집 UI 타입이다.

**결정 8: 데이터베이스 스키마 (4 테이블)**

PRD FR48/49 + Party Mode 결정 반영. 최종 Drizzle 스키마:

```ts
// src/db/schema.ts
import {
  pgTable, uuid, text, jsonb, timestamp, boolean, numeric,
  index, uniqueIndex
} from 'drizzle-orm/pg-core'

export const ideas = pgTable('ideas', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull(),
  status: text('status', { enum: ['draft', 'active', 'archived'] }).notNull().default('draft'),
  finalPrompt: text('final_prompt').notNull().default(''),
  finalInstructions: text('final_instructions'),
  finalPageData: jsonb('final_page_data').$type<LandingPageData>(),
  noindex: boolean('noindex').notNull().default(true), // FR54
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  archivedAt: timestamp('archived_at'),
}, (t) => ({
  slugIdx: uniqueIndex('ideas_slug_idx').on(t.slug),
  statusIdx: index('ideas_status_idx').on(t.status),
}))

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  ideaId: uuid('idea_id').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
  eventType: text('event_type', {
    enum: ['page_view', 'cta_click', 'email_submit', 'invalid_email']
  }).notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  ideaIdCreatedAtIdx: index('events_idea_id_created_at_idx').on(t.ideaId, t.createdAt),
  eventTypeIdx: index('events_event_type_idx').on(t.eventType),
}))

export const emailCollections = pgTable('email_collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  ideaId: uuid('idea_id').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  ideaEmailIdx: uniqueIndex('email_collections_idea_email_idx').on(t.ideaId, t.email),
}))

export const llmCalls = pgTable('llm_calls', {
  id: uuid('id').primaryKey().defaultRandom(),
  ideaId: uuid('idea_id').references(() => ideas.id, { onDelete: 'set null' }),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  promptTokens: numeric('prompt_tokens').notNull(),
  completionTokens: numeric('completion_tokens').notNull(),
  costUsd: numeric('cost_usd', { precision: 10, scale: 6 }).notNull(),
  durationMs: numeric('duration_ms').notNull(),
  success: boolean('success').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  createdAtIdx: index('llm_calls_created_at_idx').on(t.createdAt),
}))
```

**추가 DB 레벨 제약 (Postgres 트리거):**

```sql
-- slug 불변성 DB 수준 강제 (NFR-R2)
CREATE OR REPLACE FUNCTION prevent_slug_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.slug IS DISTINCT FROM NEW.slug THEN
    RAISE EXCEPTION 'slug is immutable (attempted: % → %)', OLD.slug, NEW.slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ideas_slug_immutable
  BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION prevent_slug_update();
```

**핵심 스키마 결정:**

- **4개 테이블**: `ideas`, `events`, `email_collections`, `llm_calls` (PRD 2개에서 확장)
- **`email_collections` 분리**: FR38(이메일 목록 열람) 쿼리 효율 + 아이디어당 중복 방지
- **`llm_calls` 분리**: Kill Switch 월간 집계 (NFR-O4) + 비용 모니터링 근거
- **`slug` 불변성**: DB 트리거 + 애플리케이션 쿼리에서 slug UPDATE 제외 (이중 방어)
- **`onDelete: 'cascade'`**: FR47 완전 삭제 시 events, email_collections 함께 삭제
- **`finalPageData`는 nullable**: 프롬프트 입력 중 draft 상태 허용 (결정 6 참조)

### Authentication & Security

**결정 7: Operator Console 접근 제어 — Route Handler로 Set-Cookie**

```ts
// src/app/api/auth/route.ts
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (token !== process.env.OPERATOR_TOKEN) {
    return new Response('Unauthorized', { status: 401 })
  }

  const response = NextResponse.redirect(new URL('/operator', req.url))
  response.cookies.set('op-token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1년
  })
  return response
}

// src/middleware.ts
export function middleware(req: NextRequest) {
  const token = req.cookies.get('op-token')?.value
  if (token !== process.env.OPERATOR_TOKEN) {
    return new Response('Unauthorized', { status: 401 })
  }
}
export const config = { matcher: ['/(operator)/:path*'] }
```

**흐름**:

1. Mhkim이 최초 접속 시 `https://app.vercel.app/api/auth?token=xxxx` (xxxx는 `.env.local`의 `OPERATOR_TOKEN` 값)
2. Route Handler가 토큰 검증 → 쿠키 설정 → `/operator`로 리다이렉트
3. 이후 1년간 자동 로그인 상태 유지

**주의사항 (AI 어시스턴트 가드)**:

- Next.js 15 middleware는 `cookies.get()`만 가능. `cookies.set()`은 Route Handler 또는 Server Action에서만.
- AI가 헷갈리지 않도록 이 제약을 프로젝트 README 또는 코드 주석에 명시.

**NFR-S5 충족**: "자물쇠 한 개" 수준의 보안, 로그인 시스템 없음, 비밀번호 해싱 없음, 세션 관리 없음.

### API & Communication Patterns

**결정 3: 이벤트 수집 엔드포인트 + Runtime 분리**

Next.js App Router의 route별 runtime 선언을 활용해 **Gateway와 Collector를 다른 runtime**으로 배포.

- **Event Collector**: Edge Runtime
  - `src/app/api/events/route.ts` 에 `export const runtime = 'edge'`
  - 클라이언트 `navigator.sendBeacon`으로 호출 (브라우저 종료 직전도 도달 보장, NFR-R1)
  - Neon `@neondatabase/serverless`로 직접 INSERT
  - Cold start 거의 없음, Published Page 성능 영향 최소
- **LLM Gateway**: Node Runtime
  - `src/app/api/ideas/[id]/generate/route.ts` 에 `export const runtime = 'nodejs'` (기본값)
  - `@anthropic-ai/sdk` 사용, 안정적인 Node 런타임
  - Kill Switch 체크 쿼리 + LLM 호출 + 결과 저장이 한 핸들러 내에서 처리
- **나머지 Route Handler**: Node Runtime (기본값, 명시 불필요)
  - `POST /api/ideas`, `PATCH /api/ideas/:id/draft`, `POST /api/ideas/:id/publish`, `DELETE /api/ideas/:id` 등

**이유**: 두 런타임이 같을 필요 없음. 각자 최적화된 환경에서 실행.

**API 스타일**: REST (Route Handlers) — GraphQL이나 tRPC 도입하지 않음. 비개발자 + AI 어시스턴트 맥락에서 가장 단순하고 표준적.

**결정 4: Kill Switch 구현 — 순수 함수 + 통합 함수 분리**

Testability Concern #9 실천. 비즈니스 로직을 순수 함수로 분리해 테스트 가능하게.

```ts
// src/lib/llm/budget.ts (순수 함수 — 테스트 쉬움)
export function isBudgetExceeded(
  currentMonthUsage: number,
  maxBudget: number,
  overrideEnabled: boolean
): boolean {
  if (overrideEnabled) return false
  return currentMonthUsage >= maxBudget
}

// src/lib/llm/gateway.ts (DB 의존 통합 함수)
import { db } from '@/db/client'
import { llmCalls } from '@/db/schema'
import { sql, and, gte } from 'drizzle-orm'

export async function checkAndEnforceBudget(): Promise<void> {
  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)

  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(${llmCalls.costUsd}), 0)` })
    .from(llmCalls)
    .where(gte(llmCalls.createdAt, monthStart))

  const usage = Number(result[0]?.total ?? 0)
  const max = Number(process.env.MAX_MONTHLY_USD ?? 50)
  const override = process.env.KILL_SWITCH_OVERRIDE === 'true'

  if (isBudgetExceeded(usage, max, override)) {
    throw new BudgetExceededError(usage, max)
  }
}

export class BudgetExceededError extends Error {
  constructor(public usage: number, public max: number) {
    super(`LLM monthly budget exceeded: $${usage.toFixed(2)} / $${max}`)
    this.name = 'BudgetExceededError'
  }
}
```

**호출 순서 (`src/lib/llm/generate.ts` 내):**

1. `await checkAndEnforceBudget()` — 차단 시 BudgetExceededError throw
2. Anthropic 호출
3. 응답 수신
4. `await logLLMCall(...)` — `llm_calls` 테이블에 INSERT (비용 포함)

**월 리셋**: 월 1일 00:00 UTC 기준 (코드가 아닌 쿼리 조건으로 자연 리셋).

**동시성 주의**: 본인용 도구이므로 동시 요청 거의 없음. 살짝 초과 가능성은 허용.

### Frontend Architecture

**결정 6: Draft 자동저장 — 프롬프트 입력 시작 즉시 DB row 생성**

"없는 id → 있는 id" 상태 머신을 피하기 위한 의도적 단순화.

**흐름:**

1. Operator가 "새 아이디어" 버튼 클릭
2. 프론트엔드가 **즉시** `POST /api/ideas` 호출 (빈 body)
3. 서버가 `status: 'draft'`로 row 생성, `id` 반환 (`slug`는 이 시점엔 생성하지 않거나 임시)
4. 이후 모든 편집은 `id` 기준 `PATCH /api/ideas/:id/draft`
5. 발행 시점에 `POST /api/ideas/:id/publish`가 `slug` 할당 (slug 불변성 트리거는 UPDATE에만 적용되므로 최초 할당은 INSERT/UPDATE 경계)

**새로고침 복구:**

- Operator Console 메인 진입 시 서버에서 `SELECT * FROM ideas WHERE status='draft' ORDER BY updated_at DESC LIMIT 10` 조회
- 가장 최근 draft를 자동 로드 또는 draft 목록 보여주기

**자동저장 훅:**

```ts
// src/lib/hooks/useDraftAutoSave.ts
export function useDraftAutoSave(ideaId: string, formState: DraftState) {
  // Debounce 10초 후 PATCH
  // onBlur 이벤트에서 즉시 PATCH
  // NFR-R4 충족
}
```

**로컬 스토리지 사용 안 함**: 서버가 Single Source of Truth. 여러 기기/탭에서 일관성 유지.

**결정 빈 slug 처리**: INSERT 시 `slug`를 임시값(`draft-<id>`)으로 넣거나 nullable로 두고 발행 시점에 확정. 최종 결정은 Step 5(Implementation Patterns)에서.

**상태 관리 구조:**

- **서버 상태**: TanStack Query (`useQuery`, `useMutation`)
- **로컬 편집 상태**: Zustand (draft 폼의 일시적 변경)
- **URL 상태**: Next.js 라우팅 (검색 파라미터)
- **Global 상태**: 최소화 (필요 없음)

### Infrastructure & Deployment

**결정 5: "아직 출시 전" 자동 검증 파이프라인 (MVP 버전 유지)**

**Runtime 방어선 (1차):**

Published Page 렌더러가 레이아웃 레벨에서 disclaimer 컴포넌트를 하드코딩해 포함. LLM 생성 콘텐츠는 별도 슬롯(`{pageData.hero}`, `{pageData.valueProps}`)에 렌더링돼 disclaimer 영역을 침범할 수 없음.

```tsx
// src/app/[slug]/layout.tsx 또는 페이지 컴포넌트
export default function PublishedPage({ pageData }: Props) {
  return (
    <main>
      <HeroSection data={pageData.hero} />
      <ValueProps data={pageData.valueProps} />
      <CTASection data={pageData.cta} />
      <EmailForm ideaId={pageData.id} />
      <footer data-legal-disclaimer>
        ⚠️ 이 서비스는 아직 출시 전입니다. 관심 신호를 남겨주시면 출시 시 가장 먼저 알려드립니다.
      </footer>
    </main>
  )
}
```

**CI 방어선 (2차):**

GitHub Actions의 `bun run check:legal` 스크립트가 빌드된 HTML에 disclaimer 문구 존재를 grep 검증. 누락 시 배포 차단.

```yaml
# .github/workflows/ci.yml
- name: Legal guardrail check
  run: bun run check:legal
```

```ts
// scripts/check-legal.ts
// .next/server 디렉토리의 HTML 파일들을 읽어 disclaimer 문구 grep
// 누락 시 process.exit(1)
```

**Growth 단계 재검토 대상 (현재 미구현)**:

- **DOM 파서 검증** (Winston 제안): `cheerio`로 `<footer data-legal-disclaimer>` 셀렉터와 텍스트 일치 검증. Grep보다 견고.
- **Publish API 런타임 검증** (Quinn 제안): 발행 시점에 렌더링된 HTML을 파싱해 disclaimer 존재 확인. CI보다 확실.
- **Playwright smoke test**: 발행된 페이지를 실제 브라우저로 로드해 disclaimer 렌더링 확인.

이 세 가지는 MVP에서는 오버엔지니어링. 법적 이슈가 현실화되거나 Grow 단계 진입 시 재평가.

**CI/CD 구성:**

- GitHub Actions:
  1. `bun install`
  2. TypeScript 타입 체크 (`bun run typecheck`)
  3. 린트 (`bun run lint`)
  4. 단위 테스트 (Vitest) — 순수 함수 위주
  5. 법적 가드레일 grep 검증 (`bun run check:legal`)
  6. Lighthouse CI (NFR-P1 LCP 측정) — Published Page 샘플 1개
- Vercel: `main` 브랜치 자동 배포
- Drizzle 마이그레이션: `bunx drizzle-kit push` — Vercel 배포 전 수동 실행 (Neon은 마이그레이션 자동화 없음)

### Decision Impact Analysis

**Implementation Sequence (스토리 순서 힌트):**

1. **Epic 1 Story 1**: 프로젝트 초기 세팅 (Step 3 참조)
2. **Epic 1 Story 2**: DB 스키마 + 마이그레이션 + slug 트리거 (결정 8)
3. **Epic 1 Story 3**: Operator Console 접근 제어 middleware (결정 7)
4. **Epic 1 Story 4**: LLM Gateway 기본 구조 + Kill Switch (결정 1, 4)
5. **Epic 1 Story 5**: Structured Output Zod 스키마 + tool_use (결정 2)
6. **Epic 2~**: 이후 FR 단위 기능 스토리

**Cross-Component Dependencies:**

- 결정 2(Zod 스키마) → 결정 1(LLM 호출), 결정 6(Draft 편집 UI), Published Page Renderer 모두 의존
- 결정 4(Kill Switch) → 결정 1(LLM 호출) 호출 전 체크
- 결정 7(Middleware) → 모든 Operator Route Handler 보호
- 결정 8(스키마) → 모든 데이터 접근 코드의 기반
- 결정 3(Runtime 분리) → 결정 1(Node), 이벤트 수집(Edge)의 배포 전략 결정

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

AI 어시스턴트가 코드를 생성할 때 매번 다른 결정을 내릴 수 있는 **12개 충돌 지점**을 식별했고, 각각에 대해 단 하나의 선택을 확정한다. 이 섹션의 모든 규칙은 `CLAUDE.md` 또는 `.cursorrules` 파일로 프로젝트 루트에 복사되어 AI 어시스턴트가 항상 참조한다.

### Naming Patterns

**Database (Drizzle + Postgres):**

- 테이블명: **`snake_case`** + **복수형** — `ideas`, `events`, `email_collections`, `llm_calls`
- 컬럼명: **`snake_case`** — `final_prompt`, `created_at`, `idea_id`
- Drizzle TypeScript 프로퍼티명: **`camelCase`** — `finalPrompt`, `createdAt`, `ideaId` (Drizzle의 컬럼 매핑 기능으로 자동 변환)
- 외래 키: **`<참조_테이블_단수>_id`** — `idea_id` (NOT `fk_idea` or `ideaId`)
- 인덱스명: **`<테이블>_<컬럼>_idx`** — `ideas_slug_idx`, `events_idea_id_created_at_idx`
- Unique 인덱스명: 일반 인덱스와 동일한 패턴 — `email_collections_idea_email_idx`

**API (Next.js Route Handlers):**

- 엔드포인트: **`/api/<리소스_복수>`** — `/api/ideas`, `/api/events`
- 개별 리소스: **`/api/<리소스>/[id]`** — `/api/ideas/[id]`
- 서브리소스/액션: **`/api/<리소스>/[id]/<액션>`** — `/api/ideas/[id]/publish`, `/api/ideas/[id]/draft`, `/api/ideas/[id]/archive`
- 라우트 파라미터: **`[id]`** (Next.js 표준)
- 쿼리 파라미터: **`camelCase`** — `?status=archived&sortBy=createdAt`

**Code (TypeScript/React):**

- 파일명 — **React 컴포넌트**: **`PascalCase.tsx`** — `IdeaCard.tsx`, `DashboardTable.tsx`
- 파일명 — **유틸/훅/서비스**: **`camelCase.ts`** — `useDraftAutoSave.ts`, `generateLanding.ts`, `slugify.ts`
- 파일명 — **Route Handler**: **`route.ts`** (Next.js 고정)
- 디렉토리명: **`kebab-case`** — `src/lib/llm/`, `src/app/api/ideas/`
- 함수명: **`camelCase`** — `generateLanding`, `isBudgetExceeded`
- React 컴포넌트명: **`PascalCase`** — `IdeaCard`, `DashboardTable`
- 상수: **`SCREAMING_SNAKE_CASE`** — `MAX_MONTHLY_USD`, `DRAFT_AUTOSAVE_DELAY_MS`
- 타입/인터페이스: **`PascalCase`** — `LandingPageData`, `Idea`, `EventType`
- Enum-like 유니온 타입: `type Status = 'draft' | 'active' | 'archived'` (TypeScript union, NOT `enum`)

### Structure Patterns

**Project Organization (단일 Next.js 앱):**

```
src/
  app/                      # Next.js App Router
    (operator)/            # Route group, middleware로 보호
      layout.tsx           # Operator Console 전체 레이아웃
      page.tsx             # Dashboard (기본 진입)
      ideas/
        new/page.tsx       # 새 아이디어 작성
        [id]/page.tsx      # 아이디어 편집
    [slug]/                # Published Page 동적 라우트 (public)
      page.tsx
      layout.tsx           # disclaimer footer 포함
    api/                   # Route Handlers
      auth/route.ts        # 토큰 → 쿠키 설정
      ideas/
        route.ts           # POST 새 아이디어
        [id]/
          route.ts         # GET/PATCH/DELETE
          draft/route.ts   # PATCH draft 자동저장
          generate/route.ts # POST LLM 생성
          publish/route.ts # POST 발행
          archive/route.ts # POST archive/restore
      events/route.ts      # POST 이벤트 수집 (Edge runtime)
      export/route.ts      # GET JSON export
    layout.tsx             # 루트 레이아웃
    page.tsx               # 랜딩/인덱스 (noindex)
  lib/
    db/
      client.ts            # Neon + Drizzle 클라이언트
      schema.ts            # Drizzle 스키마 정의
      queries/             # 재사용 쿼리 함수
    llm/
      generate.ts          # 메인 LLM 호출 (provider 함수 1개)
      budget.ts            # 순수 함수 (isBudgetExceeded)
      gateway.ts           # 통합 (checkAndEnforceBudget, logLLMCall)
    schemas/
      landing.ts           # Zod: LandingPageData (Single Source of Truth)
    hooks/                 # React 커스텀 훅 (클라이언트 전용)
      useDraftAutoSave.ts
    utils/                 # 순수 유틸
      slug.ts
  components/              # 재사용 UI 컴포넌트
    operator/              # Operator Console 전용
    published/             # Published Page 전용
    shared/                # 공유 UI (Button, Input 등)
  middleware.ts            # Next.js middleware (토큰 보호)
```

**테스트 파일 위치:** `*.test.ts` 또는 `*.test.tsx` 를 **소스 파일과 동일 디렉토리에 co-locate** (별도 `__tests__/` 디렉토리 사용 안 함).

**환경 파일:**

- `.env.local` — 개발 시크릿 (git ignore)
- `.env.local.example` — 템플릿, 필요한 변수 목록 (git commit)
- `.env.production` — 사용 안 함 (Vercel 대시보드에서 관리)

### Format Patterns

**API Response 형식:**

**성공 응답**: **Data 직접 반환** (wrapper 없음)

```ts
// ✅ Good
return NextResponse.json({ id: '...', slug: '...', status: 'active' })

// ❌ Bad
return NextResponse.json({ data: { id: '...' }, error: null })
```

**에러 응답**: **표준 형식 `{ error: string, code?: string }`**

```ts
// ✅ Good
return NextResponse.json(
  { error: 'Idea not found', code: 'NOT_FOUND' },
  { status: 404 }
)
```

**HTTP 상태 코드:**

- `200` — GET/PATCH 성공
- `201` — POST 생성 성공
- `204` — DELETE 성공 (body 없음)
- `400` — 요청 body 잘못됨
- `401` — Operator 토큰 없음/잘못됨
- `404` — 리소스 없음
- `422` — Zod validation 실패 (400과 구분)
- `429` — Kill Switch 발동
- `500` — 서버 에러

**날짜/시간 형식:**

- DB → 클라이언트: **ISO 8601 string** (`"2026-04-06T12:34:56.789Z"`)
- 클라이언트 표시: **`toLocaleString('ko-KR')`** 또는 `Intl.DateTimeFormat`
- Timezone: 저장은 UTC, 표시는 브라우저 로컬

**JSON 필드 명명:**

- API 요청/응답 JSON: **`camelCase`** — `finalPrompt`, `createdAt`, `ideaId`
- DB 컬럼: `snake_case` (Drizzle이 자동 변환)

**Boolean:**

- API에서는 `true`/`false` — `1`/`0` 사용 금지
- Nullable boolean은 피함

### Communication Patterns

**이벤트 수집:**

- Event type: **`snake_case`** — `page_view`, `cta_click`, `email_submit`, `invalid_email`
- Client → Server: `POST /api/events` with body `{ ideaId, eventType, metadata? }`
- Server 저장 시 타임스탬프는 **서버 시간** (클라이언트 시간 무시, 조작 방지)
- `navigator.sendBeacon` 호출 실패 시 `fetch(..., { keepalive: true })` fallback

**State Management:**

- **서버 상태**: TanStack Query (`useQuery`, `useMutation`)
  - Query key: `['ideas']`, `['ideas', id]`, `['ideas', id, 'events']`
  - Mutation 후 invalidation: `queryClient.invalidateQueries({ queryKey: ['ideas', id] })`
- **로컬 편집 상태**: Zustand store (`useDraftStore`)
- **URL 상태**: Next.js router (`useSearchParams`, `useRouter`)
- **Immutable 업데이트**: Zustand의 immer middleware 또는 spread 사용, 직접 mutation 금지

### Process Patterns

**에러 처리:**

- **Route Handler 내 try/catch**: 모든 Route Handler는 최상위 try/catch로 감싸 JSON 에러 응답 반환
- **Client 에러 UI**: React Error Boundary 사용 (`src/app/(operator)/error.tsx`)
- **사용자 메시지 vs 로그**: 기술적 에러는 Sentry로, 사용자에게는 친절한 한글 메시지
- **Zod validation 에러**: 422 + `{ error: 'Validation failed', details: zodError.flatten() }`

**로딩 상태:**

- TanStack Query의 `isPending`, `isError` 활용 (별도 로컬 플래그 금지)
- 전역 로딩 상태 만들지 않음 (컴포넌트 단위로 처리)
- LLM 생성 중: 진행 상태 메시지 + 취소 버튼 (FR5, FR6)
- 로딩 UI: 스피너 또는 skeleton, Tailwind `animate-pulse`

**재시도 로직:**

- LLM 호출: 1회 자동 재시도 (NFR-R3), 이후 사용자에게 재시도 버튼
- TanStack Query: 네트워크 에러만 기본 재시도 3회, 4xx 에러는 재시도 안 함
- 이벤트 수집: 클라이언트 단에서 재시도하지 않음 (서버 사이드 백업 카운트에 의존)

**Validation 타이밍:**

- 클라이언트 입력: **blur 시 Zod 검증** (입력 중에는 허용)
- API Route Handler: 요청 body 수신 즉시 Zod 검증 (빠른 실패)
- DB 쓰기 전: 별도 검증 없음 (Route Handler에서 이미 검증됨)

### Enforcement Guidelines

**All AI Agents MUST:**

1. **이 섹션의 모든 규칙을 암묵적으로 적용**한다. 새 파일·함수·쿼리를 만들 때 반드시 여기 정의된 명명·구조·형식을 따른다.
2. **규칙에 없는 경우**는 기존 코드베이스의 패턴을 답습한다. 새로운 패턴을 도입하지 않는다.
3. **규칙과 충돌하는 상황**이 발생하면 **사용자에게 물어본다.** 자체 판단으로 규칙을 깨지 않는다.
4. **Zod 스키마(`src/lib/schemas/`)는 Single Source of Truth**이다. LLM, API, DB, UI 타입이 모두 여기서 파생된다. 중복 타입 정의 금지.
5. **테스트 파일은 co-location**이다. `__tests__` 디렉토리 만들지 않는다.
6. **환경변수 접근은 `process.env.XXX` 직접**. 래퍼 모듈 만들지 않는다 (YAGNI).

**Pattern Enforcement:**

- 이 섹션은 **`CLAUDE.md` (프로젝트 루트)** 파일로 복사되어 Claude Code가 세션 시작 시마다 자동 로드.
- `.cursorrules` 파일로도 복사 가능 (Cursor 사용 시).
- 규칙이 바뀌면 두 곳 모두 업데이트.

### Pattern Examples

**Good Example: Route Handler**

```ts
// src/app/api/ideas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { ideas } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const patchSchema = z.object({
  finalPrompt: z.string().optional(),
  finalInstructions: z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idea = await db.select().from(ideas).where(eq(ideas.id, params.id)).limit(1)
    if (!idea[0]) {
      return NextResponse.json(
        { error: 'Idea not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
    return NextResponse.json(idea[0])
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = patchSchema.parse(await req.json())
    const updated = await db
      .update(ideas)
      .set(body)
      .where(eq(ideas.id, params.id))
      .returning()
    return NextResponse.json(updated[0])
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', code: 'VALIDATION_ERROR', details: err.flatten() },
        { status: 422 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Anti-Patterns (금지):**

- ❌ `return { data, error: null }` wrapper (direct return 사용)
- ❌ `snake_case` 변수명 in TypeScript (`camelCase` 사용)
- ❌ `enum` 타입 (TypeScript union `'a' | 'b'` 사용)
- ❌ `__tests__` 디렉토리 (co-location 사용)
- ❌ `await db.raw('SELECT ...')` (Drizzle 쿼리 빌더 사용)
- ❌ Provider abstraction interface (함수 1개가 경계)
- ❌ Global loading 상태 store (TanStack Query 내장 사용)
- ❌ `new Date().toString()` (ISO 사용)
- ❌ `response.data.data.items` 같은 깊은 중첩 (wrapper 금지)
- ❌ `localStorage.setItem('draft', ...)` (서버 저장 사용)

## Project Structure & Boundaries

### Complete Project Directory Structure

```
blog-practice/
├── README.md                        # 로컬 실행/배포/구조 5줄 이내 (NFR-M4)
├── CLAUDE.md                        # AI 어시스턴트 규칙 (Step 5 복사)
├── .cursorrules                     # Cursor 사용 시 (선택)
├── package.json                     # bun 스크립트
├── bun.lockb                        # Bun lockfile
├── tsconfig.json                    # TypeScript 설정 (strict)
├── next.config.ts                   # Next.js 15 설정
├── tailwind.config.ts               # Tailwind v4 설정
├── postcss.config.js
├── drizzle.config.ts                # Drizzle migration 설정
├── .env.local                       # 로컬 시크릿 (gitignore)
├── .env.local.example               # 템플릿 (commit)
├── .gitignore
├── vitest.config.ts                 # Vitest 설정
├── .github/
│   └── workflows/
│       └── ci.yml                   # typecheck + lint + test + legal check + lighthouse
├── scripts/
│   ├── check-legal.ts               # "아직 출시 전" grep 검증 (NFR-O5)
│   └── seed.ts                      # 로컬 개발용 시드 (선택)
├── drizzle/
│   ├── schema.sql                   # 자동 생성 마이그레이션
│   └── custom/
│       └── slug_immutable.sql       # Postgres 트리거 (수동 관리)
├── src/
│   ├── middleware.ts                # Operator Console 토큰 보호 (NFR-S5)
│   ├── instrumentation.ts           # Sentry 초기화 (NFR-O3)
│   ├── app/
│   │   ├── layout.tsx               # 루트 레이아웃 (html/body)
│   │   ├── globals.css              # Tailwind 전역
│   │   ├── page.tsx                 # 랜딩/인덱스 (noindex)
│   │   ├── (operator)/              # 🔒 Route group, middleware로 보호
│   │   │   ├── layout.tsx           # Operator Console 레이아웃
│   │   │   ├── page.tsx             # Dashboard (FR33~FR41)
│   │   │   ├── ideas/
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx     # 새 아이디어 시작
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx     # 편집 화면 (FR1~FR10, FR19)
│   │   │   │       └── preview/
│   │   │   │           └── page.tsx # 발행 전 Visitor 시점 미리보기 (FR19)
│   │   │   └── export/
│   │   │       └── page.tsx         # JSON 다운로드 버튼 (FR51)
│   │   ├── [slug]/                  # 🌐 Published Page (public)
│   │   │   ├── layout.tsx           # disclaimer footer 포함 (NFR-PR2)
│   │   │   └── page.tsx             # 랜딩페이지 렌더링 (FR20~FR26)
│   │   ├── auth/
│   │   │   └── route.ts             # GET: 토큰 → 쿠키 설정 (결정 7)
│   │   └── api/
│   │       ├── ideas/
│   │       │   ├── route.ts         # POST: 새 draft 생성 / GET: 목록
│   │       │   └── [id]/
│   │       │       ├── route.ts     # GET/PATCH/DELETE
│   │       │       ├── draft/
│   │       │       │   └── route.ts # PATCH: draft 자동저장 (FR50)
│   │       │       ├── generate/
│   │       │       │   └── route.ts # POST: LLM 생성 (Node runtime)
│   │       │       ├── publish/
│   │       │       │   └── route.ts # POST: slug 할당 + status=active
│   │       │       ├── archive/
│   │       │       │   └── route.ts # POST: status=archived / 복원
│   │       │       └── emails/
│   │       │           └── route.ts # GET: 수집된 이메일 목록 (FR38)
│   │       ├── events/
│   │       │   └── route.ts         # POST: 이벤트 수집 (Edge runtime!)
│   │       └── export/
│   │           └── route.ts         # GET: JSON export (FR51)
│   ├── lib/
│   │   ├── db/
│   │   │   ├── client.ts            # Neon + Drizzle
│   │   │   ├── schema.ts            # 4 테이블 정의
│   │   │   └── queries/
│   │   │       ├── ideas.ts
│   │   │       ├── events.ts
│   │   │       ├── emails.ts
│   │   │       └── llmCalls.ts
│   │   ├── llm/
│   │   │   ├── generate.ts          # 메인 LLM 호출 (Anthropic 직접)
│   │   │   ├── budget.ts            # 순수: isBudgetExceeded
│   │   │   ├── budget.test.ts       # 순수 함수 유닛 테스트
│   │   │   └── gateway.ts           # 통합: checkAndEnforceBudget, logLLMCall
│   │   ├── schemas/
│   │   │   └── landing.ts           # Zod: LandingPageData (SSoT)
│   │   ├── hooks/
│   │   │   └── useDraftAutoSave.ts  # 10s debounce + blur 트리거 (NFR-R4)
│   │   └── utils/
│   │       ├── slug.ts
│   │       ├── slug.test.ts
│   │       ├── date.ts              # ko-KR 포맷팅
│   │       └── tracking.ts          # sendBeacon + fetch fallback
│   └── components/
│       ├── shared/                  # Button, Input, Label, Dialog
│       │   ├── Button.tsx
│       │   ├── Input.tsx
│       │   ├── Dialog.tsx
│       │   └── EmptyState.tsx       # FR39 empty state
│       ├── operator/
│       │   ├── DashboardTable.tsx   # FR33/34
│       │   ├── IdeaCard.tsx
│       │   ├── PromptEditor.tsx     # FR1/2 입력 UI
│       │   ├── GenerationProgress.tsx # FR5 상태 + FR6 취소
│       │   ├── InlineEditor.tsx     # FR10
│       │   ├── ArchivedSection.tsx  # FR37
│       │   ├── ArchiveConfirmDialog.tsx # FR43
│       │   ├── DeleteConfirmDialog.tsx  # FR47
│       │   ├── StatusMessage.tsx    # FR40
│       │   └── EmailList.tsx        # FR38
│       └── published/
│           ├── HeroSection.tsx
│           ├── ValueProps.tsx
│           ├── CTASection.tsx
│           ├── EmailForm.tsx        # FR19, FR22, FR23, FR24, FR26
│           └── LegalDisclaimerFooter.tsx # FR25, NFR-PR2 (하드코딩, 변경 금지)
└── public/
    ├── favicon.ico
    └── og-default.png               # OG 메타 기본 이미지
```

### Architectural Boundaries

**API Boundaries**

| 엔드포인트 | Runtime | 인증 | 목적 |
|---|---|---|---|
| `GET /auth?token=...` | Node | 없음 | 쿠키 설정 (토큰 교환) |
| `POST /api/ideas` | Node | Middleware | 빈 draft 생성 |
| `GET /api/ideas` | Node | Middleware | 목록 조회 |
| `GET /api/ideas/[id]` | Node | Middleware | 단일 조회 (편집 복구) |
| `PATCH /api/ideas/[id]` | Node | Middleware | 메타 업데이트 |
| `PATCH /api/ideas/[id]/draft` | Node | Middleware | draft 자동저장 |
| `POST /api/ideas/[id]/generate` | Node | Middleware | LLM 생성 + Kill Switch |
| `POST /api/ideas/[id]/publish` | Node | Middleware | slug 할당 + status 전환 |
| `POST /api/ideas/[id]/archive` | Node | Middleware | active ↔ archived |
| `DELETE /api/ideas/[id]` | Node | Middleware | 완전 삭제 (cascade) |
| `GET /api/ideas/[id]/emails` | Node | Middleware | 수집 이메일 조회 |
| `POST /api/events` | **Edge** | 없음 (public) | 이벤트 수집 |
| `GET /api/export` | Node | Middleware | JSON 전체 덤프 |

**Component Boundaries**

- **`(operator)` route group** ↔ **public routes**: Next.js middleware가 경계 강제.
- **`components/operator/` vs `components/published/`**: **코드 공유 금지**. Published Page는 JS 번들 < 50KB (NFR-P2) 제약 때문. 공유 요소는 `components/shared/`에만.
- **서버 컴포넌트 vs 클라이언트 컴포넌트**: Published Page는 최대한 **서버 컴포넌트**로. 이벤트 트래킹, 이메일 폼만 `'use client'`.

**Data Boundaries**

- **DB 접근은 `src/lib/db/queries/` 모듈만**을 통과. Route Handler나 컴포넌트에서 `db.select()` 직접 호출 금지.
- **Zod 스키마는 `src/lib/schemas/landing.ts`가 Single Source of Truth**.
- **`email_collections` 테이블은 지정된 query 모듈만 접근**.
- **`llm_calls` 테이블은 Kill Switch와 비용 대시보드에서만 읽힘**.

**Runtime Boundaries**

- **Edge Runtime**: `src/app/api/events/route.ts` 단 1곳
- **Node Runtime**: 그 외 모든 Route Handler
- **Edge와 Node 간 공유 코드**: Edge-compatible만 (`@neondatabase/serverless`)

### Requirements to Structure Mapping

PRD의 55개 FR을 파일/디렉토리에 매핑:

**Idea Creation (FR1~FR7, FR55)**

- `src/app/(operator)/ideas/[id]/page.tsx`, `src/components/operator/PromptEditor.tsx`, `GenerationProgress.tsx`
- `src/app/api/ideas/[id]/generate/route.ts`
- `src/lib/llm/generate.ts`, `gateway.ts`, `budget.ts`
- `src/lib/schemas/landing.ts`

**Idea Editing (FR8~FR12)**

- `src/components/operator/InlineEditor.tsx`, `PromptEditor.tsx`
- `src/app/api/ideas/[id]/generate/route.ts`, `draft/route.ts`
- `src/lib/hooks/useDraftAutoSave.ts`

**Publishing (FR13~FR19)**

- `src/app/api/ideas/[id]/publish/route.ts`
- `src/lib/utils/slug.ts`
- `src/app/(operator)/ideas/[id]/preview/page.tsx` (FR19)

**Published Page Experience (FR20~FR26)**

- `src/app/[slug]/page.tsx`, `layout.tsx`
- `src/components/published/*`

**Data Collection (FR27~FR32)**

- `src/lib/utils/tracking.ts` (클라이언트)
- `src/app/api/events/route.ts` (Edge 서버)
- `src/lib/db/queries/events.ts`

**Dashboard & Comparison (FR33~FR41)**

- `src/app/(operator)/page.tsx`
- `src/components/operator/DashboardTable.tsx`, `IdeaCard.tsx`, `StatusMessage.tsx`, `ArchivedSection.tsx`, `EmptyState.tsx`, `EmailList.tsx`

**Archive & Delete (FR42~FR47)**

- `src/app/api/ideas/[id]/archive/route.ts`, `route.ts` (DELETE)
- `src/components/operator/ArchiveConfirmDialog.tsx`, `DeleteConfirmDialog.tsx`

**Data Management (FR48~FR51)**

- `src/lib/db/schema.ts`
- `src/lib/hooks/useDraftAutoSave.ts`
- `src/app/api/export/route.ts`
- `src/app/(operator)/export/page.tsx`

**System Integrity (FR52~FR54)**

- Drizzle 마이그레이션 (slug unique + 트리거)
- `src/lib/llm/generate.ts` (재시도)
- `src/app/[slug]/page.tsx` (noindex 메타)

### Cross-Cutting Concerns 매핑

| Concern | 파일/디렉토리 |
|---|---|
| 1. LLM I/O 신뢰성 | `src/lib/llm/*` + `api/ideas/[id]/generate/route.ts` + `schemas/landing.ts` |
| 2. 데이터 수집 파이프라인 | `utils/tracking.ts` + `api/events/route.ts` + `db/queries/events.ts` |
| 3. 법적 가드레일 | `components/published/LegalDisclaimerFooter.tsx` + `scripts/check-legal.ts` |
| 4. URL 불변성 | Drizzle 트리거 + `api/ideas/[id]/route.ts` PATCH slug 제외 |
| 5. 상태 관리 2중성 | `db/schema.ts` enum + `components/operator/DashboardTable.tsx` |
| 6. Observability & Cost | `db/queries/llmCalls.ts` + `instrumentation.ts` |
| 7. Schema SSoT | `lib/schemas/landing.ts` |
| 8. CI/Build 파이프라인 | `.github/workflows/ci.yml` + `scripts/check-legal.ts` |
| 9. 테스트 가능한 경계 | `lib/llm/budget.ts` (순수) vs `gateway.ts` (DB) |

### Integration Points

**Internal Communication:**

- 컴포넌트 → API: `fetch` via TanStack Query
- API → DB: Drizzle ORM
- API → LLM: `@anthropic-ai/sdk`
- Published Page → 이벤트 API: `navigator.sendBeacon`

**External Integrations:**

- Anthropic Claude API — `src/lib/llm/generate.ts`
- Neon Postgres — `src/lib/db/client.ts`
- Sentry — `instrumentation.ts`
- Vercel Analytics (선택) — `src/app/layout.tsx`

**Data Flow (Happy Path):**

1. **생성**: Operator → Dashboard `+ 새 아이디어` → `POST /api/ideas` (빈 draft) → 편집 페이지
2. **편집**: 프롬프트 입력 → `POST /api/ideas/[id]/generate` → Kill Switch 체크 → LLM → Zod 검증 → DB → UI
3. **발행**: `POST /api/ideas/[id]/publish` → slug 생성 → DB `status=active` → URL 반환
4. **트래픽**: Visitor → `/[slug]` 렌더 → 이벤트 (`sendBeacon` → Edge API → DB)
5. **분석**: Operator Dashboard → TanStack Query → 표 렌더

### Development Workflow Integration

**Development Server:**

- `bun run dev` → Next.js dev server (Turbopack) on `localhost:3000`
- `.env.local` 자동 로드
- Neon DB는 원격 (로컬 Postgres 불필요) — **NFR-M3 "5분 재구축" 달성**

**Build Process:**

- `bun run build` → Next.js 프로덕션 빌드
- `bun run start` → 로컬 프로덕션 테스트
- Vercel: GitHub push 시 자동 빌드

**Deployment:**

- `main` 브랜치 push → Vercel 자동 배포
- 배포 전 CI: `bun run typecheck && bun run lint && bun run test && bun run check:legal`
- DB 마이그레이션: `bunx drizzle-kit push` (수동, 배포 전)

**Drizzle 마이그레이션 관리:**

- `bunx drizzle-kit generate` — 스키마 변경 시 SQL 생성
- `bunx drizzle-kit migrate` — Neon에 적용
- 슬러그 트리거 같은 non-schema SQL은 `drizzle/custom/` 별도 관리

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility**

모든 기술 결정이 서로 호환된다. 주요 체크 포인트:

- Next.js 15 + React 19 + Tailwind v4 + TypeScript: 공식 지원 조합
- Bun 1.x + Next.js: Vercel 공식 지원
- Neon `@neondatabase/serverless` + Drizzle ORM + Edge Runtime: Neon 공식 호환
- `@anthropic-ai/sdk` + Node Runtime: 표준 SDK, 호환 이슈 없음
- TanStack Query v5 + Zustand v4: 서로 독립, 충돌 없음

**버전 충돌 체크**: 2026년 4월 기준 최신 stable 버전들만 선택. 주요 의존성 간 알려진 호환 이슈 없음.

**Pattern Consistency**

- 네이밍 패턴(snake_case DB / camelCase TS)은 Drizzle의 자동 매핑과 정합
- Route Handler 에러 응답 형식(`{error, code}`)이 전 경로에서 일관 적용 가능
- 테스트 co-location은 Vitest + Turbopack에서 문제없이 작동
- Zod Single Source of Truth 패턴은 TanStack Query + Drizzle과 호환

**Structure Alignment**

- `(operator)` route group + middleware 토큰 보호 = NFR-S5 충족
- `[slug]` dynamic route + SSG = NFR-P1 (LCP < 2.5s) 달성 가능
- `api/events` Edge runtime 분리 = NFR-R1 충족
- `components/operator/` ↔ `components/published/` 엄격 분리 = NFR-P2 달성 가능
- `drizzle/custom/slug_immutable.sql` 트리거 = NFR-R2 DB 레벨 보장

### Requirements Coverage Validation ✅

**Functional Requirements: 55/55 커버**

| FR 그룹 | 커버 상태 | 담당 모듈 |
|---|---|---|
| FR1~FR7, FR55 (Idea Creation + Kill Switch) | ✅ | `PromptEditor.tsx`, `GenerationProgress.tsx`, `api/ideas/[id]/generate/route.ts`, `lib/llm/*` |
| FR8~FR12 (Idea Editing) | ✅ | `InlineEditor.tsx`, `api/ideas/[id]/draft/route.ts`, `useDraftAutoSave.ts` |
| FR13~FR19 (Publishing) | ✅ | `api/ideas/[id]/publish/route.ts`, `lib/utils/slug.ts`, `preview/page.tsx` |
| FR20~FR26 (Visitor UX + 법적 가드레일) | ✅ | `app/[slug]/*`, `components/published/*`, `LegalDisclaimerFooter.tsx` |
| FR27~FR32 (Data Collection) | ✅ | `utils/tracking.ts`, `api/events/route.ts` (Edge), `db/queries/events.ts` |
| FR33~FR41 (Dashboard) | ✅ | `(operator)/page.tsx`, `DashboardTable.tsx` + 관련 컴포넌트 |
| FR42~FR47 (Archive & Delete) | ✅ | `api/ideas/[id]/archive/route.ts`, `DeleteConfirmDialog.tsx` |
| FR48~FR51 (Data Management) | ✅ | `db/schema.ts`, `useDraftAutoSave.ts`, `api/export/route.ts` |
| FR52~FR54 (System Integrity) | ✅ | Postgres 트리거, `lib/llm/generate.ts` 재시도, noindex 메타 |

**Non-Functional Requirements: 24/24 커버**

| NFR | 커버 방법 |
|---|---|
| NFR-P1 (LCP < 2.5s) | SSG + CDN 엣지, JS 번들 격리 |
| NFR-P2 (JS 번들 < 50KB) | 컴포넌트 분리 원칙, 서버 컴포넌트 우선 |
| NFR-P3 (발행 60s p50) | Node runtime Gateway + Vercel 자동 배포 |
| NFR-P4 (LLM 30s p95) | `@anthropic-ai/sdk` 타임아웃 + 진행 상태 UI |
| NFR-P5 (Dashboard 3s) | TanStack Query 캐싱 + Drizzle 인덱스 |
| NFR-R1 (데이터 수신 100%) | Edge Runtime + `sendBeacon` + 원본 로그 |
| NFR-R2 (URL 불변성 100%) | Postgres 트리거 + 애플리케이션 가드 이중 |
| NFR-R3 (LLM 자동 재시도) | `lib/llm/generate.ts` 1회 재시도 |
| NFR-R4 (Draft blur/10s) | `useDraftAutoSave.ts` + draft API |
| NFR-R5 (Published 가용성) | Vercel SLA 수용 |
| NFR-S1 (HTTPS) | Vercel 기본 |
| NFR-S2 (이메일 at-rest encryption) | Neon 기본 encryption |
| NFR-S3 (secret management) | Vercel Environment Variables |
| NFR-S4 (최소 수집) | `email_collections` 필드 제한 |
| NFR-S5 (Operator 접근 제어) | middleware + cookie 토큰 |
| NFR-PR1~PR3 (Privacy) | `EmailForm`, `LegalDisclaimerFooter`, 운영 원칙 |
| NFR-A1~A4 (Accessibility) | Tailwind 대비율 + 시맨틱 규약 |
| NFR-M1 (익숙한 스택) | "AI 어시스턴트 친화 스택"으로 재해석 |
| NFR-M2 (단일 리포) | Next.js 단일 앱 |
| NFR-M3 (5분 재구축) | Bun + Neon 원격 + Vercel |
| NFR-M4 (README 미니멀) | 5줄 제약 명시 |
| NFR-M5 (TypeScript) | strict 기본 |
| NFR-O1 (LLM 호출 로그) | `llm_calls` 테이블 + `logLLMCall` |
| NFR-O2 (이벤트 감사) | `events` 테이블 원본 로그 |
| NFR-O3 (Error tracking) | Sentry `instrumentation.ts` |
| NFR-O4 (비용 모니터링 + Kill Switch) | `budget.ts` + `gateway.ts` |
| NFR-O5 (법적 가드레일 자동 검증) | `scripts/check-legal.ts` grep CI |

**Cross-Cutting Concerns: 9/9 커버**

Step 6의 Cross-Cutting Concerns 매핑 표 참조. 9개 concern 모두 구체적 파일/디렉토리에 할당됨.

### Implementation Readiness Validation ✅

**Decision Completeness**

- ✅ 모든 Critical 결정(8개)이 구체적 코드/설정 수준까지 문서화
- ✅ 버전 번호 명시 (Next.js 15, React 19, Tailwind v4, Bun 1.x)
- ✅ LLM Provider, 런타임, 스키마 전부 확정

**Structure Completeness**

- ✅ 전체 디렉토리 트리 정의 (파일 단위)
- ✅ 모든 Route Handler 위치 명시
- ✅ 컴포넌트 경계 명확
- ✅ 의존성 방향 일방향 (API → lib → db)

**Pattern Completeness**

- ✅ 네이밍 (DB/API/Code) 일관 규칙
- ✅ 에러 처리, 로딩, 재시도, validation 패턴 모두 정의
- ✅ AI 어시스턴트 Enforcement Guidelines 6개 MUST 규칙
- ✅ Good/Anti-pattern 예시 포함

### Gap Analysis Results

**Critical Gaps: 없음** ✅

**Important Gaps (구현 시 처리):**

1. **OG 이미지 생성 전략 미정** — `og:image` 실제 생성 방법 구현 시 결정. 제안: Next.js `ImageResponse` API로 동적 OG 생성.
2. **`og-default.png` 초기 이미지** — 파일 생성 필요.
3. **Lighthouse CI 구체 설정** — `lighthouserc.json` 기본 설정 Epic 1 Story 1에 포함.
4. **`OPERATOR_TOKEN` 생성 방법** — `openssl rand -hex 32` 가이드 포함.

**Nice-to-Have Gaps (Growth 단계 재검토):**

1. Rate limiting (Visitor 이벤트 수집)
2. Email 검증 강화 (DNS MX 확인)
3. LLM 응답 캐싱 (비용 최적화)
4. Sentry 외 모니터링 대안 (PostHog, Vercel Analytics)

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Medium)
- [x] Technical constraints identified (13개)
- [x] Cross-cutting concerns mapped (9개)

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions (8개)
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**

- [x] Naming conventions established (DB/API/Code)
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented
- [x] AI 어시스턴트 Enforcement Guidelines 6개

**✅ Project Structure**

- [x] Complete directory structure defined (파일 단위)
- [x] Component boundaries established
- [x] Integration points mapped (13개 API endpoint)
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** ✅ **READY FOR IMPLEMENTATION**

**Confidence Level:** **High**

**Key Strengths:**

1. **비개발자 + AI 어시스턴트 맥락에 최적화** — 모든 결정이 "AI 어시스턴트가 쉽게 코드 생성할 수 있는가"를 기준으로 선택됨.
2. **극단적 단순성** — Provider abstraction 제거, enum 금지, wrapper 금지 등 의도적 '덜 만들기' 선택.
3. **이중 방어선** — 법적 가드레일(하드코딩 footer + CI grep), URL 불변성(DB 트리거 + 쿼리 가드), 데이터 수집(클라이언트 beacon + 서버 백업).
4. **Single Source of Truth 원칙** — Zod 스키마 1곳, DB 스키마 1곳, 타입 정의 중복 금지.
5. **Testability 내장** — 순수 함수 분리(`budget.ts`), co-location 테스트.
6. **비용 통제** — Kill Switch + 무료 티어 스택으로 PRD 예산 준수 보장.

**Areas for Future Enhancement (Post-MVP):**

1. 법적 가드레일 강화 (DOM 파서 + Playwright smoke test) — Party Mode 제안 보존
2. LLM 응답 캐싱 — 비용 최적화
3. Rate limiting — 악의적 트래픽 대비
4. Sentry 외 모니터링 통합
5. Provider Abstraction 재도입 — 실제 OpenAI 전환 필요 시

### Implementation Handoff

**AI Agent Guidelines:**

- 모든 아키텍처 결정을 그대로 따를 것
- Implementation Patterns(Step 5)의 6개 MUST 규칙 엄수
- `src/lib/schemas/landing.ts`가 타입 Single Source of Truth
- `components/operator/` ↔ `components/published/` 코드 공유 절대 금지
- 모호한 상황에서는 사용자에게 물어볼 것 (규칙 자체 판단 금지)

**First Implementation Priority (Epic 1 Story 1):**

```bash
# 1. 프로젝트 생성
bunx create-next-app@latest blog-practice \
  --typescript --tailwind --app --src-dir \
  --import-alias "@/*" --turbopack --use-bun

cd blog-practice

# 2. 의존성 설치
bun add drizzle-orm @neondatabase/serverless
bun add -D drizzle-kit @types/node
bun add @anthropic-ai/sdk zod
bun add @tanstack/react-query zustand
bun add -D vitest @vitejs/plugin-react @testing-library/react

# 3. .env.local 생성 (4개 필수 변수)
#    DATABASE_URL=(Neon dashboard)
#    ANTHROPIC_API_KEY=(Anthropic console)
#    OPERATOR_TOKEN=$(openssl rand -hex 32)
#    MAX_MONTHLY_USD=50

# 4. Neon 프로젝트 생성 + 연결 문자열 복사
# 5. GitHub 리포 + Vercel 연결
# 6. CLAUDE.md 프로젝트 루트에 생성 (Step 5 규칙 복사)
```

**Acceptance Criteria for Story 1:**

- [ ] `bun run dev` 성공, `localhost:3000` 기본 페이지 표시
- [ ] Vercel 배포 URL 접근 가능
- [ ] Neon DB 연결 확인 (`SELECT 1`)
- [ ] `.env.local.example` 작성 완료
- [ ] `README.md` 5줄 이내 요약
- [ ] `CLAUDE.md` 프로젝트 루트에 존재
- [ ] GitHub Actions 스켈레톤

## Workflow Completion

### Documents Produced

- **Product Brief**: `_bmad-output/planning-artifacts/product-brief-blog-practice.md`
- **PRD**: `_bmad-output/planning-artifacts/prd.md` (55 FR, 24 NFR, 813줄)
- **Architecture**: `_bmad-output/planning-artifacts/architecture.md` (이 문서)

### Next Workflows

1. **`/bmad-create-epics-and-stories`** — PRD + Architecture 기반 Epic/Story 분해
2. **`/bmad-create-ux-design`** (선택) — UX 스펙 작성 (이 제품은 UI가 단순해서 스킵 가능)
3. **`/bmad-check-implementation-readiness`** — 구현 시작 전 최종 검증
4. **`/bmad-dev-story`** — 첫 스토리부터 실제 코드 구현

### Handoff Notes

- **PRD NFR-M1 재해석**: "Operator가 이미 능숙한 스택" → "AI 어시스턴트 도움으로 작업 가능한 스택". 이 변경은 Architecture 문서에만 반영됨. PRD 동기화가 필요하면 별도 작업.
- **스택 변경**: PRD가 제안한 Supabase → Architecture에서 Neon으로 확정. 이유: 주말 사용 패턴과 비활성 일시정지 제약 충돌.
- **Party Mode 결정 23개** 모두 이 문서에 녹아있음. 주요 미래 재검토 대상은 Architecture Readiness Assessment의 "Areas for Future Enhancement" 참조.
