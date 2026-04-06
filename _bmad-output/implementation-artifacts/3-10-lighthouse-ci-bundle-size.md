# Story 3.10: Lighthouse CI + 번들 크기 검증 (성능 게이트)

Status: review

## Story

As a **Operator**,
I want **Published Page의 성능(LCP, JS 번들 크기)이 CI 단계에서 자동 측정되고 기준 미달 시 배포 차단**,
So that **NFR-P1(LCP < 2.5s), NFR-P2(JS 번들 < 50KB gzip)가 지속적으로 보장된다**.

## Acceptance Criteria

1. `@lhci/cli` devDependency 설치
2. `lighthouserc.json` — assertions (LCP, CLS, FCP, TTI)
3. `scripts/check-bundle-size.ts` — .next/static 번들 크기 검증 (50KB gzip 제한)
4. CI — `bun run build` 후 `bun run check:bundle` + `bunx lhci autorun` (continue-on-error)
5. `package.json`에 `check:bundle` 스크립트 추가

## Tasks / Subtasks

- [x] Task 1: @lhci/cli 설치
- [x] Task 2: lighthouserc.json 생성
- [x] Task 3: check-bundle-size.ts 구현
  - [x] .next/static/chunks 에서 [slug] 관련 JS gzip 크기 합산
  - [x] 50KB 초과 시 exit(1)
- [x] Task 4: package.json check:bundle 스크립트 추가
- [x] Task 5: CI workflow 업데이트
  - [x] build 스텝 추가
  - [x] check:bundle 스텝 추가
  - [x] lhci autorun 스텝 추가 (continue-on-error: true)
- [x] Task 6: 검증
  - [x] typecheck, lint, test 통과

## Dev Notes

- `next build`는 force-dynamic 라우트를 런타임에 실행하지 않으므로 DATABASE_URL 없이도 빌드 가능
- Lighthouse는 next start + DATABASE_URL 필요 → CI에서는 continue-on-error: true
- bundle size: zlib.gzipSync으로 실제 gzip 크기 측정

### References
- [Source: epics.md#Story 3.10]

## Dev Agent Record
### Agent Model Used
Claude Sonnet 4.6 via Claude Code
### Completion Notes List
- Lighthouse: next start + DATABASE_URL 필요 → CI에서 continue-on-error:true, 로컬/프로덕션 환경에서 유효
- check-bundle-size: zlib.gzipSync으로 실제 gzip 크기 측정, .next 없으면 안내 후 exit(1)
- next build: force-dynamic 라우트는 런타임 DB 호출 없으므로 CI에서 DATABASE_URL 없이도 빌드 가능
### File List
**생성:**
- `lighthouserc.json`
- `scripts/check-bundle-size.ts`
**수정:**
- `package.json` — check:bundle 스크립트 추가, @lhci/cli devDependency
- `.github/workflows/ci.yml` — build, check:bundle, lhci autorun 스텝 추가
