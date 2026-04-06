// scripts/check-bundle-size.ts
//
// Checks the gzip size of JS chunks for the Published Page ([slug]) route.
// Must be run AFTER `bun run build` (requires .next directory).
// Fails with exit(1) if any individual chunk exceeds MAX_GZIP_KB.

import { readdirSync, readFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { gzipSync } from 'zlib'

const ROOT = resolve(import.meta.dirname, '..')
const CHUNKS_DIR = join(ROOT, '.next', 'static', 'chunks', 'app')
const MAX_GZIP_KB = 50

if (!existsSync(CHUNKS_DIR)) {
  console.error('❌ .next/static/chunks/app not found. Run `bun run build` first.')
  process.exit(1)
}

function gzipSizeKb(filepath: string): number {
  const content = readFileSync(filepath)
  return gzipSync(content).length / 1024
}

// Collect all JS chunks under the [slug] route segment
const slugDirs = readdirSync(CHUNKS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name.startsWith('['))
  .map((d) => join(CHUNKS_DIR, d.name))

const sharedChunksDir = join(ROOT, '.next', 'static', 'chunks')

// Also include the page bundle itself
const allJsFiles: string[] = []

for (const dir of slugDirs) {
  try {
    const files = readdirSync(dir).filter((f) => f.endsWith('.js'))
    files.forEach((f) => allJsFiles.push(join(dir, f)))
  } catch {
    // ignore missing dirs
  }
}

// If no slug-specific chunks found, check shared page chunks
if (allJsFiles.length === 0) {
  console.log('ℹ️  No [slug]-specific chunks found — checking shared app chunks')
  const shared = readdirSync(sharedChunksDir)
    .filter((f) => f.endsWith('.js') && !f.startsWith('webpack'))
    .map((f) => join(sharedChunksDir, f))
  allJsFiles.push(...shared.slice(0, 10)) // sample top chunks
}

if (allJsFiles.length === 0) {
  console.log('ℹ️  No JS chunks to check — skipping bundle size validation')
  process.exit(0)
}

let failed = false
let totalKb = 0

console.log('\nJS chunk gzip sizes:')
for (const file of allJsFiles) {
  const kb = gzipSizeKb(file)
  totalKb += kb
  const name = file.replace(ROOT + '/', '')
  if (kb > MAX_GZIP_KB) {
    console.error(`❌ ${name}: ${kb.toFixed(1)}KB gzip (exceeds ${MAX_GZIP_KB}KB limit)`)
    failed = true
  } else {
    console.log(`✅ ${name}: ${kb.toFixed(1)}KB gzip`)
  }
}

console.log(`\nTotal checked: ${allJsFiles.length} chunk(s), ${totalKb.toFixed(1)}KB gzip combined`)

if (failed) {
  console.error(`\ncheck-bundle-size: one or more chunks exceed the ${MAX_GZIP_KB}KB gzip limit`)
  process.exit(1)
} else {
  console.log('\ncheck-bundle-size: all chunks within size limits')
  process.exit(0)
}
