# Story 1.4: slug 불변성 Postgres 트리거 마이그레이션

Status: done

## Story

As a **Operator**,
I want **slug 필드의 UPDATE를 거부하는 Postgres 트리거를 DB에 배포**,
so that **NFR-R2(URL 불변성 100%)가 DB 수준에서 강제되며, 애플리케이션 버그로도 slug가 바뀌지 않는다**.

## Acceptance Criteria

1. **Given** Story 1.3의 테이블이 존재한다, **When** `drizzle/custom/slug_immutable.sql` 파일에 `prevent_slug_update()` 함수와 `ideas_slug_immutable` 트리거 SQL을 작성한다, **Then** 해당 SQL을 Neon에 수동으로 적용한다
2. 기존 `ideas` row의 `slug`를 `UPDATE`로 변경하려는 시도는 `slug is immutable` 예외로 거부된다
3. 새 row `INSERT` 시에는 정상 작동한다
4. `updated_at` 같은 다른 필드 UPDATE는 정상 작동한다
5. 이 마이그레이션은 README의 "Setup" 섹션에 수동 적용 절차로 문서화된다

## Tasks / Subtasks

- [x] Task 1: 트리거 SQL 작성 (AC: #1)
  - [x] `drizzle/custom/` 디렉토리 생성
  - [x] `drizzle/custom/slug_immutable.sql` 파일 생성
  - [x] `CREATE OR REPLACE FUNCTION prevent_slug_update()` 정의 작성
  - [x] `CREATE TRIGGER ideas_slug_immutable BEFORE UPDATE ON ideas` 작성
- [x] Task 2: Neon에 트리거 적용 (AC: #1)
  - [x] Neon Dashboard SQL Editor에서 실행
  - [x] `1: CREATE`, `2: CREATE` — Statement executed successfully 확인
- [x] Task 3: slug UPDATE 거부 검증 (AC: #2)
  - [x] 테스트 row INSERT → id: ae1ae3fb-d660-4ffe-a3ee-e18967478487
  - [x] slug UPDATE 시도 → `ERROR: slug is immutable (attempted: test-slug → new-slug)` 확인
- [x] Task 4: 다른 필드 UPDATE 정상 작동 검증 (AC: #4)
  - [x] `UPDATE ideas SET final_prompt='updated'` → Statement executed successfully
- [x] Task 5: INSERT 정상 작동 검증 (AC: #3)
  - [x] INSERT 성공 확인
- [x] Task 6: 테스트 row 정리
  - [x] `DELETE FROM ideas WHERE id='ae1ae3fb-...'` → Statement executed successfully
- [x] Task 7: README 업데이트 (AC: #5)
  - [x] `README.md` "Setup" 섹션에 수동 적용 절차 추가

## Dev Notes

**트리거 SQL 전체 (Architecture 결정 8 참조):**

```sql
-- drizzle/custom/slug_immutable.sql
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

**왜 DB 트리거인가:**

- 애플리케이션 수준 가드(Drizzle 쿼리에서 slug 제외)만으로는 비개발자 + AI 어시스턴트 맥락에서 실수 발생 가능
- DB 수준 강제는 코드 버그로도 뚫릴 수 없는 최종 방어선
- NFR-R2 "100% 불변"의 유일한 실질적 보장 경로

**Drizzle 자동 마이그레이션에 안 넣는 이유:**

- `drizzle-kit generate`는 함수/트리거 같은 non-DDL을 지원하지 않음
- 따라서 `drizzle/custom/` 디렉토리로 별도 관리
- 수동 실행이지만 "한 번만" 필요하므로 허용 가능한 오버헤드

### Project Structure Notes

- `drizzle/custom/slug_immutable.sql` — Drizzle 자동 생성 폴더와 별도
- README 업데이트로 수동 적용 단계 문서화

### References

- [Source: architecture.md#Core Architectural Decisions#결정 8#추가 DB 레벨 제약] — 트리거 SQL 원본
- [Source: prd.md#NFR-R2] — URL 불변성 100% 요구
- [Source: prd.md#FR52] — slug unique 제약
- [Source: architecture.md#Cross-Cutting Concerns#4] — URL 불변성 이중 방어
- [Source: epics.md#Story 1.4] — 원본 AC

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 via Claude Code

### Debug Log References

- Neon SQL Editor: `1: CREATE`, `2: CREATE` — Statement executed successfully (89ms)
- slug UPDATE 테스트: `ERROR: slug is immutable (attempted: test-slug → new-slug)` 확인
- final_prompt UPDATE 테스트: Statement executed successfully

### Completion Notes List

- **수동 적용**: drizzle-kit은 함수/트리거 DDL을 지원하지 않아 `drizzle/custom/` 별도 관리. Neon SQL Editor에서 1회 수동 실행.
- **IS DISTINCT FROM**: `OLD.slug != NEW.slug` 대신 사용 — NULL ↔ NULL을 "변경 없음"으로 올바르게 처리.

### File List

**생성:**
- `drizzle/custom/slug_immutable.sql` — slug 불변성 트리거 SQL

**수정:**
- `README.md` — Setup 섹션에 트리거 수동 적용 단계 추가
- `_bmad-output/implementation-artifacts/1-4-slug-immutable-trigger.md` — 완료 처리

**DB 변경 (Neon production):**
- `prevent_slug_update()` 함수 생성
- `ideas_slug_immutable` 트리거 생성
