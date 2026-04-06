---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation-skipped', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
status: 'final'
completed: '2026-04-06'
lastSynced: '2026-04-06 (Architecture에서 NFR-M1 재해석 + DB Supabase→Neon 반영)'
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-blog-practice.md
workflowType: 'prd'
classification:
  projectType: web_app
  projectIdentity: "primary: 검증 분석 도구 / secondary: 생성 도구"
  domain: general
  domainFlag: "quasi-regulated (consumer protection) — soft recommendation only"
  complexity: medium
  projectContext: greenfield
partyModeDecisions:
  - "법률 가드레일: soft recommendation (원칙 명시, 강제 아님)"
  - "같은 아이디어 = 같은 URL = 최신 버전 1개 (덮어쓰기 원칙)"
  - "데이터(PV/클릭/이메일): 시계열 누적"
  - "프롬프트 + 최종 페이지 1쌍: 각 아이디어당 1쌍 (생성 날짜 포함)"
  - "중간 재생성 시행착오: 저장하지 않음"
  - "인라인 편집 히스토리: 저장하지 않음 (덮어쓰기)"
---

# Product Requirements Document - blog-practice

**Author:** Mhkim
**Date:** 2026-04-06

## Table of Contents

1. [Executive Summary](#executive-summary) — 짧음
2. [Glossary](#glossary) — 짧음 (핵심 용어 7개)
3. [Project Classification](#project-classification) — 짧음
4. [Success Criteria](#success-criteria) — 중간
5. [User Journeys](#user-journeys) — **가장 김** (6개 여정 내러티브)
6. [Domain-Specific Requirements](#domain-specific-requirements) — 중간
7. [Web App Specific Requirements](#web-app-specific-requirements) — 중간
8. [Project Scoping & Phased Development](#project-scoping--phased-development) — 중간 (Risk 테이블 포함)
9. [Functional Requirements](#functional-requirements) — **길음** (55개 FR, Capability Contract)
10. [Non-Functional Requirements](#non-functional-requirements) — **길음** (Performance / Reliability / Security / Privacy / Accessibility / Maintainability / Observability)

**문서 읽는 순서 제안:**

- **의사결정자·스테이크홀더**: 1~4 (5분)
- **UX·PM**: 1~8 (15분)
- **Architect**: 7, 9, 10 (기술 계약)
- **Developer**: 9, 10 (빌드 대상)

**참조 규칙:** `FR1`, `NFR-P1` 같은 식별자는 각각 Functional Requirements와 Non-Functional Requirements 섹션의 항목을 가리킨다. 항목별 상세는 해당 섹션에서 확인.

## Executive Summary

**blog-practice**는 1인 메이커를 위한 아이디어 검증 도구다. 한 줄짜리 아이디어 프롬프트를 입력하면 LLM이 히어로 카피, 가치제안, CTA, 이메일 수집 폼까지 갖춘 텍스트 기반 랜딩페이지를 즉시 생성하고, 각 페이지는 고유 URL로 발행되어 유료 광고와 링크 공유를 통해 잠재 고객 트래픽을 끌어들인다. 페이지뷰, "사전 신청" 버튼 클릭, 이메일 수집은 아이디어별로 단일 대시보드에 누적되어, 일요일 저녁에 다섯 개 아이디어의 반응을 나란히 비교하며 "어떤 것을 실제로 만들지" 결정할 수 있다.

**이 도구가 해결하는 문제:** 메이커에게 아이디어는 가장 값싼 자원이고, 검증은 가장 비싼 자원이다. 현재의 검증 워크플로우(Framer 디자인 → Tally 폼 → GA4 → 광고 → 스프레드시트)는 한 아이디어당 반나절이 소요되며, 대부분의 아이디어는 그 비용을 감당하지 못해 텍스트로만 죽는다. blog-practice는 이 비용을 수 분 단위로 낮춰, 메이커의 의사결정 방식을 "머리로 고민"에서 "데이터로 답"으로 전환한다.

**Why now:** LLM이 카피와 구조화된 페이지 데이터를 한 번에 생성할 수 있는 품질에 도달했고, 서버리스 배포로 URL별 페이지를 무료 수준 비용에 발행할 수 있으며, AI 광고 자동화로 월 수만 원 예산의 검증 캠페인이 가능해졌다. "주 1아이디어 검증"이 실제로 작동하는 최초의 시점이다.

### What Makes This Special

**핵심 통찰:** 검증 비용을 10분의 1로 낮추면 메이커의 의사결정 구조 자체가 바뀐다. 도구는 단순히 시간을 절약하는 것이 아니라, "고민의 형태"를 전환시킨다.

**차별점 3가지:**

1. **"아이디어당 30초" 사고방식 — 단호한 단순성이 곧 속도.** 대부분의 경쟁 도구(Framer, Durable, Mixo 등)는 "좋은 사이트"를 만드는 것이 목표다. blog-practice는 "여러 아이디어를 빠르게 던지기"가 모든 의사결정의 상위 원칙이다. 이미지 없음, 디자인 선택지 없음, 템플릿 선택 없음, 다중 페이지 없음. 기능을 더하는 것이 아니라 **빼는 것**이 제품 원칙이다.

2. **아이디어 단위 병렬 검증 대시보드.** 시장의 분석 도구들은 모두 "사이트 단위" 또는 "세션 단위"로 지표를 보여준다. blog-practice는 **"아이디어 단위"**로 지표를 나란히 비교하는 것이 제1 시민이다. 의사결정의 단위가 다르다.

3. **본인용이라는 단호함이 곧 경쟁력.** 인증, 결제, 멀티테넌시, 권한 관리가 전부 없다. "생산성 도구의 지방"을 걷어낸 결과가 속도다. 이 도구는 본인용이기 **때문에** 더 빠를 수 있다.

**솔직한 자기 인식:** 기술적 해자는 없다. 이 도구의 차별점은 "누구를 위해 만들지 않기로 했는가"에 있다. 디자이너, 에이전시, 회사를 위해서도 만들지 않는다. 오직 "주말에 아이디어 5개를 던지고 싶은 한 사람"을 위한 도구다. 그 단호함이 실행 속도로 번역된다.

## Glossary

이 문서에서 반복적으로 사용되는 핵심 용어의 공식 정의. 본문의 맥락에서 맨 처음 등장할 때 독자가 이 섹션으로 돌아와 확인하면 된다.

- **Operator** — 이 도구를 조작해 아이디어를 발행·편집·archive하고 대시보드에서 지표를 확인하는 **단 1명의 사용자**. 본 제품에서는 Mhkim 본인을 가리킨다. 로그인·인증 없이 환경변수 기반 토큰으로만 접근한다 (NFR-S5).
- **Visitor** — 광고 또는 링크 공유를 통해 발행된 랜딩페이지에 진입하는 **익명의 잠재 고객**. Operator Console에는 접근하지 않으며, Published Page와만 상호작용한다.
- **Idea** — 검증 대상인 한 개의 아이디어 단위. 고유한 `slug`, 최종 프롬프트 1개, 최종 페이지 데이터 1쌍, 시계열 이벤트 로그를 갖는다. `active` 또는 `archived` 상태를 가진다.
- **Draft** — 아직 발행되지 않았거나 편집 중인 아이디어의 **미완성 상태**. 자동저장되며 (NFR-R4), 브라우저 재시작 후에도 복구된다.
- **Published Page** — Visitor가 실제로 보는 **공개 랜딩페이지**. SSG/SSR로 렌더링되며, 성능(NFR-P1/P2)과 이벤트 수집 신뢰성(NFR-R1)이 핵심 품질 속성이다.
- **Slug** — 아이디어에 할당되는 **고유 URL 식별자**. 한 번 발행되면 아이디어의 수명 동안 절대 변경되지 않는다 (NFR-R2). 광고 캠페인 링크의 안정성을 보장하는 핵심 계약.
- **page_data** — LLM이 생성한 **구조화된 랜딩페이지 콘텐츠**를 담는 JSON. 히어로 카피, 서브 카피, 3개 가치제안, CTA 문구, 이메일 폼 라벨을 포함한다. 이 스키마의 강제가 LLM I/O 경계의 핵심 (Project Classification의 Complexity 판단 근거).
- **Hit-beacon** — `navigator.sendBeacon` API 또는 동급 기술을 사용한 **비동기 이벤트 전송** 메커니즘. 브라우저 종료 직전에도 이벤트 기록을 시도해 데이터 누락을 최소화한다 (NFR-R1).
- **Archive** — 아이디어가 활동을 멈춘 상태로 **이동된 것**. 발행 URL과 수집 데이터는 그대로 유지되지만 대시보드 상단에서 사라진다. 완전 삭제(FR47)와 다르다.
- **Kill Switch** — LLM 호출 비용이 월 예산 상한을 초과할 때 **자동으로 LLM 호출을 차단**하는 시스템 동작 (FR55, NFR-O4). 환경변수로 우회 가능.

## Project Classification

| 항목 | 값 |
|---|---|
| **Project Type** | `web_app` (primary identity: 검증 분석 도구 / secondary: 생성 도구) |
| **Domain** | `general` + quasi-regulated (소비자 보호) 플래그 — soft recommendation |
| **Complexity** | `medium` |
| **Project Context** | `greenfield` (빈 리포지토리, 새로 시작) |

**Complexity가 `medium`인 이유:** 스택 자체(Next.js + DB + LLM API + 정적 배포)는 표준이지만, 다음 세 가지가 복잡도를 끌어올린다:

- **LLM I/O 경계**: 프롬프트 → 구조화된 페이지 데이터(JSON schema) → 렌더링 파이프라인. 스키마 강제, fallback, 재생성 플로우가 필요.
- **데이터 수집 신뢰성**: 광고 트래픽에는 adblocker·봇·지역 차단 등 변수가 많아 단순 fetch로 해결되지 않는다.
- **상태 관리**: 아이디어당 프롬프트/최종 페이지/시계열 이벤트를 추적해야 함.

단일 사용자 전제가 대부분의 SaaS 복잡도(인증, 멀티테넌시, 권한)를 제거하기 때문에 high까지는 아니다.

**Quasi-regulated 플래그:** 이 도구는 "실제 제품이 없는 상태에서 관심을 수집"하는 행위를 수행하므로 한국 전자상거래법, GDPR, FTC deceptive advertising 규정의 회색지대에 있다. MVP 단계에서는 **soft recommendation**으로만 다룬다 — 원칙을 명시하되 시스템적으로 강제하지는 않는다.

## Success Criteria

### User Success

1인 사용자(Mhkim 본인) 관점에서 이 도구가 "내 삶의 일부"가 되었을 때의 경험 지표.

- **발행 마찰 체감**: "아이디어 → 발행" 과정에서 **"귀찮다"는 감정이 발생하지 않는다.** 측정: 월 1회 자기 점검 — "이번 달 도구 쓰는 게 부담이었나?" (yes/no). 합격선: 3개월 연속 "no".
- **주간 리추얼 형성**: 일요일 저녁(또는 본인이 정한 요일)에 **대시보드를 여는 습관**이 자연스럽게 형성된다. 측정: 주간 대시보드 방문 횟수. 합격선: 4주 중 3주 이상 방문.
- **해방감 (Qualitative, 핵심)**: 머릿속에 맴돌던 아이디어가 "어딘가에서 검증되고 있다"는 안정감을 느낀다. 측정: 월 1회 1문항 자기 평가 (1~5점). 합격선: 3개월 평균 4점 이상.
- **"아하 모먼트" 재현**: 샤워 중 떠오른 아이디어를 30초 안에 URL로 받아 즉시 공유한 경험이 **월 1회 이상** 발생한다.

### Business Success

1인 도구이므로 매출/성장 지표가 아닌 "이 도구가 일을 하고 있는가"의 증거 지표로 재정의한다.

- **북극성 지표 (Single Metric That Matters)**: **"이 도구를 통해 수집한 데이터가 실제 빌드 의사결정에 쓰인 아이디어 수."** 합격선: **분기당 1개 이상.** 이 한 개가 나오면 도구는 제 값을 한 것이다.
- **누적량**: 월 발행 아이디어 수. 합격선: **월 3개 이상.**
- **검증 데이터 축적**: 아이디어당 최소 1개 이상의 유의미한 신호(클릭 ≥ 10 또는 이메일 ≥ 1)가 수집된다. 합격선: 발행 아이디어의 **70% 이상**이 최소 신호 이상 수집.

### Technical Success

도구가 "검증 루프의 병목이 되지 않는다"는 것을 보장하는 기술적 지표.

이 항목들의 **정식 정의와 측정 기준**은 [Non-Functional Requirements](#non-functional-requirements) 섹션을 참조한다. User/Business Success 관점에서 연결되는 핵심 NFR은 다음과 같다:

- **발행 파이프라인 속도**: NFR-P3 (LLM 응답 완료 ~ URL 사용 가능 p50 60초 이내) + NFR-P4 (LLM 응답 p95 30초 이내)
- **데이터 수집 신뢰성**: NFR-R1 (서버 수신 이벤트 100% 저장 + `sendBeacon` 기반 전송)
- **LLM 실패 복구**: NFR-R3 (자동 재시도 1회 + 명시적 오류 안내)
- **페이지 로딩 성능**: NFR-P1 (LCP < 2.5s p75, Chrome DevTools 4G Slow + Moto G4 기준)
- **URL 불변성**: NFR-R2 (슬러그 100% 불변, DB 제약으로 보장)

### Measurable Outcomes

| 카테고리 | 지표 | 합격선 | 측정 주기 | 상세 |
|---|---|---|---|---|
| User | 해방감 자기 평가 | 평균 ≥ 4/5 | 월 1회 | — |
| User | 주간 대시보드 방문 | 4주 중 3주 | 주 | — |
| Business | 북극성 (빌드 결정된 아이디어 수) | 분기 ≥ 1 | 분기 | — |
| Business | 월 발행 아이디어 수 | ≥ 3 | 월 | — |
| Business | 신호 수집률 | ≥ 70% | 월 | — |
| Tech | 발행 파이프라인 속도 (p50) | ≤ 60s | 실시간 | → NFR-P3 |
| Tech | LLM 응답 시간 (p95) | ≤ 30s | 실시간 | → NFR-P4 |
| Tech | 데이터 수신 저장률 | 100% (서버 수신분) | 일 | → NFR-R1 |
| Tech | LCP (Chrome DevTools 4G Slow) | < 2.5s (p75) | 실시간 | → NFR-P1 |
| Tech | URL 불변성 | 100% | 실시간 | → NFR-R2 |

## User Journeys

이 제품은 1인용이므로 일반적인 Admin/Support/API Consumer 등의 사용자 타입은 존재하지 않는다. 시스템과 상호작용하는 실질적 주체는 **두 명**이다:

1. **Operator (Mhkim)** — 도구를 조작해 아이디어를 발행하고 데이터를 확인하는 사람
2. **Visitor (잠재 고객)** — 광고/링크를 통해 발행된 랜딩페이지에 들어와 반응하는 사람

아래 6개 여정은 두 주체의 Happy Path, Edge Case, 그리고 "데이터 공백기"와 "아이디어 정리" 같은 취약 순간을 모두 다룬다.

### Journey 1: Operator — Happy Path "일요일 저녁 의사결정"

**Persona:** Mhkim. 주중 본업이 바쁜 1인 메이커. 노션에 12개 아이디어가 몇 달째 잠자고 있다. "다 만들어보고 싶지만 뭐부터 해야 할지 모르겠다"는 답답함. 주말 시간은 한정적이고 시행착오로 반나절을 날리고 싶지 않다.

**목표:** 다음 주에 실제로 시간을 투자해 만들 아이디어 1개를 데이터 기반으로 결정.

**Opening Scene (금요일 밤, 침대):** 불 끄기 직전, 문득 "퇴근 후 15분 코딩 챌린지 서비스"라는 아이디어가 떠오른다. 예전 같으면 노션 메모장에 한 줄 적고 끝. 오늘은 blog-practice를 열고 이 한 줄을 붙여넣는다.

**Rising Action (토요일 오전):** 지난 3주간 쌓아둔 5개의 아이디어 페이지를 확인한다. 각 페이지마다 Meta 광고 캠페인이 $10씩 돌아가고 있다. 대시보드를 연다. 5개 아이디어가 표로 떠 있고, PV·클릭·이메일 수가 나란히 표시된다.

**Climax (일요일 저녁 8시):** "퇴근 후 15분 코딩 챌린지"의 이메일 수집이 **나머지 4개의 총합보다 많다.** CTA 클릭률도 3배. Mhkim이 대시보드를 보며 혼잣말을 한다: *"어, 이거 진짜 될 것 같은데?"*

**Resolution (일요일 저녁 9시):** 노션에 "다음 주 목표: 퇴근 후 15분 코딩 챌린지 MVP 빌드 시작"을 적는다. 12개 아이디어 중 어떤 걸 만들지 고민하느라 소모했던 정신적 에너지가 사라진다. **데이터가 결정했다.**

**Emotional Arc:** 답답함 → 호기심 → 확신 → 해방감

**Revealed Capabilities:**
- 프롬프트 입력 UI (매우 가벼움 — 단일 textarea + 생성 버튼)
- AI 생성 미리보기 (재생성 / 인라인 편집 / 프롬프트 수정)
- 발행 플로우 (원클릭 URL 획득)
- 비교 대시보드 (아이디어별 지표 표, 정렬 가능)
- 히스토리 없는 상태 표시 (최신 버전만)

### Journey 1.5: Operator — 기대 관리 "데이터 공백기"

**Persona:** 같은 Mhkim

**Opening Scene (월요일 저녁):** 토요일에 새 아이디어 "1인 프리랜서 세무 챗봇"을 발행했고, Meta 광고도 설정했다. 이틀 뒤 월요일 퇴근길에 기대에 차서 대시보드를 연다.

**Rising Action:** 대시보드에 PV 3, CTA 0, 이메일 0. *"뭐야, 이거 망했나?"* 세 가지 의심이 동시에 든다: (1) 내 광고가 잘못 돌고 있나? (2) 랜딩 카피가 별로인가? (3) 정말 이 아이디어가 안 먹히는 건가?

**Climax:** 대시보드가 **조용히, 하지만 명확하게** 안내한다:

> 📊 **이 아이디어는 발행된 지 58시간 경과했어요.**
> - 광고가 본격 도달하기까지는 보통 48~72시간이 걸려요.
> - PV가 100 미만일 때는 전환율 판단이 무의미합니다.
> - 72시간 후에도 신호가 없으면 광고 카피 vs 랜딩 카피 중 어느 쪽을 의심할지 알려드릴게요.

Mhkim의 심박수가 가라앉는다. *"아, 조급해할 필요 없구나."* 대시보드를 닫는다.

**Resolution (수요일 저녁):** 72시간이 지났고 데이터가 쌓이기 시작했다. PV 47, CTA 4, 이메일 1. "아직은 판단하기 이르지만 최소한 광고는 제대로 도달했다." 다음 주말을 기다리기로 한다.

**Emotional Arc:** 기대 → 조급함 → 의심 → 안도 → 인내

**Revealed Capabilities:**
- 대시보드의 **시간 기반 상태 메시지** (발행 후 경과 시간에 따른 기대치 안내)
- "데이터가 부족할 때 해석을 강요하지 않는 UX" — 지표 숫자만 노출하지 않음
- 최소 샘플 사이즈 임계값 (PV 100 미만에서는 전환율 표시 억제)

### Journey 2: Operator — Edge Case "점심시간 15분 (AI 실패 복구)"

**Persona:** 같은 Mhkim

**Opening Scene (화요일 점심시간):** 점심 먹다가 "1인 변호사가 계약서 리뷰를 AI에게 맡기는 SaaS" 아이디어가 떠오른다. 15분 남은 점심시간에 이걸 발행하고 싶다.

**Rising Action:** 프롬프트를 입력하고 생성을 누른다. 30초 후 결과가 나왔다. 그런데 AI가 "AI 법률 어시스턴트"라는 일반적인 문구를 뽑았고, **"1인 변호사" 타겟의 날카로움이 전혀 안 살아났다.** 카피는 문법적으로 맞지만 일반 대중용이다.

**Decision Point:** 3가지 선택지가 앞에 있다:
1. **재생성** (같은 프롬프트로 다시) — 한 번 더 복권 뽑기
2. **프롬프트 수정** ("반드시 '1인 변호사'를 언급할 것" 같은 지시 추가)
3. **인라인 수정** (생성된 텍스트에서 '법률 어시스턴트' → '1인 변호사를 위한 계약서 리뷰')

Mhkim은 2번을 선택한다. 지시문에 "주 대상: 1인 변호사. 일반 대중에게 말하지 말 것"을 추가. 재생성.

**Climax:** 이번엔 훨씬 날카롭다. 히어로 카피가 "밤 10시에 계약서 4건이 쌓여 있는 당신에게"로 바뀌었다. 인라인 편집으로 "10시" → "11시" 하나만 수정한다. 발행.

**Resolution:** 점심 끝나기 전에 URL 획득, Meta 광고 캠페인에 복붙. 점심시간 남은 3분에 트위터에도 공유. *"이게 편집 3경로가 있어서 다행이다. 없었으면 포기하고 노션 메모로 돌아갔을 것."*

**Emotional Arc:** 설렘 → 실망 → 의구심 → 해결 → 만족

**Revealed Capabilities:**
- LLM 생성 실패/저품질 시 **빠른 재시도 경로** (UI에서 찾기 쉬운 위치)
- **프롬프트 지시문 필드**를 기본 프롬프트와 별도로 제공
- 인라인 텍스트 편집 (단순 contentEditable 수준이면 충분)
- 실패했을 때도 **15분 점심 시간 안에 복구 가능한 속도**

### Journey 3: Visitor — Happy Path "광고 클릭한 사람"

**Persona:** 익명의 광고 타겟. 퇴근길 지하철, 인스타그램 피드 스크롤 중. 3초 남짓의 주의력. 관심 있는 것을 찾으면 "나중에 확인"할 방법을 남기고 싶다. 앱 다운이나 회원가입까지 갈 의향은 없다.

**Opening Scene:** 인스타그램에서 "퇴근 후 15분 코딩 챌린지" 광고 카드를 본다. 카피 한 줄이 마음에 꽂힌다. 탭.

**Rising Action:** 3초 후 랜딩페이지가 뜬다. **로딩이 느렸으면 이미 뒤로가기 눌렀을 거다.** 페이지는 간결하다. 히어로 문구, 세 개의 가치제안, "사전 신청하기" 버튼, 이메일 입력. 이미지는 없지만 오히려 깔끔해서 좋다. 모바일에서 읽기 편하다.

**Climax:** "사전 신청하기" 버튼을 탭한다. 예상: 결제 페이지 or 회원가입. 실제: **"아직 출시 전이에요. 출시되면 가장 먼저 알려드릴게요"** 라는 안내 + 이메일 입력 한 칸. 이 안내가 오히려 신뢰감을 준다. 사기 같지 않다. 이메일을 입력한다. "소식을 기다리겠습니다"라는 확인 메시지.

**Resolution:** 뒤로가기를 누르고 피드로 돌아간다. 이 전체 과정에 **총 40초**가 걸렸다. 일주일 뒤 이 아이디어를 다시 볼지는 모르지만, **이메일 주소는 Mhkim의 대시보드에 정확히 기록되었다.**

**Emotional Arc:** 궁금함 → 신중함 → 신뢰 → 동의 → 무감각한 이탈 (핵심 지표는 전환만)

**Revealed Capabilities:**
- 페이지 **초고속 로딩** (LCP < 2.5s) — adblocker 고려
- OG 메타 완벽 세팅 (미리보기에서 탭 결정이 남)
- 모바일 우선 레이아웃
- "사전 신청" 버튼 뒤 **필수 디스클레이머** (soft recommendation, but always present)
- 이메일 수집 UX: 성공 시 확인 메시지, 실패 시 에러 알림
- 이벤트 트래킹: 페이지 진입 / CTA 클릭 / 이메일 제출 3개가 독립 이벤트로 기록
- 서버 사이드 백업 카운트 (adblocker 우회 — 누락률 < 5% 목표)

### Journey 4: Visitor — Edge Case "이탈자"

**Persona:** 같은 익명 방문자, 하지만 이번엔 관심이 약함.

**Opening Scene:** 광고 섬네일에 끌려 탭했지만, 히어로 카피를 보자마자 "아, 생각했던 거랑 다르네"라고 느낀다.

**Rising Action:** 스크롤을 2초 정도 내려본다. 가치제안을 대충 훑는다. 흥미가 올라오지 않는다.

**Decision Point:** 뒤로가기.

**Resolution (Mhkim 관점에서 가장 중요한 순간):** 방문자는 CTA도 안 눌렀고 이메일도 안 남겼다. 하지만 **"이 아이디어를 봤다"는 기록은 남아야 한다.** 그래야 CTR (방문 → CTA 클릭 전환율)을 계산할 수 있고, "이 아이디어는 클릭은 많은데 전환이 없다 = 카피가 약하다"라는 판단이 가능하다.

**Emotional Arc:** 관심 → 실망 → 무관심한 이탈 (핵심: 이탈도 데이터다)

**Revealed Capabilities:**
- **PV 이벤트가 이탈한 사용자에게도 반드시 기록** (페이지 로드 즉시 기록, 서버 사이드 보강)
- 스크롤 깊이 추적은 MVP에서 제외 (Growth 후보)
- 이탈률이 곧 "이 아이디어가 나쁘다"로 해석되지 않도록, 대시보드는 CTA 클릭률과 이메일 전환율을 독립 지표로 보여줌
- 이벤트 기록 실패가 "성공한 것처럼 보이는" 상황 방지 — 서버 로그로 이중 확인

### Journey 5: Operator — "아이디어를 놓아주기 (Archive)"

**Persona:** 같은 Mhkim

**Opening Scene (3주 후, 어느 일요일):** 대시보드를 연다. "1인 변호사 계약서 리뷰 SaaS" 아이디어의 지표가 3주째 얼어붙어 있다. PV 142, CTA 클릭 6, 이메일 0. 광고에 $30을 썼는데 이메일 한 건이 안 나왔다.

**Rising Action:** Mhkim은 이미 마음속으로는 알고 있다. "이건 안 되는 거구나." 하지만 노션 메모장에는 여전히 이 아이디어가 적혀 있고, 자꾸 "그래도 혹시…"라는 생각이 든다. 이 생각이 다른 아이디어에 집중하는 걸 방해한다.

**Climax (결정의 순간):** 대시보드의 아이디어 카드에서 **"Archive"** 버튼을 누른다. Confirm dialog가 뜬다:

> 💤 **이 아이디어를 정리할까요?**
> - 페이지는 유지되지만 대시보드 상단에서 사라집니다.
> - 지금까지 수집한 데이터는 그대로 보존됩니다.
> - 언제든 Archive 섹션에서 다시 꺼낼 수 있어요.
>
> [정리하기] [취소]

"정리하기"를 누른다.

**Resolution:** 대시보드 상단에서 이 아이디어가 사라지고, 하단 **"Archived"** 섹션으로 이동한다. 섹션 제목 옆에는 작은 메모: *"1개의 아이디어가 잘 쉬고 있어요."*

노션 메모장을 연다. "1인 변호사 계약서 리뷰 SaaS" 옆에 "✅ 검증 완료 — 접음"이라고 적는다. 이 아이디어는 이제 Mhkim의 머릿속 공간을 차지하지 않는다.

**Emotional Arc:** 망설임 → 인정 → 결단 → 해방감 (가장 깊은 해방)

**Revealed Capabilities:**
- `ideas.status` 필드 — `active` / `archived` 두 가지 상태
- 대시보드에 **Active / Archived 섹션 분리**
- Archive 시 confirm dialog (단순, 작별 이메일 없음)
- **데이터 보존**: archive해도 이벤트 데이터는 삭제되지 않음 (나중에 재평가 가능)
- Archive 섹션의 따뜻한 문구 — "정리된 아이디어들이 잘 쉬고 있다"는 시각적 완결감
- 수집된 이메일에 대한 작별 발송 기능 **없음** (Growth 후보로 이동)

### Journey Requirements Summary

**Operator(Mhkim)가 필요로 하는 것:**

- 단순한 프롬프트 입력 UI (textarea + 생성 버튼)
- LLM 생성 결과 미리보기 화면
- 편집 3경로 진입: 재생성 / 프롬프트 수정 / 인라인 편집
- 원클릭 발행 → URL 클립보드 복사
- 아이디어별 지표를 나란히 비교하는 대시보드
- **Active / Archived 섹션 분리**
- **시간 기반 상태 메시지** — 발행 후 경과 시간과 데이터량에 따른 해석 가이드
- **Archive 기능** — `active` ↔ `archived` 상태 전환, confirm dialog
- 실패 복구 속도 — 점심시간 15분 안에 다시 뽑고 발행까지 완료 가능

**Visitor(잠재 고객)가 필요로 하는 것:**

- 페이지 초고속 로딩 (LCP < 2.5s, 모바일 4G)
- OG 메타 완벽 세팅
- 모바일 우선 레이아웃
- "사전 신청" 버튼 뒤 디스클레이머
- 이메일 수집 성공/실패 피드백

**시스템(데이터 파이프라인)이 필요로 하는 것:**

- PV / CTA 클릭 / 이메일 제출 3개 독립 이벤트 기록
- 서버 사이드 백업 카운트 (adblocker 우회)
- 이벤트 누락률 < 5% 보장
- URL 불변성 (archive해도 URL은 유지되어 페이지는 계속 접근 가능)
- **Invalid email 카운터** — 잘못된 형식 제출 시도를 별도 집계
- **데이터 보존 정책**: archive 상태여도 이벤트 데이터는 삭제하지 않음

**스키마 변경 (Step 3에서 정의한 것 업데이트):**

`ideas` 테이블에 다음 컬럼 추가:

- `status` — `active` (기본값) / `archived`
- `archived_at` — archive된 시점 (null 가능)

**명시적으로 여정에서 제외된 것:**

- Admin 패널 (본인이 곧 Admin)
- 고객 지원 플로우
- 결제 플로우
- API 소비자 플로우
- Archive 시 작별 이메일 발송 (Growth 후보로 이동)
- 스크롤 깊이 추적 (Growth 후보)

## Domain-Specific Requirements

blog-practice는 규제 산업(healthcare, fintech 등) 제품이 아니다. 따라서 HIPAA, PCI-DSS, SOC2 같은 정식 규제 프레임워크는 적용되지 않는다. 그러나 이 제품은 **"실제 제품이 없는 상태에서 잠재 고객의 관심과 이메일을 수집"**하는 행위를 수행하므로, 한국의 **개인정보보호법**, **정보통신망법**, **전자상거래법**, 그리고 유럽·미국 트래픽 유입 가능성을 고려한 **GDPR / FTC deceptive advertising** 규정의 회색지대에 위치한다. 이 도메인 요구사항은 이 회색지대를 **soft recommendation** 수준에서 관리한다.

### Compliance & Regulatory (Soft Recommendations)

- **허위표시 회피 원칙 (전자상거래법·FTC)**
  모든 "사전 신청", "구매", "결제" 류 버튼 뒤에는 **"아직 출시 전" 안내 문구**를 반드시 표시한다. 실존하지 않는 제품의 구매를 유도하는 것처럼 오해될 소지를 사전 차단한다. 이 문구는 랜딩페이지 템플릿의 시스템 영역에 렌더링되며, LLM 생성 카피가 이 문구를 덮거나 제거하지 않는다.

- **개인정보 수집 고지 (개인정보보호법·GDPR)**
  이메일 수집 폼 아래에는 간결한 고지 문구를 표시한다:
  > "입력한 이메일은 이 아이디어의 출시 소식 공지 목적으로만 사용됩니다. 원치 않을 경우 언제든 삭제를 요청할 수 있습니다."
  MVP 단계에서는 명시적 체크박스 동의는 요구하지 않는다 (사용성 저해). 문구 노출 자체를 최소 기준으로 한다.

- **수집 목적 외 사용 금지 원칙**
  수집된 이메일은 해당 아이디어의 출시 소식 공지 외 어떤 목적으로도 사용하지 않는다. 다른 아이디어 홍보, 뉴스레터, 외부 공유, 마케팅 리스트 판매 등 일체 금지. 이 원칙은 시스템이 강제하지는 않지만, Operator(Mhkim 본인)의 운영 원칙으로 PRD에 명시한다.

- **데이터 파기 원칙 (GDPR "right to erasure" 호환)**
  방문자로부터 이메일 삭제 요청이 들어올 경우 수동으로 즉시 삭제한다. MVP에서는 자동화된 삭제 요청 처리 플로우는 구현하지 않으며, Archive된 아이디어에 대해서는 이메일 데이터가 그대로 보존된다. 이 결정은 "법적 완전성"보다 "실용적 단순성"을 우선한 trade-off임을 명시한다.

### Technical Constraints

- **이메일 저장**: 평문 저장. MVP에서는 해싱·암호화를 적용하지 않는다. 본인용 도구이며 민감도가 낮음 (비밀번호가 아닌 이메일 주소). 저장소 자체의 기본 보안(Neon at-rest encryption 또는 동급)은 활용한다.
- **로그 보관**: 이벤트 로그는 운영/디버깅 목적으로 보관되며, 명시적 삭제 정책은 두지 않는다. MVP 단계에서 "모든 데이터를 보존"이 기본값이다.
- **지역 차단 없음**: MVP는 지역 제한 없이 전 세계 트래픽을 수용한다. GDPR 완전 준수 대신 "유럽 트래픽이 들어와도 최소한의 고지를 했다"는 수준으로 관리한다.
- **HTTPS 필수**: 모든 발행 페이지는 HTTPS로 제공한다 (Vercel/Cloudflare Pages 기본 제공).

### Integration Requirements

없음. MVP는 외부 시스템과의 통합을 요구하지 않는다.

- LLM API (OpenAI/Anthropic 등)는 "외부 시스템 통합"이 아니라 "서비스 의존성"으로 분류한다.
- 광고 플랫폼 API 연동(Meta/Google Ads)은 MVP에서 제외 (Growth 단계).
- 이메일 발송 서비스(SendGrid 등) 연동 없음 (작별 이메일 기능 제외됨).

### Risk Mitigations

| 리스크 | 발생 시나리오 | 완화 방법 |
|---|---|---|
| **허위표시 신고** | 방문자가 "사전 신청" 버튼을 진짜 결제로 오해하고 공정위에 신고 | "아직 출시 전" 안내 문구를 시스템 레벨에서 강제, LLM 생성 카피가 덮어쓸 수 없도록 템플릿 분리 |
| **개인정보 유출** | 저장소 침해로 이메일 리스트 유출 | 저장소의 기본 보안 기능 활용, 이메일 외 민감정보(이름·전화번호 등) 절대 수집하지 않음 |
| **이메일 삭제 요청 무대응** | 방문자의 삭제 요청을 놓치거나 지연 | Operator 운영 원칙으로 "삭제 요청은 24시간 내 수동 처리"를 PRD에 명시 |
| **LLM 환각 (hallucination)** | AI가 실재하지 않는 주장이나 허위 통계를 카피에 포함 | 생성 직후 Operator가 반드시 내용을 읽고 발행하는 워크플로우 (자동 발행 금지) |
| **타인의 상표·이름 오용** | AI가 실존 브랜드명을 카피에 포함 (예: "애플보다 나은…") | Operator 운영 원칙 — 발행 전 육안 검토 필수, 시스템 강제 검증은 MVP 제외 |
| **스팸·봇 제출** | 이메일 수집 폼에 봇이 대량 가짜 이메일 제출 | Invalid email 카운터로 이상 징후 감지, MVP에서는 captcha 없이 시작 |

### 이 섹션의 한계

이 도메인 요구사항들은 전부 **soft recommendation**이다. 시스템이 강제하는 것은 오직 **"아직 출시 전" 안내 문구의 노출** 하나뿐이다. 나머지는 Operator의 운영 원칙으로 관리된다. MVP가 검증 완료되고 실제 사용자 데이터가 의미 있는 규모로 쌓이는 시점이 오면, 이 원칙들을 hard functional requirement로 승격할지 재검토해야 한다.

## Web App Specific Requirements

### Project-Type Overview

blog-practice는 두 가지 성격이 결합된 web app이다:

1. **Operator Console (SPA)** — Mhkim이 로그인 없이 접속해 아이디어를 입력·편집·발행하고 대시보드에서 지표를 확인하는 단일 페이지 애플리케이션. 로컬 호스팅 또는 private URL로 접근.
2. **Published Landing Pages (SSG/SSR)** — 발행된 각 아이디어가 정적 또는 서버 렌더링된 독립 페이지로 존재. 광고 트래픽의 목적지이며, 성능이 핵심.

이 이원 구조가 이 제품의 가장 중요한 기술 결정이다. Operator Console은 기능성·편의성에 최적화되고, Published Pages는 로딩 속도·이벤트 수집 신뢰성에 최적화된다.

### Rendering Strategy (SPA or MPA?)

- **Operator Console**: SPA (Single Page Application). 로그인 없는 단일 사용자 환경이며 즉각적인 상호작용(프롬프트 입력, 재생성, 인라인 편집)이 잦아 SPA가 적합.
- **Published Landing Pages**: **정적 생성(SSG) 또는 요청 시 서버 렌더링(SSR).** 각 페이지는 발행 시점에 HTML로 전환되어 CDN 엣지에서 제공. 클라이언트 JS 의존도를 최소화 — 이것이 LCP < 2.5s 목표의 전제.
- **원칙**: 발행된 페이지의 HTML 초기 응답에 **모든 카피가 이미 포함**되어야 한다. JS가 로드되지 않아도 텍스트는 읽을 수 있어야 한다. 이벤트 트래킹만 JS로 보강.

### Browser Support

- **Published Pages**: 광고 타겟은 모바일 위주이므로 **모바일 Safari, Chrome (iOS/Android)** 이 최우선. 데스크톱 Chrome, Safari, Edge, Firefox 최신 2개 버전까지 지원. Internet Explorer 지원 없음.
- **Operator Console**: Mhkim 본인 환경만 고려. 최신 Chrome 또는 Safari로 충분.

### Responsive Design

- **Mobile-first 필수 (Published Pages)**: 광고 트래픽의 80% 이상이 모바일일 것으로 예상. 디자인·레이아웃은 모바일 기준으로 먼저 설계하고 데스크톱은 파생.
- **Operator Console**: 데스크톱 전용으로 설계. 모바일에서의 조작은 지원하지 않음 (본인용 도구, 주말 작업 환경은 노트북).
- **브레이크포인트**: 모바일 (~640px), 태블릿 (640-1024px), 데스크톱 (1024px+) 3단계로 최소 대응.

### Performance Targets

정식 성능 목표와 측정 환경(Chrome DevTools 4G Slow + Moto G4 기준)은 **[NFR-P1, NFR-P2, NFR-P5](#performance)** 에 정의되어 있다.

요약:
- Published Page: LCP/FCP/CLS/TTI 목표 + JS 번들 < 50KB (NFR-P1/P2)
- Operator Console: 성능 엄격 측정에서 제외, "견딜 만한" 수준 (NFR-P5)

### SEO Strategy

**MVP에서 SEO는 명시적으로 제외된다.**

- 트래픽은 100% **유료 광고와 링크 공유**로 확보한다. 구글 검색 유입은 전제가 아니다.
- 개별 발행 페이지에는 **`robots meta noindex`**를 기본 설정하는 것도 고려할 것 — 이유: 발행된 페이지들은 검증 중인 아이디어이며, 미래의 Google 스팸·AI 콘텐츠 정책 강화 시 오히려 도메인 전체의 신뢰도를 해칠 수 있음.
- **OG 메타는 SEO가 아닌 공유용**으로 접근한다. `og:title`, `og:description`, `og:image`(텍스트 기반 자동 생성 또는 단색 배경 + 제목)는 필수.
- `sitemap.xml`, `robots.txt`의 정교한 설정은 MVP 제외.

**주의:** MVP 이후 SEO를 되살리고 싶어질 수 있다. 그때를 위해, **noindex 설정은 아이디어별로 토글 가능한 필드**로 스키마에 포함해둔다 (`ideas.noindex` boolean). 기본값 `true`.

### Real-time Requirements

**없음.** 이 제품은 실시간 업데이트가 필요하지 않다.

- 대시보드의 지표는 페이지 새로고침 또는 주기적 자동 갱신(예: 60초)으로 충분.
- WebSocket, Server-Sent Events, polling 최소화.
- 이벤트 수집은 클라이언트에서 서버로 단방향 전송 (실시간 반영 필요 없음).

### Accessibility Level

**실용적 최소 준수.** 정식 WCAG AA 인증은 목표가 아니지만, 기본 항목(텍스트 대비 4.5:1, 시맨틱 HTML, label 연결, 터치 타겟 44x44px, 키보드 탐색)은 지켜진다. 정식 정의는 **[NFR-A1~A4](#accessibility-summary)** 참조.

**제외:** 스크린리더 완전 호환 테스트, 다크모드, i18n.

### Technical Architecture Considerations

**제안 스택 (확정 아님, Architect 단계에서 재검토):**

- **프레임워크**: Next.js 14+ (App Router) — SPA + SSG/SSR 두 성격을 한 프로젝트에서 처리 가능
- **호스팅**: Vercel 또는 Cloudflare Pages — 엣지 배포, HTTPS 자동
- **DB**: **Neon Postgres** (Architecture에서 확정) — 주말 사용 패턴에 관대한 사용량 기반 컴퓨트, 표준 Postgres로 Vendor lock-in 낮음. (Supabase는 "1주 비활성 일시정지" 제약으로 탈락)
- **LLM**: OpenAI API 또는 Anthropic Claude API — 구조화 JSON 응답 지원 필수
- **Analytics**: 자체 구현 (외부 도구 없음, 데이터 주권 유지)
- **State Management**: React Query 또는 SWR (서버 상태), Zustand 등 (로컬 상태)

**대안:**

- 더 공격적 단순성: SvelteKit + SQLite + Fly.io
- 더 공격적 컨트롤: 자체 Fastify + React SPA + Postgres

### Implementation Considerations

- **단일 리포지토리, 단일 배포**: Operator Console과 Published Pages를 같은 코드베이스에서 처리. 분리된 마이크로서비스 안 됨 (복잡도 폭발 방지).
- **Feature flag 불필요**: 본인용 도구, A/B 테스트 없음, 롤백이 필요한 운영 이슈 없음.
- **Error tracking**: Sentry 또는 대체재로 LLM 호출 실패, 이벤트 수집 실패만 집중 추적. Operator Console의 일반 UI 에러는 console.log로 충분.
- **Deploy strategy**: `main` 브랜치 push → Vercel/CF Pages 자동 배포. 별도 스테이징 환경 없음.
- **Domain**: 초기에는 호스팅 서비스 기본 도메인 사용 (예: `blog-practice.vercel.app`). 커스텀 도메인은 선택.

### Explicitly Skipped

**native_features, cli_commands**: 이 제품은 웹 브라우저 전용. 네이티브 앱, CLI 도구, 데스크톱 통합 없음. Push notification, 파일 시스템 접근, 카메라 등 디바이스 기능도 사용하지 않음.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach: "Painkiller for the Operator" (문제 해결형 MVP)**

이 제품은 Experience MVP도, Platform MVP도, Revenue MVP도 아니다. Operator(Mhkim 본인)의 구체적인 고통 — "아이디어가 텍스트로만 죽는 것" — 을 해결하는 **Problem-Solving MVP**다. 투자자 설득도, 멀티 유저 확장도, 수익화도 전부 고려하지 않는다.

**MVP가 성공했다고 말할 수 있는 유일한 기준:** *"Mhkim이 3개월 동안 이 도구를 실제로 사용해, 데이터를 보고 빌드 결정을 내린 아이디어가 최소 1개 이상 나왔다."*

다른 모든 지표(속도, 성능, 디자인)는 이 기준의 **필요조건**일 뿐 목적이 아니다.

**Resource Requirements:**

- **팀 구성:** 1인 (Mhkim 본인, 기획 + 개발 + 디자인 + 운영)
- **시간 예산:** 주말 작업 기반 (주당 8~12시간 가정)
- **금전 예산:**
  - 호스팅: 월 $0~10 (Vercel/CF Free tier)
  - DB: 월 $0~25 (Neon Free → Launch)
  - LLM API: 월 $20~50 (생성량에 비례)
  - 광고: 월 $50~200 (검증 실험용, 도구 운영 비용이 아닌 콘텐츠 운영 비용)
- **기술 스킬:** Next.js/React 익숙도, Postgres/SQL 기본, LLM API 경험 — Mhkim이 이미 갖추고 있다고 가정. 부족한 부분은 학습 곡선으로 처리.

### MVP Feature Set (Phase 1)

**지원되는 핵심 여정:**

- Journey 1: 일요일 저녁 의사결정 (Operator Happy Path)
- Journey 1.5: 데이터 공백기 기대 관리
- Journey 2: 점심시간 15분 복구 (Operator Edge Case)
- Journey 3: Visitor Happy Path (이메일 수집)
- Journey 4: Visitor Edge Case (이탈도 데이터)
- Journey 5: 아이디어 Archive

**Must-Have Capabilities (이거 없으면 MVP 아님):**

1. **프롬프트 → AI 생성**: 한 줄 입력 → 구조화된 JSON → 텍스트 기반 랜딩페이지
2. **편집 3경로**: 재생성 / 프롬프트 수정 / 인라인 텍스트 편집
3. **발행 & URL 할당**: 고유 slug → 배포 → 클립보드 복사 가능한 URL
4. **데이터 수집 파이프라인**: PV / CTA 클릭 / 이메일 제출 → 서버 저장
5. **비교 대시보드**: 아이디어별 지표 표, Active/Archived 섹션 분리
6. **Archive 플로우**: `active ↔ archived` 전환, confirm dialog
7. **상태 메시지 시스템**: 발행 후 경과 시간·샘플 사이즈 기반 해석 가이드
8. **법적 가드레일 (단일 시스템 강제)**: "아직 출시 전" 안내 문구의 템플릿 레벨 포함
9. **Published Page 성능**: LCP < 2.5s 목표 달성
10. **URL 불변성**: 편집/재생성/Archive 후에도 slug 변경 없음

**MVP에서 수용하는 타협 (의도적 "덜 만들기"):**

- 스타일링: 최소한의 typography + 여백. 테마 없음. "디자인"이라 부르기 어려운 수준.
- Error handling: 심각한 실패만 처리. 엣지 케이스의 우아한 복구는 포기.
- 테스트: E2E 1개 (핵심 플로우 smoke test) + 크리티컬 유닛 테스트 5개 미만.
- 문서: 본인용이므로 README 한 페이지면 충분.
- 모니터링: Sentry 또는 Vercel Analytics 기본 수준.

### Post-MVP Features

**Phase 2 (Growth) — MVP 북극성 지표(분기당 빌드 결정 1개)가 달성된 후에만 검토**

- 광고 플랫폼 API 연동 (Meta/Google Ads): 캠페인 성과와 랜딩 데이터 통합
- UTM 기반 소스별 분석
- 프롬프트 템플릿 라이브러리 (잘 작동한 프롬프트 재사용)
- 간단한 A/B 테스트 (같은 아이디어 2개 페이지)
- 이메일 데이터 CSV 내보내기
- 커스텀 도메인 연결
- Archive 시 작별 이메일 발송 옵션 (Party Mode에서 Growth로 이동됨)
- Invalid email 카운터 기반 봇 대응 (captcha 등)

**Phase 3 (Vision) — 의도적으로 비워둠**

Phase 2까지 실제로 사용한 뒤에만 구체화. 지금 청사진 그리기를 거부한다. **단 하나의 원칙만 고정:** 어떤 진화도 "한 줄 → 30초 → 데이터 수집" 핵심 루프의 속도를 떨어뜨리는 변경은 거부한다.

### Risk Mitigation Strategy

**Technical Risks**

| 리스크 | 심각도 | 완화 방법 |
|---|---|---|
| LLM 생성 품질이 기대에 못 미쳐 편집 비용이 급증 | 🔴 High | Journey 2 전체가 이 리스크 대응. 편집 3경로(재생성/프롬프트 수정/인라인)로 항상 빠져나갈 출구 제공. LLM은 교체 가능하도록 추상화 레이어. |
| LLM API 비용 폭증 | 🟡 Medium | 생성당 비용 상한 모니터링. 월 예산 초과 시 알림. 재생성 횟수 실시간 표시. |
| 데이터 수집 누락률 > 5% | 🟡 Medium | 서버사이드 백업 카운트 + 주기적 이벤트 감사 로그 확인. |
| Published Page LCP > 2.5s | 🟡 Medium | SSG + CDN 엣지 + 이미지 없음 전략으로 애초에 느려질 이유 제거. 번들 크기 CI 체크. |
| URL 불변성 버그로 광고 링크 무효화 | 🔴 High | slug 변경은 DB 수준에서 불가능하도록 스키마 제약. 수동 migration만 허용. |

**Market Risks**

| 리스크 | 심각도 | 완화 방법 |
|---|---|---|
| Mhkim이 이 도구를 실제로 안 쓴다 (만들고 방치) | 🔴 High | MVP 완료 후 첫 3개의 실제 아이디어를 **반드시 이 도구로 발행**하는 것을 MVP 완료의 정의에 포함. "만드는 것"과 "쓰는 것"이 분리되지 않도록. |
| 광고 트래픽이 안 모여 데이터 자체가 안 쌓임 | 🟡 Medium | 광고 운영은 제품 범위 밖이지만, Journey 1.5(데이터 공백기)가 이 경우에도 해석을 제공. 데이터 없음 자체도 신호. |
| Framer·Durable이 "검증 모드" 기능 추가 | 🟢 Low | Market research에서 지적됨. 하지만 그들은 본인용 도구를 만들 동기가 없음. 이 제품의 차별점은 포지셔닝이라 빠르게 복제되지 않음. |
| 한국 전자상거래법 관련 이슈 (허위표시) | 🟢 Low | Domain Requirements에 가드레일 문서화. 시스템 강제 1개. MVP 단계에서 리스크 현실화 가능성 낮음. |

**Resource Risks**

| 리스크 | 심각도 | 완화 방법 |
|---|---|---|
| Mhkim의 주말 시간 부족으로 MVP 미완성 | 🔴 High | MVP를 더 작게 쪼갤 것. 필요시 "편집 3경로 중 인라인만" 같은 축소도 허용. 북극성 지표가 달성되면 타협 가능. |
| 본업이 바빠져 3개월 이상 중단 | 🟡 Medium | 배포된 페이지는 정적이므로 방치해도 돌아감. 코드는 쉽게 재개 가능한 구조로 단순하게. |
| 특정 스택(Next.js/Neon)에 발목 잡힘 | 🟢 Low | Next.js는 AI 어시스턴트 지원이 압도적이고 Neon은 표준 Postgres라 이전 용이. 스택 전환 리스크 낮음. |

### MVP 완료의 공식 정의

**"MVP가 완료되었다"**라고 말할 수 있는 조건은 다음 세 가지가 모두 충족된 시점이다:

1. **기능적 완료**: Must-Have Capabilities 10개가 모두 동작.
2. **실사용 검증**: Mhkim 본인이 이 도구를 사용해 **최소 3개의 실제 아이디어**를 발행하고, 각각에 최소 $10 이상의 광고를 집행했다.
3. **심리적 완료**: 이 도구를 사용하는 과정에서 **"노트북에 다시 Framer를 열고 싶다"는 충동이 일어나지 않았다.**

세 번째가 가장 중요하다. 기능은 있는데 심리적으로 "차라리 Framer가 낫다"는 생각이 들면, MVP는 완료가 아니라 **실패**다.

## Functional Requirements

이 섹션은 blog-practice의 **Capability Contract**다. 이 리스트에 없는 기능은 MVP에 존재하지 않는다. UX, Architecture, Epic 분해 등 이후 모든 설계 활동은 이 리스트를 기반으로 수행된다.

모든 FR은 다음 원칙을 따른다:

- **Actor + Capability 형식**: "[누가] [무엇을] 할 수 있다"
- **Implementation-agnostic**: 어떻게 구현할지는 명시하지 않는다
- **Testable**: 각 항목은 "있다/없다"를 검증 가능하다
- **Independent**: 다른 FR을 읽지 않고도 이해된다

### Idea Creation (아이디어 생성)

- **FR1**: Operator는 한 줄 프롬프트를 입력해 새 아이디어 생성을 시작할 수 있다.
- **FR2**: Operator는 프롬프트 외에 선택적 "지시문(instructions)"을 별도 필드로 제공할 수 있다.
- **FR3**: 시스템은 프롬프트(+ 지시문)를 LLM에 전달해 구조화된 랜딩페이지 데이터(히어로 카피, 서브 카피, 3개 가치제안, CTA 문구, 이메일 폼 라벨)를 생성한다.
- **FR4**: 시스템은 LLM 생성 결과가 정의된 스키마와 일치하는지 검증한다.
- **FR5**: 시스템은 LLM 생성 진행 중에 Operator에게 현재 상태와 대기 안내를 표시한다.
- **FR6**: Operator는 진행 중인 LLM 생성 요청을 취소할 수 있다.
- **FR7**: 시스템은 LLM 생성 실패 또는 스키마 불일치 시 명확한 오류 메시지와 함께 재시도 옵션을 제공한다.
- **FR55**: 시스템은 LLM 호출 전 월간 누적 비용을 확인하고, 설정된 월 예산 상한을 초과할 경우 LLM 호출을 차단한다 (Hard Kill Switch). Operator는 환경변수(`KILL_SWITCH_OVERRIDE`)를 통해 이 차단을 명시적으로 우회할 수 있다.

### Idea Editing (아이디어 편집)

- **FR8**: Operator는 생성된 결과를 보고 동일한 프롬프트로 재생성할 수 있다.
- **FR9**: Operator는 프롬프트 또는 지시문을 수정해 재생성할 수 있다.
- **FR10**: Operator는 생성된 텍스트 필드를 인라인으로 직접 수정할 수 있다.
- **FR11**: 시스템은 재생성 시 이전 버전을 보존하지 않고 최신 버전으로 덮어쓴다. (편집 히스토리 없음)
- **FR12**: 시스템은 각 아이디어에 대해 최종 프롬프트와 최종 페이지 데이터 1쌍만 영구 저장한다.

### Publishing (발행)

- **FR13**: Operator는 생성/편집된 아이디어를 공개 URL로 발행할 수 있다.
- **FR14**: 시스템은 발행 시 아이디어에 고유한 slug를 할당하고, 이 slug는 아이디어의 수명 동안 변경되지 않는다.
- **FR15**: 시스템은 발행된 페이지에 OG 메타데이터(title, description, image)를 자동으로 포함시킨다.
- **FR16**: 시스템은 발행된 페이지를 모바일 반응형으로 렌더링한다.
- **FR17**: Operator는 발행 직후 URL을 클립보드에 복사할 수 있다.
- **FR18**: Operator는 이미 발행된 아이디어를 재편집 후 재발행해도 URL이 유지되어야 한다.
- **FR19**: Operator는 발행 전 생성된 랜딩페이지를 방문자 시점 미리보기로 확인할 수 있다.

### Published Page Experience (방문자 경험)

- **FR20**: Visitor는 발행된 URL로 접속해 랜딩페이지 콘텐츠를 볼 수 있다.
- **FR21**: Visitor는 페이지에서 "사전 신청하기" 버튼을 탭/클릭할 수 있다.
- **FR22**: Visitor는 이메일 주소를 입력해 제출할 수 있다.
- **FR23**: 시스템은 이메일 제출 성공 시 확인 메시지를 표시한다.
- **FR24**: 시스템은 이메일 형식이 잘못된 경우 명확한 오류 안내를 표시한다.
- **FR25**: 시스템은 모든 "사전 신청"/CTA 버튼 후 **"아직 출시 전입니다"** 안내 문구를 표시한다. 이 문구는 Operator가 편집할 수 없다.
- **FR26**: 시스템은 이메일 수집 폼 아래에 개인정보 수집 고지 문구를 표시한다.

### Data Collection (데이터 수집)

- **FR27**: 시스템은 방문자가 발행된 페이지를 열 때 PV(PageView) 이벤트를 기록한다.
- **FR28**: 시스템은 방문자가 "사전 신청" 버튼을 탭/클릭할 때 CTA 클릭 이벤트를 기록한다.
- **FR29**: 시스템은 방문자가 이메일을 제출할 때 이메일 제출 이벤트를 기록한다.
- **FR30**: 각 이벤트는 아이디어 ID, 타임스탬프, 이벤트 타입, 선택적 메타데이터와 함께 저장된다.
- **FR31**: 시스템은 유효하지 않은 이메일 형식 제출 시도도 Invalid Email 이벤트로 별도 집계한다.
- **FR32**: 시스템은 클라이언트사이드 이벤트 수집 실패를 대비해 서버사이드 백업 카운트를 수행한다.

### Dashboard & Comparison (대시보드)

- **FR33**: Operator는 대시보드에서 모든 활성(Active) 아이디어를 표 형태로 볼 수 있다.
- **FR34**: 대시보드는 각 아이디어별로 PV, CTA 클릭 수, 이메일 수집 수를 나란히 표시한다.
- **FR35**: Operator는 대시보드의 아이디어 목록을 지표 기준으로 정렬할 수 있다.
- **FR36**: Operator는 대시보드에서 각 아이디어의 발행 URL로 이동할 수 있다.
- **FR37**: Operator는 대시보드에서 Archived 섹션을 별도로 확인할 수 있다.
- **FR38**: Operator는 특정 아이디어의 수집된 이메일 목록을 열람할 수 있다.
- **FR39**: 대시보드는 아이디어가 하나도 없는 초기 상태에서 Operator에게 첫 아이디어 생성 가이드(empty state)를 제공한다.

### Interpretation Guidance (해석 가이드)

- **FR40**: 시스템은 발행 후 경과 시간과 수집된 데이터 양에 따라 시간 기반 상태 메시지를 대시보드에 표시한다. (예: "발행 58시간 경과, 광고 도달 중")
- **FR41**: 시스템은 PV가 최소 샘플 사이즈 미만일 때 전환율 표시를 억제하거나 경고 문구를 함께 표시한다.

### Archive & Delete Workflow (정리·삭제 플로우)

- **FR42**: Operator는 Active 상태의 아이디어를 Archive로 전환할 수 있다.
- **FR43**: 시스템은 Archive 전환 전 Confirm 다이얼로그를 표시해 의도를 재확인한다.
- **FR44**: 시스템은 Archive된 아이디어에 대해서도 기존 수집 데이터를 그대로 보존한다.
- **FR45**: 시스템은 Archive된 아이디어의 발행 URL을 계속 유효하게 유지한다. (페이지는 접근 가능하며 이벤트도 계속 수집)
- **FR46**: Operator는 Archived 상태의 아이디어를 Active로 복원할 수 있다.
- **FR47**: Operator는 아이디어를 완전히 삭제할 수 있다. 삭제된 아이디어의 URL과 데이터는 복구되지 않으며, Confirm 다이얼로그를 통해 의도를 재확인한다.

### Data Management (데이터 관리)

- **FR48**: 시스템은 아이디어별로 `id`, `slug`, `status` (active/archived), `final_prompt`, `final_page_data`, `created_at`, `updated_at`, `archived_at`, `noindex` 필드를 저장한다.
- **FR49**: 시스템은 각 이벤트를 `id`, `idea_id`, `event_type`, `metadata`, `created_at` 필드로 저장한다.
- **FR50**: 시스템은 아이디어의 편집 상태(draft 포함)를 자동으로 저장한다. Operator가 브라우저를 닫았다 다시 열어도 편집 중이던 아이디어를 복구할 수 있다.
- **FR51**: Operator는 모든 아이디어와 이벤트 데이터를 JSON 형식으로 내보낼 수 있다.

### System Integrity (시스템 무결성)

- **FR52**: 시스템은 slug의 DB 수준 유일성(unique) 제약을 강제한다.
- **FR53**: 시스템은 LLM API 호출 실패 시 재시도 로직을 수행한다.
- **FR54**: 시스템은 모든 발행된 페이지에 기본적으로 `noindex` 메타 태그를 포함한다. 이 동작은 아이디어별 설정으로 토글 가능하다.

### Capability Contract 경계 (명시적 제외)

다음 항목은 이 FR 리스트에 포함되지 않았으므로 MVP에 존재하지 않는다:

- 사용자 인증/회원가입 (Operator는 애초에 로그인하지 않음)
- 실제 결제 처리
- 이미지 생성/업로드
- 커스텀 도메인
- 다중 페이지 발행
- A/B 테스트
- SEO 최적화 (sitemap, robots.txt 등)
- 다국어
- 편집 히스토리/undo-redo
- 작별 이메일 발송
- 스크롤 깊이 추적
- 광고 플랫폼 API 연동
- 이메일 삭제 요청 자동화 (수동 처리는 Operator 운영 원칙으로 Domain Requirements에 문서화됨)

### Traceability Notes

FR과 NFR 사이, 그리고 FR과 Domain Requirements 사이의 주요 연결 관계.

- **FR25 ↔ NFR-PR2 ↔ NFR-O5** — "아직 출시 전" 안내 문구는 시스템 수준에서 강제되는 **유일한 hard requirement**다. FR25(UI 노출), NFR-PR2(Privacy 원칙), NFR-O5(발행 파이프라인 자동 검증)가 3중으로 보장한다.
- **FR50 ↔ NFR-R4** — Draft 자동저장은 FR로 capability가 정의되고, NFR-R4에서 트리거 조건(필드 blur 또는 idle 10초)과 신뢰성이 규정된다.
- **FR55 ↔ NFR-O4** — Kill Switch는 FR로 동작이 정의되고, NFR-O4에서 월 예산·리셋·우회 정책이 정밀 기술된다.
- **FR27~FR32 ↔ NFR-R1 ↔ NFR-O2** — 데이터 수집 이벤트(FR)는 NFR-R1(수신 저장 보장 + `sendBeacon`)과 NFR-O2(감사 로그)로 신뢰성이 뒷받침된다.
- **FR14/FR16/FR18 ↔ NFR-R2** — URL 불변성(FR 수준 개별 항목)은 NFR-R2의 DB 제약으로 최종 보장된다.
- **FR54 ↔ Web App SEO Strategy** — 기본 noindex 메타 태그는 FR54로 capability가 정의되고, Web App Specific Requirements의 SEO Strategy 섹션에서 정책 근거(Google AI 콘텐츠 정책 리스크)가 문서화된다.
- **FR19 (발행 전 미리보기)** — NFR 연결 없음. 미리보기는 순수 UI capability로, 성능/신뢰성 요건을 별도로 요구하지 않는다.
- **FR38 ↔ Domain Requirements 개인정보 수집 고지 원칙** — 이메일 목록 열람 capability는 FR로 정의되고, Domain Requirements의 "수집 목적 외 사용 금지" 원칙이 Operator 운영 수준에서 제약한다.
- **HTTPS 제공** — FR 리스트에는 없으며, NFR-S1로만 다룬다 (운영/인프라 수준 요건).

## Non-Functional Requirements

이 섹션은 관련성이 있는 카테고리만 포함한다. Scalability, Integration 등은 이 제품의 본성과 무관하므로 의도적으로 제외되었다.

### Performance

- **NFR-P1 (Published Page 로딩)**: 발행된 랜딩페이지의 **LCP(Largest Contentful Paint)는 p75 기준 2.5초 이내**여야 한다. FCP 1.5초, CLS 0.1 이하, TTI 3.5초 이내. **측정 환경: Chrome DevTools "4G Slow" 네트워크 프리셋 + Moto G4급 CPU throttling** (CI에서 Lighthouse로 자동 측정 가능).
- **NFR-P2 (Published Page 번들)**: Published Page의 JavaScript 번들 크기는 **gzip 기준 50KB 이하**로 유지한다.
- **NFR-P3 (발행 파이프라인 속도)**: "LLM 응답 수신 완료 ~ Operator가 URL을 복사해 광고에 붙일 수 있는 시점"까지가 **p50 기준 60초 이내**여야 한다. 여기에는 페이지 렌더링, slug 할당, CDN 전파가 포함된다. **LLM 생성 시간은 NFR-P4에서 별도로 다루며 이 수치에 포함되지 않는다.**
- **NFR-P4 (LLM 응답 대기 허용치)**: LLM 생성 호출은 **p95 기준 30초 이내**에 결과 또는 실패를 반환해야 한다. 30초를 초과하면 진행 상태 UI에 "평소보다 오래 걸립니다" 안내가 자동으로 노출된다.
- **NFR-P5 (대시보드 로딩)**: 대시보드 초기 진입 시 아이디어 목록이 **3초 이내에 표시**되어야 한다 (아이디어 100개 기준). Operator Console은 WiFi/데스크톱 환경에서만 측정한다.

### Reliability

- **NFR-R1 (데이터 수집 신뢰성)**: 시스템은 **서버가 수신한 이벤트의 100%를 저장**해야 한다. 클라이언트 측 전송 실패(adblocker, 네트워크 차단 등)는 완벽 측정이 불가능하지만, 최대한의 도달을 위해 **`navigator.sendBeacon` (또는 동급)을 사용**해 브라우저 종료 직전에도 기록을 시도한다. 서버 측 카운터와 원본 이벤트 로그를 이중으로 유지해 손실 의심 시 대조 가능해야 한다.
- **NFR-R2 (URL 불변성)**: 이미 발행된 아이디어의 slug는 **100% 불변**이어야 한다. 코드나 DB 레벨에서 의도치 않은 변경이 불가능하도록 스키마 제약으로 보장한다.
- **NFR-R3 (LLM 실패 복구)**: LLM 호출 실패 시 시스템은 **자동 재시도 1회**를 수행한 뒤, 실패가 반복되면 Operator에게 명확한 오류 안내와 재시도 버튼을 제공한다. "조용한 실패"는 허용되지 않는다.
- **NFR-R4 (Draft 안전성)**: 편집 중인 아이디어의 draft 자동저장은 **(a) 필드 blur(포커스 이탈) 시, 또는 (b) 타이핑이 멈춘 후 10초 경과 시** 중 먼저 발생하는 시점에 실행되어야 한다. 브라우저를 강제 종료해도 이 주기 이상의 데이터는 손실되지 않는다.
- **NFR-R5 (발행된 페이지 가용성)**: 발행된 랜딩페이지는 정적 자산으로 제공되며, 운영 중인 호스팅 서비스(Vercel, Cloudflare Pages 등)의 **SLA를 그대로 수용한다**. 자체 가용성 목표는 세우지 않는다 (본인용 도구의 현실적 범위).

### Security

- **NFR-S1 (HTTPS 필수)**: 모든 발행 페이지와 Operator Console은 **HTTPS로만 제공**되며, HTTP 접근은 자동으로 HTTPS로 리다이렉트된다. 호스팅 서비스의 기본 HTTPS 기능을 활용한다.
- **NFR-S2 (이메일 저장 정책)**: 수집된 방문자 이메일은 평문 저장하되, **저장소 수준 at-rest encryption을 반드시 활성화**한다. Neon Postgres의 기본 암호화 기능을 활용한다. 해싱은 적용하지 않는다 (이메일은 lookup 가능해야 하므로).
- **NFR-S3 (비밀 관리)**: LLM API 키, DB 접근 토큰 등 모든 비밀(secret)은 **환경변수 또는 호스팅 서비스의 secret store**에 저장되며, 코드 리포지토리에 커밋되지 않는다.
- **NFR-S4 (최소 수집 원칙)**: Visitor로부터 수집하는 정보는 **이메일 주소 단 하나**로 제한된다. 이름, 전화번호, IP, 쿠키 기반 식별자 등 추가 개인정보는 수집하지 않는다. 이것이 이 제품의 가장 강력한 프라이버시 방어선이다.
- **NFR-S5 (Operator Console 접근 제어)**: Operator Console은 **환경변수 기반 고정 토큰** (또는 호스팅 서비스의 Password Protection 기능)으로 보호된다. 유효한 토큰 없는 접근은 `401 Unauthorized`로 차단된다. 로그인 시스템, 비밀번호 해싱, 세션 관리는 구현하지 않는다. 목표는 "우연한 외부 접근을 막는 자물쇠" 수준이며, 본격적인 인증 시스템이 아니다.

### Privacy (Summary)

세부 원칙은 Domain Requirements 섹션에서 다뤘다. NFR 수준에서 고정되는 조건은 다음과 같다:

- **NFR-PR1**: 이메일 수집 폼 아래 개인정보 수집 고지 문구는 **항상 표시**되어야 한다 (FR26과 연동).
- **NFR-PR2**: 모든 CTA 버튼 뒤에는 "아직 출시 전" 안내가 **시스템 레벨에서 강제**되며, LLM 생성 카피가 이를 덮어쓸 수 없다 (FR25와 연동).
- **NFR-PR3**: 수집된 이메일은 **수집 목적(해당 아이디어의 출시 공지) 외에는 어떤 경로로도 사용하지 않는다**. 이는 Operator 운영 원칙으로 강제된다.

### Accessibility (Summary)

세부 수준은 Step 7(Web App Specific Requirements)에서 다뤘다. NFR 수준에서 고정되는 조건은 다음과 같다:

- **NFR-A1**: 발행된 페이지의 텍스트 대비율은 **WCAG AA 수준(4.5:1 이상)**을 유지한다.
- **NFR-A2**: 모바일 터치 타겟은 **최소 44x44px**을 보장한다.
- **NFR-A3**: 폼 요소는 명시적 `<label>` 연결을 포함한다.
- **NFR-A4**: 시맨틱 HTML 사용이 강제된다 (`<main>`, `<h1>`, `<button>` 등).

정식 WCAG AA 인증, 스크린리더 완전 호환 테스트, 다국어는 NFR에 포함되지 않는다.

### Maintainability

본인용 도구는 "3개월 뒤에도 혼자 유지보수할 수 있는가"가 성패를 가른다. 다음이 지켜져야 한다.

- **NFR-M1 (스택 단순성 — AI 어시스턴트 친화)**: 선택된 기술 스택은 **Operator가 AI 어시스턴트(Claude Code, Cursor 등)의 도움을 받아 작업할 수 있는 수준**이어야 한다. 구체적으로: (1) AI 어시스턴트의 학습 데이터가 풍부한 메인스트림 스택일 것, (2) 튜토리얼과 커뮤니티 답변이 많아 막혔을 때 해결 경로가 있을 것, (3) Operator가 AI 생성 코드를 읽고 "이게 맞나?"를 판단할 수 있는 수준일 것. 이 항목은 "Operator가 혼자 능숙한 스택"을 의미하지 않는다 — Operator는 비개발자이며, 이 NFR은 "AI와 함께 빌드할 수 있는가"를 기준으로 재해석된다 (Architecture Step 3에서 확정).
- **NFR-M2 (단일 리포지토리)**: Operator Console, Published Pages, 백엔드, 스키마 정의가 **하나의 리포지토리**에 있어야 한다. 마이크로서비스 분할 금지.
- **NFR-M3 (설정 복잡도)**: 로컬 개발 환경 재구축은 `git clone → 환경변수 설정 → 단일 명령(npm install && npm run dev 또는 동급)`으로 **5분 이내 완료**되어야 한다.
- **NFR-M4 (문서의 최소 단위)**: README 한 페이지에 (1) 로컬 실행법, (2) 배포 방법, (3) 주요 디렉토리 구조, (4) 주요 의존성의 목적이 기록되어 있어야 한다. 그 이상의 문서는 의무 없음.
- **NFR-M5 (Type safety)**: TypeScript 또는 동급 정적 타입 체크를 **전면 적용**한다. "나중의 나"를 위한 가장 강력한 투자다.

### Observability

데이터가 핵심인 제품이므로, 데이터 파이프라인 자체가 잘 돌고 있는지를 항상 확인할 수 있어야 한다.

- **NFR-O1 (LLM 호출 로그)**: 모든 LLM 호출은 **요청 ID, 프롬프트 길이, 응답 길이, 토큰 사용량, 소요 시간, 성공/실패 여부**를 서버 로그에 기록한다. 이 로그는 NFR-O4(비용 모니터링)와 FR55(Kill Switch)의 근거 데이터가 된다.
- **NFR-O2 (이벤트 수집 감사)**: PV/클릭/이메일 이벤트는 **서버사이드 카운터와 별도로 원본 로그**로도 보존된다. 누락 의심 시 대조 가능.
- **NFR-O3 (Error tracking)**: Sentry 또는 동급 도구로 **Critical 경로의 예외**(LLM 호출 실패, 이벤트 수집 실패, DB 쓰기 실패)는 자동 수집된다. Operator Console의 일반 UI 에러는 `console.log` 수준으로 충분.
- **NFR-O4 (비용 모니터링 & Hard Kill Switch)**: LLM API 사용량은 **월 단위로 집계**되어 대시보드 한 구석에 표시된다. **월 예산 상한(기본값 $50, 환경변수로 조정 가능) 초과 시 LLM 호출은 자동으로 차단**된다 (FR55 참조). Operator는 환경변수 `KILL_SWITCH_OVERRIDE=true`로 명시적 우회가 가능하며, 월 1일 00:00 UTC에 카운터가 자동 리셋된다. 예산 도달 시 Operator Console과 이메일(또는 동급 채널)로 알림.
- **NFR-O5 (법적 가드레일 자동 검증)**: 발행 파이프라인 내에서 **"아직 출시 전" 문구가 최종 HTML 출력에 포함되어 있는지 자동 검증 체크**를 수행한다. 검증에 실패하면 발행이 차단되고 Operator에게 오류가 반환된다. 이 체크는 템플릿 리팩토링 중 실수로 문구가 제거되는 상황을 방지하기 위한 안전망이다.

### 의도적으로 제외된 NFR 카테고리

다음 카테고리는 이 제품의 본성상 해당 사항이 없으므로 의도적으로 제외된다:

- **Scalability**: 단일 사용자, 단일 운영자 제품. 트래픽 성장은 발행된 페이지에만 해당하며, CDN이 처리한다. 자체 scale-out 설계는 불필요.
- **Integration**: 외부 시스템 연동 없음.
- **High Availability / Disaster Recovery**: 본인용 도구, 중단이 타인에게 영향 주지 않음. 호스팅 서비스의 기본 가용성으로 충분.
- **Internationalization (i18n)**: MVP는 한국어 단일 언어.
- **Compliance Certification**: SOC2, ISO 27001 등 정식 인증 불필요.
- **Multi-region Deployment**: 단일 리전 배포로 충분.
