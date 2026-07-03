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

const gymPulseMapSrc = readFileSync(join(root, 'src/components/map/GymPulseMap.tsx'), 'utf8')
if (!gymPulseMapSrc.includes('gymPulseMarkerRegistry')) {
  console.error('GymPulseMap missing marker registry (map modularization)')
  ok = false
}
if (!gymPulseMapSrc.includes('import * as MarkerHtml')) {
  console.error('GymPulseMap missing namespace marker imports')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ GymPulseMap registry + namespace imports present')

const authSrc = readFileSync(join(root, 'src/components/auth/AuthScreen.tsx'), 'utf8')
if (!authSrc.includes('BRAND_COPY.pilotGeo.focusBadge')) {
  console.error('AuthScreen missing pilot geo badge from BRAND_COPY')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ AuthScreen pilot badge wired to BRAND_COPY')

const rotationCoverage = readFileSync(
  join(root, 'src/utils/e2ePlanRotationCoverage.ts'),
  'utf8'
)
const rotationSpecs = [
  'workout-plan-history-flow.spec.ts',
  'training-mega-flow.spec.ts',
  'workout-history-flow.spec.ts',
]
for (const spec of rotationSpecs) {
  if (!rotationCoverage.includes(spec)) {
    console.error(`e2ePlanRotationCoverage missing spec file: ${spec}`)
    ok = false
  }
}
const ciYml = readFileSync(join(root, '.github/workflows/ci.yml'), 'utf8')
for (const spec of rotationSpecs) {
  if (!ciYml.includes(spec)) {
    console.error(`CI e2e-smoke missing rotation spec: ${spec}`)
    ok = false
  }
}
if (!ok) process.exit(1)
console.log('✓ e2ePlanRotationCoverage aligned with CI e2e-smoke (3 specs)')

const fuelPlanCoverage = readFileSync(
  join(root, 'src/utils/e2eFuelPlanCoverage.ts'),
  'utf8'
)
const fuelPlanSpecs = [
  'training-mega-flow.spec.ts',
  'workout-plan-history-flow.spec.ts',
  'workout-fuel-flow.spec.ts',
]
for (const spec of fuelPlanSpecs) {
  if (!fuelPlanCoverage.includes(spec)) {
    console.error(`e2eFuelPlanCoverage missing spec file: ${spec}`)
    ok = false
  }
}
for (const spec of fuelPlanSpecs) {
  if (!ciYml.includes(spec)) {
    console.error(`CI e2e-smoke missing fuel-plan spec: ${spec}`)
    ok = false
  }
}
if (!ok) process.exit(1)
console.log('✓ e2eFuelPlanCoverage aligned with CI e2e-smoke (3 specs)')

const vitest = spawnSync('npx', ['vitest', 'run'], { cwd: root, stdio: 'inherit', shell: true })
if (vitest.status !== 0) process.exit(vitest.status ?? 1)
console.log('✓ vitest passed')
