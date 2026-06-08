#!/usr/bin/env node
/**
 * QA smoke — version alignment + unit tests.
 */
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function readJson(rel) {
  return JSON.parse(readFileSync(join(root, rel), 'utf8'))
}

const pkg = readJson('package.json')
const constants = readFileSync(join(root, 'src/constants/index.ts'), 'utf8')
const gradle = readFileSync(join(root, 'android/app/build.gradle'), 'utf8')

const version = pkg.version
const appMatch = constants.match(/APP_VERSION\s*=\s*'([^']+)'/)
const codeMatch = gradle.match(/versionCode\s+(\d+)/)
const nameMatch = gradle.match(/versionName\s+"([^"]+)"/)

let ok = true
if (!appMatch || appMatch[1] !== version) {
  console.error(`APP_VERSION mismatch: expected ${version}, got ${appMatch?.[1]}`)
  ok = false
}
const code = Number(codeMatch?.[1])
const patch = Number(version.split('.').pop())
if (code !== patch) {
  console.error(`versionCode mismatch: expected ${patch}, got ${code}`)
  ok = false
}
if (nameMatch?.[1] !== version) {
  console.error(`versionName mismatch: expected ${version}, got ${nameMatch?.[1]}`)
  ok = false
}

if (!ok) process.exit(1)
console.log(`✓ versions aligned at ${version} (code ${code})`)

const vitest = spawnSync('npx', ['vitest', 'run'], { cwd: root, stdio: 'inherit', shell: true })
if (vitest.status !== 0) process.exit(vitest.status ?? 1)
console.log('✓ vitest passed')
