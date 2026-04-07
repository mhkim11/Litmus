-- slug 불변성 트리거
-- Story 1.4: NFR-R2 URL 불변성 100% 보장 (DB 수준 최종 방어선)
-- 적용 방법: Neon Dashboard SQL Editor에서 1회 실행
--
-- drizzle-kit generate는 함수/트리거를 지원하지 않으므로 drizzle/custom/에서 별도 관리.

CREATE OR REPLACE FUNCTION prevent_slug_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.slug IS NOT NULL AND OLD.slug IS DISTINCT FROM NEW.slug THEN
    RAISE EXCEPTION 'slug is immutable (attempted: % → %)', OLD.slug, NEW.slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ideas_slug_immutable
  BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION prevent_slug_update();
