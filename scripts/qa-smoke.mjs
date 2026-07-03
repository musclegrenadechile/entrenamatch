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
if (!fuelPlanCoverage.includes('isFuelPlanNutritionE2ETrilogyComplete')) {
  console.error('e2eFuelPlanCoverage missing nutrition trilogy helper (oleada 417)')
  ok = false
}
if (!fuelPlanCoverage.includes("'fuel-nutrition'")) {
  console.error('e2eFuelPlanCoverage missing fuel-nutrition cover')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eFuelPlanCoverage nutrition trilogy helper present')

const fuelPlanNutritionCoverage = readFileSync(
  join(root, 'src/utils/e2eFuelPlanNutritionCoverage.ts'),
  'utf8'
)
const fuelPlanNutritionSpecs = [
  'training-mega-flow.spec.ts',
  'workout-plan-history-flow.spec.ts',
  'workout-fuel-flow.spec.ts',
]
for (const spec of fuelPlanNutritionSpecs) {
  if (!fuelPlanNutritionCoverage.includes(spec)) {
    console.error(`e2eFuelPlanNutritionCoverage missing spec file: ${spec}`)
    ok = false
  }
}
for (const spec of fuelPlanNutritionSpecs) {
  if (!ciYml.includes(spec)) {
    console.error(`CI e2e-smoke missing fuel-plan nutrition spec: ${spec}`)
    ok = false
  }
}
if (!fuelPlanNutritionCoverage.includes('isFuelPlanNutritionCoverageComplete')) {
  console.error('e2eFuelPlanNutritionCoverage missing coverage helper (oleada 418)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eFuelPlanNutritionCoverage aligned with CI e2e-smoke (3 specs)')

const fuelPlanHeadlineCoverage = readFileSync(
  join(root, 'src/utils/e2eFuelPlanHeadlineCoverage.ts'),
  'utf8'
)
const fuelPlanHeadlineSpecs = [
  'training-mega-flow.spec.ts',
  'workout-plan-history-flow.spec.ts',
  'workout-fuel-flow.spec.ts',
]
for (const spec of fuelPlanHeadlineSpecs) {
  if (!fuelPlanHeadlineCoverage.includes(spec)) {
    console.error(`e2eFuelPlanHeadlineCoverage missing spec file: ${spec}`)
    ok = false
  }
}
for (const spec of fuelPlanHeadlineSpecs) {
  if (!ciYml.includes(spec)) {
    console.error(`CI e2e-smoke missing fuel-plan headline spec: ${spec}`)
    ok = false
  }
}
if (!fuelPlanHeadlineCoverage.includes('isFuelPlanHeadlineCoverageComplete')) {
  console.error('e2eFuelPlanHeadlineCoverage missing coverage helper (oleada 419)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eFuelPlanHeadlineCoverage aligned with CI e2e-smoke (3 specs)')

const fuelPlanFullCoverage = readFileSync(
  join(root, 'src/utils/e2eFuelPlanFullCoverage.ts'),
  'utf8'
)
if (!fuelPlanFullCoverage.includes('isFuelPlanFullE2ECoverageComplete')) {
  console.error('e2eFuelPlanFullCoverage missing full coverage helper (oleada 420)')
  ok = false
}
if (!fuelPlanFullCoverage.includes('e2eFuelPlanCoverage')) {
  console.error('e2eFuelPlanFullCoverage missing e2eFuelPlanCoverage module ref')
  ok = false
}
if (!fuelPlanFullCoverage.includes('e2eFuelPlanNutritionCoverage')) {
  console.error('e2eFuelPlanFullCoverage missing e2eFuelPlanNutritionCoverage module ref')
  ok = false
}
if (!fuelPlanFullCoverage.includes('e2eFuelPlanHeadlineCoverage')) {
  console.error('e2eFuelPlanFullCoverage missing e2eFuelPlanHeadlineCoverage module ref')
  ok = false
}
if (!fuelPlanCoverage.includes("'fuel-headline'")) {
  console.error('e2eFuelPlanCoverage missing fuel-headline cover (oleada 420)')
  ok = false
}
if (!fuelPlanCoverage.includes("'fuel-scenario'")) {
  console.error('e2eFuelPlanCoverage missing fuel-scenario cover (oleada 421)')
  ok = false
}
if (!fuelPlanCoverage.includes("'fuel-row-tone'")) {
  console.error('e2eFuelPlanCoverage missing fuel-row-tone cover (oleada 422)')
  ok = false
}
if (!fuelPlanCoverage.includes("'fuel-tone-stack'")) {
  console.error('e2eFuelPlanCoverage missing fuel-tone-stack cover (oleada 423)')
  ok = false
}
if (!fuelPlanCoverage.includes("'fuel-nutrition-tone'")) {
  console.error('e2eFuelPlanCoverage missing fuel-nutrition-tone cover (oleada 424)')
  ok = false
}
if (!ok) process.exit(1)

const fuelPlanScenarioCoverage = readFileSync(
  join(root, 'src/utils/e2eFuelPlanScenarioCoverage.ts'),
  'utf8'
)
for (const spec of fuelPlanHeadlineSpecs) {
  if (!fuelPlanScenarioCoverage.includes(spec)) {
    console.error(`e2eFuelPlanScenarioCoverage missing spec file: ${spec}`)
    ok = false
  }
}
if (!fuelPlanScenarioCoverage.includes('isFuelPlanScenarioCoverageComplete')) {
  console.error('e2eFuelPlanScenarioCoverage missing coverage helper (oleada 421)')
  ok = false
}
if (!fuelPlanFullCoverage.includes('e2eFuelPlanScenarioCoverage')) {
  console.error('e2eFuelPlanFullCoverage missing scenario suite ref (oleada 421)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eFuelPlanScenarioCoverage aligned with full coverage (oleada 421)')

const fuelPlanToneCoverage = readFileSync(
  join(root, 'src/utils/e2eFuelPlanToneCoverage.ts'),
  'utf8'
)
for (const spec of fuelPlanHeadlineSpecs) {
  if (!fuelPlanToneCoverage.includes(spec)) {
    console.error(`e2eFuelPlanToneCoverage missing spec file: ${spec}`)
    ok = false
  }
}
if (!fuelPlanToneCoverage.includes('isFuelPlanToneCoverageComplete')) {
  console.error('e2eFuelPlanToneCoverage missing coverage helper (oleada 423)')
  ok = false
}
if (!fuelPlanFullCoverage.includes('e2eFuelPlanToneCoverage')) {
  console.error('e2eFuelPlanFullCoverage missing tone suite ref (oleada 423)')
  ok = false
}
if (!fuelPlanFullCoverage.includes("'fuel-tone-stack'")) {
  console.error('e2eFuelPlanFullCoverage missing fuel-tone-stack check (oleada 423)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eFuelPlanToneCoverage aligned with full coverage (oleada 423)')

const fuelPlanNutritionCoverage = readFileSync(
  join(root, 'src/utils/e2eFuelPlanNutritionCoverage.ts'),
  'utf8'
)
if (!fuelPlanNutritionCoverage.includes("'nutrition-tone'")) {
  console.error('e2eFuelPlanNutritionCoverage missing nutrition-tone cover (oleada 424)')
  ok = false
}
if (!fuelPlanFullCoverage.includes("'fuel-nutrition-tone'")) {
  console.error('e2eFuelPlanFullCoverage missing fuel-nutrition-tone check (oleada 424)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eFuelPlanNutritionCoverage nutrition-tone aligned (oleada 424)')
console.log('✓ e2eFuelPlanFullCoverage unifies 5 Fuel×plan E2E suites (oleada 424)')

const vitest = spawnSync('npx', ['vitest', 'run'], { cwd: root, stdio: 'inherit', shell: true })
if (vitest.status !== 0) process.exit(vitest.status ?? 1)
console.log('✓ vitest passed')
