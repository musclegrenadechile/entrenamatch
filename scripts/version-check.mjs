#!/usr/bin/env node
/**
 * Verifica alineación de versiones EntrenaMatch (P0 beta).
 * Uso: node scripts/version-check.mjs
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(path) {
  return readFileSync(join(root, path), 'utf8')
}

const pkg = JSON.parse(read('package.json'))
const constants = read('src/constants/index.ts')
const gradle = read('android/app/build.gradle')

const appVersionMatch = constants.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/)
const versionCodeMatch = gradle.match(/versionCode\s+(\d+)/)
const versionNameMatch = gradle.match(/versionName\s+"([^"]+)"/)

const expected = pkg.version
const versionCode = Number(versionCodeMatch?.[1] || 0)

const checks = [
  ['package.json', expected, pkg.version],
  ['APP_VERSION', expected, appVersionMatch?.[1]],
  ['Android versionName', expected, versionNameMatch?.[1]],
]

let ok = true
console.log(`\nEntrenaMatch version check (expected: ${expected})\n`)
for (const [label, want, got] of checks) {
  const pass = want === got
  if (!pass) ok = false
  console.log(`${pass ? '✓' : '✗'} ${label}: ${got ?? 'MISSING'} ${pass ? '' : `(want ${want})`}`)
}

if (versionCode < 147) {
  ok = false
  console.log(`✗ Android versionCode: ${versionCode} (must be >= 147 for this release)`)
} else {
  console.log(`✓ Android versionCode: ${versionCode}`)
}

if (!ok) {
  console.error('\nVersion mismatch — align before Play upload.\n')
  process.exit(1)
}
console.log('\nAll version strings aligned.\n')
