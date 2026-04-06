// scripts/check-legal.ts
//
// CI guard: verifies that every Published Page route includes the legal disclaimer footer.
// Greps source files rather than build artifacts so this check works without a build step
// and without production secrets in CI.
//
// Checks:
//   1. LegalDisclaimerFooter component contains data-legal-disclaimer attribute
//   2. [slug]/layout.tsx imports LegalDisclaimerFooter (auto-includes on all public pages)
//   3. Operator preview page includes LegalDisclaimerFooter

import { readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(import.meta.dirname, '..')

function readFile(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf-8')
}

type CheckResult = { pass: boolean; message: string }

const checks: CheckResult[] = []

function check(description: string, pass: boolean) {
  checks.push({ pass, message: description })
}

// 1. LegalDisclaimerFooter has data-legal-disclaimer attribute and disclaimer text
const footerSrc = readFile('src/components/published/LegalDisclaimerFooter.tsx')
check(
  'LegalDisclaimerFooter contains data-legal-disclaimer attribute',
  footerSrc.includes('data-legal-disclaimer')
)
check(
  'LegalDisclaimerFooter contains disclaimer text',
  footerSrc.includes('아직 출시 전')
)

// 2. [slug]/layout.tsx imports and uses LegalDisclaimerFooter
const slugLayout = readFile('src/app/[slug]/layout.tsx')
check(
  '[slug]/layout.tsx includes LegalDisclaimerFooter',
  slugLayout.includes('LegalDisclaimerFooter')
)

// 3. Operator preview page includes LegalDisclaimerFooter
const previewPage = readFile('src/app/(operator)/operator/ideas/[id]/preview/page.tsx')
check(
  'Operator preview page includes LegalDisclaimerFooter',
  previewPage.includes('LegalDisclaimerFooter')
)

// Report
let failed = false
for (const { pass, message } of checks) {
  if (pass) {
    console.log(`✅ ${message}`)
  } else {
    console.error(`❌ FAILED: ${message}`)
    failed = true
  }
}

if (failed) {
  console.error('\ncheck-legal: one or more legal disclaimer checks failed')
  process.exit(1)
} else {
  console.log('\ncheck-legal: all checks passed')
  process.exit(0)
}
