/**
 * Fase 82 — warn if App chunk grows >10% vs baseline (dist/assets/App-*.js gzip).
 * Baseline file: scripts/bundle-size-baseline.json (updated manually after intentional bumps).
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const DIST = join(process.cwd(), 'dist', 'assets')
const BASELINE_PATH = join(process.cwd(), 'scripts', 'bundle-size-baseline.json')
const MAX_GROWTH = 1.1

function gzipSize(path) {
  return gzipSync(readFileSync(path)).length
}

function findMainChunk() {
  if (!existsSync(DIST)) return null
  const files = readdirSync(DIST).filter((f) => f.endsWith('.js'))
  if (!files.length) return null
  const ranked = files
    .map((f) => {
      const path = join(DIST, f)
      return { f, path, size: gzipSize(path) }
    })
    .sort((a, b) => b.size - a.size)
  const appChunk = ranked.find((x) => x.f.startsWith('App-'))
  return (appChunk ?? ranked[0]).path
}

const chunk = findMainChunk()
if (!chunk) {
  console.warn('[bundle-size] dist chunk not found — skip (run build first)')
  process.exit(0)
}

const size = gzipSize(chunk)
const name = chunk.split(/[/\\]/).pop()

let baseline = size
if (existsSync(BASELINE_PATH)) {
  try {
    const data = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'))
    baseline = Number(data.gzipBytes) || size
  } catch {
    baseline = size
  }
} else {
  writeFileSync(BASELINE_PATH, JSON.stringify({ gzipBytes: size, file: name }, null, 2))
  console.log(`[bundle-size] baseline created: ${size} bytes gzip (${name})`)
  process.exit(0)
}

const ratio = size / baseline
console.log(`[bundle-size] ${name}: ${size} gzip (baseline ${baseline}, ratio ${ratio.toFixed(3)})`)

if (ratio > MAX_GROWTH) {
  console.error(
    `[bundle-size] FAIL: grew ${((ratio - 1) * 100).toFixed(1)}% > ${((MAX_GROWTH - 1) * 100).toFixed(0)}% budget`
  )
  process.exit(1)
}

console.log('[bundle-size] OK')
