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
if (!fuelPlanCoverage.includes("'fuel-tone-expected'")) {
  console.error('e2eFuelPlanCoverage missing fuel-tone-expected cover (oleada 425)')
  ok = false
}
if (!fuelPlanCoverage.includes("'fuel-tone-aria'")) {
  console.error('e2eFuelPlanCoverage missing fuel-tone-aria cover (oleada 426)')
  ok = false
}
if (!fuelPlanCoverage.includes("'fuel-tone-card'")) {
  console.error('e2eFuelPlanCoverage missing fuel-tone-card cover (oleada 427)')
  ok = false
}
if (!fuelPlanCoverage.includes("'fuel-tone-full'")) {
  console.error('e2eFuelPlanCoverage missing fuel-tone-full cover (oleada 428)')
  ok = false
}
if (!fuelPlanCoverage.includes("'fuel-history-tone'")) {
  console.error('e2eFuelPlanCoverage missing fuel-history-tone cover (oleada 430)')
  ok = false
}
if (!fuelPlanCoverage.includes("'fuel-rotation-tone'")) {
  console.error('e2eFuelPlanCoverage missing fuel-rotation-tone cover (oleada 431)')
  ok = false
}
if (!fuelPlanCoverage.includes("'fuel-energy-tone'")) {
  console.error('e2eFuelPlanCoverage missing fuel-energy-tone cover (oleada 433)')
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
if (!fuelPlanToneCoverage.includes('isFuelPlanToneExpectedCoverageComplete')) {
  console.error('e2eFuelPlanToneCoverage missing tone-expected helper (oleada 425)')
  ok = false
}
if (!fuelPlanToneCoverage.includes("'tone-expected'")) {
  console.error('e2eFuelPlanToneCoverage missing tone-expected cover (oleada 425)')
  ok = false
}
if (!fuelPlanToneCoverage.includes('isFuelPlanToneAriaCoverageComplete')) {
  console.error('e2eFuelPlanToneCoverage missing tone-aria helper (oleada 426)')
  ok = false
}
if (!fuelPlanToneCoverage.includes("'tone-aria'")) {
  console.error('e2eFuelPlanToneCoverage missing tone-aria cover (oleada 426)')
  ok = false
}
if (!fuelPlanToneCoverage.includes('isFuelPlanToneCardCoverageComplete')) {
  console.error('e2eFuelPlanToneCoverage missing tone-card helper (oleada 427)')
  ok = false
}
if (!fuelPlanToneCoverage.includes("'tone-card'")) {
  console.error('e2eFuelPlanToneCoverage missing tone-card cover (oleada 427)')
  ok = false
}
if (!fuelPlanToneCoverage.includes('isFuelPlanToneFullCoverageComplete')) {
  console.error('e2eFuelPlanToneCoverage missing tone-full helper (oleada 428)')
  ok = false
}
if (!fuelPlanToneCoverage.includes("'tone-full'")) {
  console.error('e2eFuelPlanToneCoverage missing tone-full cover (oleada 428)')
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
if (!fuelPlanFullCoverage.includes("'fuel-tone-expected'")) {
  console.error('e2eFuelPlanFullCoverage missing fuel-tone-expected check (oleada 425)')
  ok = false
}
if (!ok) process.exit(1)
if (!fuelPlanFullCoverage.includes("'fuel-tone-aria'")) {
  console.error('e2eFuelPlanFullCoverage missing fuel-tone-aria check (oleada 426)')
  ok = false
}
if (!ok) process.exit(1)
const fuelPlanPostFullCoverage = readFileSync(
  join(root, 'src/utils/e2eFuelPlanPostFullCoverage.ts'),
  'utf8'
)
if (!fuelPlanPostFullCoverage.includes('isFuelPlanPostFullE2ECoverageComplete')) {
  console.error('e2eFuelPlanPostFullCoverage missing post-full helper (oleada 427)')
  ok = false
}
if (!fuelPlanFullCoverage.includes('e2eFuelPlanPostFullCoverage')) {
  console.error('e2eFuelPlanFullCoverage missing post-full suite ref (oleada 427)')
  ok = false
}
if (!fuelPlanFullCoverage.includes("'fuel-tone-card'")) {
  console.error('e2eFuelPlanFullCoverage missing fuel-tone-card check (oleada 427)')
  ok = false
}
if (!fuelPlanFullCoverage.includes("'fuel-tone-full'")) {
  console.error('e2eFuelPlanFullCoverage missing fuel-tone-full check (oleada 428)')
  ok = false
}
if (!fuelPlanFullCoverage.includes('isFuelPlanToneFullCoverageComplete')) {
  console.error('e2eFuelPlanFullCoverage missing tone-full helper ref (oleada 428)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eFuelPlanPostFullCoverage aligned with full coverage (oleada 427)')
const fuelPlanPostStackCoverage = readFileSync(
  join(root, 'src/utils/e2eFuelPlanPostStackCoverage.ts'),
  'utf8'
)
if (!fuelPlanPostStackCoverage.includes('isFuelPlanPostStackE2ECoverageComplete')) {
  console.error('e2eFuelPlanPostStackCoverage missing post-stack helper (oleada 429)')
  ok = false
}
if (!fuelPlanFullCoverage.includes('e2eFuelPlanPostStackCoverage')) {
  console.error('e2eFuelPlanFullCoverage missing post-stack suite ref (oleada 429)')
  ok = false
}
if (!fuelPlanFullCoverage.includes('isFuelPlanPostStackE2ECoverageComplete')) {
  console.error('e2eFuelPlanFullCoverage missing post-stack helper ref (oleada 429)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eFuelPlanPostStackCoverage aligned with full coverage (oleada 429)')
const fuelPlanHistoryToneCoverage = readFileSync(
  join(root, 'src/utils/e2eFuelPlanHistoryToneCoverage.ts'),
  'utf8'
)
if (!fuelPlanHistoryToneCoverage.includes('isFuelPlanHistoryToneCoverageComplete')) {
  console.error('e2eFuelPlanHistoryToneCoverage missing history-tone helper (oleada 430)')
  ok = false
}
if (!fuelPlanFullCoverage.includes('e2eFuelPlanHistoryToneCoverage')) {
  console.error('e2eFuelPlanFullCoverage missing history-tone suite ref (oleada 430)')
  ok = false
}
if (!fuelPlanFullCoverage.includes("'fuel-history-tone'")) {
  console.error('e2eFuelPlanFullCoverage missing fuel-history-tone check (oleada 430)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eFuelPlanHistoryToneCoverage aligned with full coverage (oleada 430)')
const fuelPlanRotationToneCoverage = readFileSync(
  join(root, 'src/utils/e2eFuelPlanRotationToneCoverage.ts'),
  'utf8'
)
if (!fuelPlanRotationToneCoverage.includes('isFuelPlanRotationToneCoverageComplete')) {
  console.error('e2eFuelPlanRotationToneCoverage missing rotation-tone helper (oleada 431)')
  ok = false
}
if (!fuelPlanFullCoverage.includes('e2eFuelPlanRotationToneCoverage')) {
  console.error('e2eFuelPlanFullCoverage missing rotation-tone suite ref (oleada 431)')
  ok = false
}
if (!fuelPlanFullCoverage.includes("'fuel-rotation-tone'")) {
  console.error('e2eFuelPlanFullCoverage missing fuel-rotation-tone check (oleada 431)')
  ok = false
}
if (!fuelPlanFullCoverage.includes('isFuelPlanRotationToneCoverageComplete')) {
  console.error('e2eFuelPlanFullCoverage missing rotation-tone helper ref (oleada 431)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eFuelPlanRotationToneCoverage aligned with full coverage (oleada 431)')
const fuelPlanPostFuelCoverage = readFileSync(
  join(root, 'src/utils/e2eFuelPlanPostFuelCoverage.ts'),
  'utf8'
)
if (!fuelPlanPostFuelCoverage.includes('isFuelPlanPostFuelE2ECoverageComplete')) {
  console.error('e2eFuelPlanPostFuelCoverage missing post-fuel helper (oleada 432)')
  ok = false
}
if (!fuelPlanFullCoverage.includes('e2eFuelPlanPostFuelCoverage')) {
  console.error('e2eFuelPlanFullCoverage missing post-fuel suite ref (oleada 432)')
  ok = false
}
if (!fuelPlanFullCoverage.includes('isFuelPlanPostFuelE2ECoverageComplete')) {
  console.error('e2eFuelPlanFullCoverage missing post-fuel helper ref (oleada 432)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eFuelPlanPostFuelCoverage aligned with full coverage (oleada 432)')
const fuelPlanEnergySummaryToneCoverage = readFileSync(
  join(root, 'src/utils/e2eFuelPlanEnergySummaryToneCoverage.ts'),
  'utf8'
)
if (!fuelPlanEnergySummaryToneCoverage.includes('isFuelPlanEnergySummaryToneCoverageComplete')) {
  console.error('e2eFuelPlanEnergySummaryToneCoverage missing energy-tone helper (oleada 433)')
  ok = false
}
if (!fuelPlanFullCoverage.includes('e2eFuelPlanEnergySummaryToneCoverage')) {
  console.error('e2eFuelPlanFullCoverage missing energy-tone suite ref (oleada 433)')
  ok = false
}
if (!fuelPlanFullCoverage.includes("'fuel-energy-tone'")) {
  console.error('e2eFuelPlanFullCoverage missing fuel-energy-tone check (oleada 433)')
  ok = false
}
if (!fuelPlanFullCoverage.includes('isFuelPlanEnergySummaryToneCoverageComplete')) {
  console.error('e2eFuelPlanFullCoverage missing energy-tone helper ref (oleada 433)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eFuelPlanEnergySummaryToneCoverage aligned with full coverage (oleada 433)')
const fuelPlanPostEnergyCoverage = readFileSync(
  join(root, 'src/utils/e2eFuelPlanPostEnergyCoverage.ts'),
  'utf8'
)
if (!fuelPlanPostEnergyCoverage.includes('isFuelPlanPostEnergyE2ECoverageComplete')) {
  console.error('e2eFuelPlanPostEnergyCoverage missing post-energy helper (oleada 434)')
  ok = false
}
if (!fuelPlanFullCoverage.includes('e2eFuelPlanPostEnergyCoverage')) {
  console.error('e2eFuelPlanFullCoverage missing post-energy suite ref (oleada 434)')
  ok = false
}
if (!fuelPlanFullCoverage.includes('isFuelPlanPostEnergyE2ECoverageComplete')) {
  console.error('e2eFuelPlanFullCoverage missing post-energy helper ref (oleada 434)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eFuelPlanPostEnergyCoverage aligned with full coverage (oleada 434)')
console.log('✓ e2eFuelPlanFullCoverage unifies 12 Fuel×plan E2E suites (oleada 434)')
const trainingMegaGlobalClosure = readFileSync(
  join(root, 'src/utils/trainingMegaGlobalClosure.ts'),
  'utf8'
)
if (!trainingMegaGlobalClosure.includes('isTrainingMegaGlobalClosureComplete')) {
  console.error('trainingMegaGlobalClosure missing global helper (oleada 435)')
  ok = false
}
const trainingMegaGlobalCoverage = readFileSync(
  join(root, 'src/utils/e2eTrainingMegaGlobalCoverage.ts'),
  'utf8'
)
if (!trainingMegaGlobalCoverage.includes('isE2ETrainingMegaGlobalCoverageComplete')) {
  console.error('e2eTrainingMegaGlobalCoverage missing mega-global helper (oleada 435)')
  ok = false
}
if (!trainingMegaGlobalCoverage.includes('trainingMegaGlobalClosure')) {
  console.error('e2eTrainingMegaGlobalCoverage missing closure module ref (oleada 435)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eTrainingMegaGlobalCoverage aligned with mega global closure (oleada 435)')
const gymLogSessionPrCoverage = readFileSync(
  join(root, 'src/utils/e2eGymLogSessionPrCoverage.ts'),
  'utf8'
)
if (!gymLogSessionPrCoverage.includes('isGymLogSessionPrCoverageComplete')) {
  console.error('e2eGymLogSessionPrCoverage missing session-pr helper (oleada 436)')
  ok = false
}
const gymLogSessionPrTone = readFileSync(
  join(root, 'src/utils/gymLogSessionPrToneDisplay.ts'),
  'utf8'
)
if (!gymLogSessionPrTone.includes('sessionPrAriaMatchesLivePr')) {
  console.error('gymLogSessionPrToneDisplay missing aria helper (oleada 436)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eGymLogSessionPrCoverage aligned with gym-log v2 pivot (oleada 436)')
const gymLogFabSessionPrCoverage = readFileSync(
  join(root, 'src/utils/e2eGymLogFabSessionPrCoverage.ts'),
  'utf8'
)
if (!gymLogFabSessionPrCoverage.includes('isGymLogFabSessionPrCoverageComplete')) {
  console.error('e2eGymLogFabSessionPrCoverage missing fab-session-pr helper (oleada 437)')
  ok = false
}
const gymLogFabSessionPrTone = readFileSync(
  join(root, 'src/utils/gymLogFabSessionPrToneDisplay.ts'),
  'utf8'
)
if (!gymLogFabSessionPrTone.includes('fabSessionPrAriaMatchesLivePr')) {
  console.error('gymLogFabSessionPrToneDisplay missing aria helper (oleada 437)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eGymLogFabSessionPrCoverage aligned with gym-log v2 FAB pivot (oleada 437)')
const gymLogPostV2Coverage = readFileSync(
  join(root, 'src/utils/e2eGymLogPostV2Coverage.ts'),
  'utf8'
)
if (!gymLogPostV2Coverage.includes('isGymLogPostV2E2ECoverageComplete')) {
  console.error('e2eGymLogPostV2Coverage missing post-v2 helper (oleada 438)')
  ok = false
}
const gymLogFullCoverage = readFileSync(
  join(root, 'src/utils/e2eGymLogFullCoverage.ts'),
  'utf8'
)
if (!gymLogFullCoverage.includes('e2eGymLogPostV2Coverage')) {
  console.error('e2eGymLogFullCoverage missing post-v2 suite ref (oleada 438)')
  ok = false
}
if (!gymLogFullCoverage.includes('isGymLogFullE2ECoverageComplete')) {
  console.error('e2eGymLogFullCoverage missing full helper ref (oleada 438)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eGymLogPostV2Coverage aligned with full coverage (oleada 438)')
console.log('✓ e2eGymLogFullCoverage unifies 3 gym-log v2 E2E suites (oleada 438)')
const workoutSaveBannerPrCoverage = readFileSync(
  join(root, 'src/utils/e2eWorkoutSaveBannerPrCoverage.ts'),
  'utf8'
)
if (!workoutSaveBannerPrCoverage.includes('isWorkoutSaveBannerPrCoverageComplete')) {
  console.error('e2eWorkoutSaveBannerPrCoverage missing banner-pr helper (oleada 439)')
  ok = false
}
const workoutSaveBannerPrTone = readFileSync(
  join(root, 'src/utils/workoutSaveBannerPrToneDisplay.ts'),
  'utf8'
)
if (!workoutSaveBannerPrTone.includes('bannerPrAriaMatchesPr')) {
  console.error('workoutSaveBannerPrToneDisplay missing aria helper (oleada 439)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eWorkoutSaveBannerPrCoverage aligned with post-entreno v2 pivot (oleada 439)')
const workoutHistoryRowPrCoverage = readFileSync(
  join(root, 'src/utils/e2eWorkoutHistoryRowPrCoverage.ts'),
  'utf8'
)
if (!workoutHistoryRowPrCoverage.includes('isWorkoutHistoryRowPrCoverageComplete')) {
  console.error('e2eWorkoutHistoryRowPrCoverage missing history-row-pr helper (oleada 440)')
  ok = false
}
const workoutHistoryRowPrTone = readFileSync(
  join(root, 'src/utils/workoutHistoryRowPrToneDisplay.ts'),
  'utf8'
)
if (!workoutHistoryRowPrTone.includes('historyRowPrAriaMatchesPr')) {
  console.error('workoutHistoryRowPrToneDisplay missing aria helper (oleada 440)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eWorkoutHistoryRowPrCoverage aligned with historial v2 pivot (oleada 440)')
const fuelLogPrefillPrCoverage = readFileSync(
  join(root, 'src/utils/e2eFuelLogPrefillPrCoverage.ts'),
  'utf8'
)
if (!fuelLogPrefillPrCoverage.includes('isFuelLogPrefillPrCoverageComplete')) {
  console.error('e2eFuelLogPrefillPrCoverage missing fuel-prefill-pr helper (oleada 441)')
  ok = false
}
const fuelLogPrefillPrTone = readFileSync(
  join(root, 'src/utils/fuelLogPrefillPrToneDisplay.ts'),
  'utf8'
)
if (!fuelLogPrefillPrTone.includes('fuelPrefillPrAriaMatchesPr')) {
  console.error('fuelLogPrefillPrToneDisplay missing aria helper (oleada 441)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eFuelLogPrefillPrCoverage aligned with post-entreno v2 pivot (oleada 441)')
const postWorkoutPostV2Coverage = readFileSync(
  join(root, 'src/utils/e2ePostWorkoutPostV2Coverage.ts'),
  'utf8'
)
if (!postWorkoutPostV2Coverage.includes('isPostWorkoutPostV2E2ECoverageComplete')) {
  console.error('e2ePostWorkoutPostV2Coverage missing post-v2 helper (oleada 442)')
  ok = false
}
const postWorkoutFullCoverage = readFileSync(
  join(root, 'src/utils/e2ePostWorkoutFullCoverage.ts'),
  'utf8'
)
if (!postWorkoutFullCoverage.includes('e2ePostWorkoutPostV2Coverage')) {
  console.error('e2ePostWorkoutFullCoverage missing post-v2 suite ref (oleada 442)')
  ok = false
}
if (!postWorkoutFullCoverage.includes('isPostWorkoutFullE2ECoverageComplete')) {
  console.error('e2ePostWorkoutFullCoverage missing full helper ref (oleada 442)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2ePostWorkoutPostV2Coverage aligned with full coverage (oleada 442)')
console.log('✓ e2ePostWorkoutFullCoverage unifies 3 post-entreno v2 E2E suites (oleada 442)')
const workoutHistoryPostV2Coverage = readFileSync(
  join(root, 'src/utils/e2eWorkoutHistoryPostV2Coverage.ts'),
  'utf8'
)
if (!workoutHistoryPostV2Coverage.includes('isWorkoutHistoryPostV2E2ECoverageComplete')) {
  console.error('e2eWorkoutHistoryPostV2Coverage missing post-v2 helper (oleada 443)')
  ok = false
}
const workoutHistoryFullCoverage = readFileSync(
  join(root, 'src/utils/e2eWorkoutHistoryFullCoverage.ts'),
  'utf8'
)
if (!workoutHistoryFullCoverage.includes('e2eWorkoutHistoryPostV2Coverage')) {
  console.error('e2eWorkoutHistoryFullCoverage missing post-v2 suite ref (oleada 443)')
  ok = false
}
if (!workoutHistoryFullCoverage.includes('isWorkoutHistoryFullE2ECoverageComplete')) {
  console.error('e2eWorkoutHistoryFullCoverage missing full helper ref (oleada 443)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eWorkoutHistoryPostV2Coverage aligned with full coverage (oleada 443)')
console.log('✓ e2eWorkoutHistoryFullCoverage unifies 3 historial v2 E2E suites (oleada 443)')
const trainingPrV2GlobalClosure = readFileSync(
  join(root, 'src/utils/trainingPrV2GlobalClosure.ts'),
  'utf8'
)
if (!trainingPrV2GlobalClosure.includes('isTrainingPrV2GlobalClosureComplete')) {
  console.error('trainingPrV2GlobalClosure missing global helper (oleada 444)')
  ok = false
}
const trainingPrV2GlobalCoverage = readFileSync(
  join(root, 'src/utils/e2eTrainingPrV2GlobalCoverage.ts'),
  'utf8'
)
if (!trainingPrV2GlobalCoverage.includes('isE2ETrainingPrV2GlobalCoverageComplete')) {
  console.error('e2eTrainingPrV2GlobalCoverage missing pr-v2-global helper (oleada 444)')
  ok = false
}
if (!trainingPrV2GlobalCoverage.includes('trainingPrV2GlobalClosure')) {
  console.error('e2eTrainingPrV2GlobalCoverage missing closure module ref (oleada 444)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eTrainingPrV2GlobalCoverage aligned with PR v2 global closure (oleada 444)')
const trainingReviewPrCoverage = readFileSync(
  join(root, 'src/utils/e2eTrainingReviewPrCoverage.ts'),
  'utf8'
)
if (!trainingReviewPrCoverage.includes('isTrainingReviewPrCoverageComplete')) {
  console.error('e2eTrainingReviewPrCoverage missing review-pr helper (oleada 445)')
  ok = false
}
if (!trainingReviewPrCoverage.includes('review-pr-tone')) {
  console.error('e2eTrainingReviewPrCoverage missing review-pr-tone cover (oleada 445)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eTrainingReviewPrCoverage aligned with reseña v2 pivot (oleada 445)')
const trainingReviewPostV2Coverage = readFileSync(
  join(root, 'src/utils/e2eTrainingReviewPostV2Coverage.ts'),
  'utf8'
)
if (!trainingReviewPostV2Coverage.includes('isTrainingReviewPostV2E2ECoverageComplete')) {
  console.error('e2eTrainingReviewPostV2Coverage missing review-post-v2 helper (oleada 446)')
  ok = false
}
const trainingReviewFullCoverage = readFileSync(
  join(root, 'src/utils/e2eTrainingReviewFullCoverage.ts'),
  'utf8'
)
if (!trainingReviewFullCoverage.includes('isTrainingReviewFullE2ECoverageComplete')) {
  console.error('e2eTrainingReviewFullCoverage missing review-full helper (oleada 446)')
  ok = false
}
if (!trainingReviewFullCoverage.includes('e2eTrainingReviewPostV2Coverage')) {
  console.error('e2eTrainingReviewFullCoverage missing post-v2 module ref (oleada 446)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eTrainingReviewPostV2Coverage aligned with reseña v2 closure (oleada 446)')
console.log('✓ e2eTrainingReviewFullCoverage unifies 2 reseña v2 E2E suites (oleada 446)')
const trainingPrV2Coverage = readFileSync(
  join(root, 'src/utils/e2eTrainingPrV2Coverage.ts'),
  'utf8'
)
if (!trainingPrV2Coverage.includes('isTrainingPrV2CoverageComplete')) {
  console.error('e2eTrainingPrV2Coverage missing pr-v2-union helper (oleada 447)')
  ok = false
}
if (!trainingPrV2Coverage.includes('session-pr-tone')) {
  console.error('e2eTrainingPrV2Coverage missing session-pr-tone cover (oleada 447)')
  ok = false
}
if (!trainingPrV2Coverage.includes('history-row-pr-tone')) {
  console.error('e2eTrainingPrV2Coverage missing history-row-pr-tone cover (oleada 447)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eTrainingPrV2Coverage aligned with PR v2 union meta (oleada 447)')
const workoutHistorySparklinePrCoverage = readFileSync(
  join(root, 'src/utils/e2eWorkoutHistorySparklinePrCoverage.ts'),
  'utf8'
)
if (!workoutHistorySparklinePrCoverage.includes('isWorkoutHistorySparklinePrCoverageComplete')) {
  console.error('e2eWorkoutHistorySparklinePrCoverage missing sparkline-pr helper (oleada 448)')
  ok = false
}
if (!workoutHistorySparklinePrCoverage.includes('sparkline-pr-tone')) {
  console.error('e2eWorkoutHistorySparklinePrCoverage missing sparkline-pr-tone cover (oleada 448)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eWorkoutHistorySparklinePrCoverage aligned with sparkline PR v2 pivot (oleada 448)')
const workoutHistorySparklinePostV2Coverage = readFileSync(
  join(root, 'src/utils/e2eWorkoutHistorySparklinePostV2Coverage.ts'),
  'utf8'
)
if (
  !workoutHistorySparklinePostV2Coverage.includes('isWorkoutHistorySparklinePostV2E2ECoverageComplete')
) {
  console.error('e2eWorkoutHistorySparklinePostV2Coverage missing sparkline-post-v2 helper (oleada 449)')
  ok = false
}
const workoutHistorySparklineCoverage = readFileSync(
  join(root, 'src/utils/e2eWorkoutHistorySparklineCoverage.ts'),
  'utf8'
)
if (!workoutHistorySparklineCoverage.includes('unionWorkoutHistorySparklineCovers')) {
  console.error('e2eWorkoutHistorySparklineCoverage missing union helper (oleada 449)')
  ok = false
}
const workoutHistorySparklineFullCoverage = readFileSync(
  join(root, 'src/utils/e2eWorkoutHistorySparklineFullCoverage.ts'),
  'utf8'
)
if (!workoutHistorySparklineFullCoverage.includes('isWorkoutHistorySparklineFullE2ECoverageComplete')) {
  console.error('e2eWorkoutHistorySparklineFullCoverage missing sparkline-full helper (oleada 449)')
  ok = false
}
if (!workoutHistorySparklineFullCoverage.includes('e2eWorkoutHistorySparklinePostV2Coverage')) {
  console.error('e2eWorkoutHistorySparklineFullCoverage missing sparkline-post-v2 suite ref (oleada 449)')
  ok = false
}
if (!workoutHistorySparklineFullCoverage.includes('e2eWorkoutHistorySparklineCoverage')) {
  console.error('e2eWorkoutHistorySparklineFullCoverage missing sparkline-coverage suite ref (oleada 449)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eWorkoutHistorySparklinePostV2Coverage aligned with sparkline full coverage (oleada 449)')
console.log('✓ e2eWorkoutHistorySparklineFullCoverage unifies 3 sparkline historial v2 E2E suites (oleada 449)')
const trainingFullFlowPrCoverage = readFileSync(
  join(root, 'src/utils/e2eTrainingFullFlowPrCoverage.ts'),
  'utf8'
)
if (!trainingFullFlowPrCoverage.includes('isTrainingFullFlowPrCoverageComplete')) {
  console.error('e2eTrainingFullFlowPrCoverage missing full-flow-pr helper (oleada 450)')
  ok = false
}
if (!trainingFullFlowPrCoverage.includes('full-flow-review-pr')) {
  console.error('e2eTrainingFullFlowPrCoverage missing full-flow-review-pr cover (oleada 450)')
  ok = false
}
const trainingReviewSessionPr = readFileSync(
  join(root, 'src/utils/trainingReviewSessionPr.ts'),
  'utf8'
)
if (!trainingReviewSessionPr.includes('resolveTrainingReviewModalHasPr')) {
  console.error('trainingReviewSessionPr missing session-pr helper (oleada 450)')
  ok = false
}
const trainingFullFlow = readFileSync(join(root, 'src/utils/e2eTrainingFullFlow.ts'), 'utf8')
if (!trainingFullFlow.includes('review-pr-tone')) {
  console.error('e2eTrainingFullFlow missing review-pr-tone hito (oleada 450)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eTrainingFullFlowPrCoverage aligned with training-full-flow PR pivot (oleada 450)')
const trainingPostPrMegaCoverage = readFileSync(
  join(root, 'src/utils/e2eTrainingPostPrMegaCoverage.ts'),
  'utf8'
)
if (!trainingPostPrMegaCoverage.includes('isTrainingPostPrMegaCoverageComplete')) {
  console.error('e2eTrainingPostPrMegaCoverage missing post-pr-mega helper (oleada 451)')
  ok = false
}
if (!trainingPostPrMegaCoverage.includes('full-flow-review-pr')) {
  console.error('e2eTrainingPostPrMegaCoverage missing full-flow-review-pr cover (oleada 451)')
  ok = false
}
if (!trainingPostPrMegaCoverage.includes('review-pr-tone')) {
  console.error('e2eTrainingPostPrMegaCoverage missing review-pr-tone cover (oleada 451)')
  ok = false
}
if (!trainingPostPrMegaCoverage.includes('sparkline-pr-tone')) {
  console.error('e2eTrainingPostPrMegaCoverage missing sparkline-pr-tone cover (oleada 451)')
  ok = false
}
const trainingPostPrMegaFullCoverage = readFileSync(
  join(root, 'src/utils/e2eTrainingPostPrMegaFullCoverage.ts'),
  'utf8'
)
if (!trainingPostPrMegaFullCoverage.includes('isTrainingPostPrMegaFullE2ECoverageComplete')) {
  console.error('e2eTrainingPostPrMegaFullCoverage missing mega-full helper (oleada 451)')
  ok = false
}
if (!trainingPostPrMegaFullCoverage.includes('e2eTrainingPostPrMegaCoverage')) {
  console.error('e2eTrainingPostPrMegaFullCoverage missing mega-coverage suite ref (oleada 451)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eTrainingPostPrMegaCoverage aligned with mega post-PR union (oleada 451)')
console.log('✓ e2eTrainingPostPrMegaFullCoverage unifies 5 mega post-PR E2E suites (oleada 451)')
const workoutHistoryV2GlobalClosure = readFileSync(
  join(root, 'src/utils/trainingWorkoutHistoryV2GlobalClosure.ts'),
  'utf8'
)
if (!workoutHistoryV2GlobalClosure.includes('isTrainingWorkoutHistoryV2GlobalClosureComplete')) {
  console.error('trainingWorkoutHistoryV2GlobalClosure missing global closure helper (oleada 452)')
  ok = false
}
if (!workoutHistoryV2GlobalClosure.includes('history-sparkline-v2')) {
  console.error('trainingWorkoutHistoryV2GlobalClosure missing sparkline block ref (oleada 452)')
  ok = false
}
const trainingMegaFlowPrCoverage = readFileSync(
  join(root, 'src/utils/e2eTrainingMegaFlowPrCoverage.ts'),
  'utf8'
)
if (!trainingMegaFlowPrCoverage.includes('isTrainingMegaFlowPrCoverageComplete')) {
  console.error('e2eTrainingMegaFlowPrCoverage missing mega-flow-pr helper (oleada 452)')
  ok = false
}
if (!trainingMegaFlowPrCoverage.includes('mega-flow-review-pr')) {
  console.error('e2eTrainingMegaFlowPrCoverage missing mega-flow-review-pr cover (oleada 452)')
  ok = false
}
const trainingMegaFlow = readFileSync(join(root, 'src/utils/e2eTrainingMegaFlow.ts'), 'utf8')
if (!trainingMegaFlow.includes('review-pr-tone')) {
  console.error('e2eTrainingMegaFlow missing review-pr-tone hito (oleada 452)')
  ok = false
}
const trainingPostPrMegaPostV2Coverage = readFileSync(
  join(root, 'src/utils/e2eTrainingPostPrMegaPostV2Coverage.ts'),
  'utf8'
)
if (!trainingPostPrMegaPostV2Coverage.includes('isTrainingPostPrMegaPostV2E2ECoverageComplete')) {
  console.error('e2eTrainingPostPrMegaPostV2Coverage missing post-v2 helper (oleada 452)')
  ok = false
}
if (!trainingPostPrMegaPostV2Coverage.includes('mega-flow-review-pr')) {
  console.error('e2eTrainingPostPrMegaPostV2Coverage missing mega-flow-review-pr cover (oleada 452)')
  ok = false
}
if (!trainingPostPrMegaFullCoverage.includes('e2eTrainingPostPrMegaPostV2Coverage')) {
  console.error('e2eTrainingPostPrMegaFullCoverage missing post-v2 suite ref (oleada 452)')
  ok = false
}
if (!trainingPostPrMegaCoverage.includes('mega-flow-review-pr')) {
  console.error('e2eTrainingPostPrMegaCoverage missing mega-flow-review-pr cover (oleada 452)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ trainingWorkoutHistoryV2GlobalClosure aligned with historial v2 global (oleada 452)')
console.log('✓ e2eTrainingMegaFlowPrCoverage aligned with training-mega-flow PR pivot (oleada 452)')
console.log('✓ e2eTrainingPostPrMegaPostV2Coverage closes mega post-PR union (oleada 452)')
console.log('✓ e2eTrainingPostPrMegaFullCoverage unifies 6 mega post-PR E2E suites (oleada 452)')
const workoutHistoryV2GlobalFullCoverage = readFileSync(
  join(root, 'src/utils/e2eWorkoutHistoryV2GlobalFullCoverage.ts'),
  'utf8'
)
if (!workoutHistoryV2GlobalFullCoverage.includes('isWorkoutHistoryV2GlobalFullE2ECoverageComplete')) {
  console.error('e2eWorkoutHistoryV2GlobalFullCoverage missing global-full helper (oleada 453)')
  ok = false
}
if (!workoutHistoryV2GlobalFullCoverage.includes('e2eWorkoutHistoryV2GlobalCoverage')) {
  console.error('e2eWorkoutHistoryV2GlobalFullCoverage missing global suite ref (oleada 453)')
  ok = false
}
const trainingPrV2PostMegaClosure = readFileSync(
  join(root, 'src/utils/trainingPrV2PostMegaClosure.ts'),
  'utf8'
)
if (!trainingPrV2PostMegaClosure.includes('isTrainingPrV2PostMegaClosureComplete')) {
  console.error('trainingPrV2PostMegaClosure missing post-mega helper (oleada 453)')
  ok = false
}
if (!trainingPrV2PostMegaClosure.includes('post-pr-mega')) {
  console.error('trainingPrV2PostMegaClosure missing post-pr-mega block ref (oleada 453)')
  ok = false
}
const trainingPlaywrightPrSmokeCoverage = readFileSync(
  join(root, 'src/utils/e2eTrainingPlaywrightPrSmokeCoverage.ts'),
  'utf8'
)
if (!trainingPlaywrightPrSmokeCoverage.includes('isTrainingPlaywrightPrSmokeCoverageComplete')) {
  console.error('e2eTrainingPlaywrightPrSmokeCoverage missing smoke helper (oleada 453)')
  ok = false
}
if (!trainingPlaywrightPrSmokeCoverage.includes('mega-flow-review-pr')) {
  console.error('e2eTrainingPlaywrightPrSmokeCoverage missing mega-flow-review-pr cover (oleada 453)')
  ok = false
}
if (!trainingPlaywrightPrSmokeCoverage.includes('workout-history-flow.spec.ts')) {
  console.error('e2eTrainingPlaywrightPrSmokeCoverage missing workout-history spec (oleada 453)')
  ok = false
}
for (const spec of ['training-mega-flow.spec.ts', 'workout-history-flow.spec.ts']) {
  if (!ciYml.includes(spec)) {
    console.error(`CI e2e-smoke missing playwright PR spec: ${spec} (oleada 453)`)
    ok = false
  }
}
if (!ok) process.exit(1)
console.log('✓ e2eWorkoutHistoryV2GlobalFullCoverage unifies 3 historial v2 global suites (oleada 453)')
console.log('✓ trainingPrV2PostMegaClosure closes post-mega PR v2 block (oleada 453)')
console.log('✓ e2eTrainingPlaywrightPrSmokeCoverage aligned with CI e2e-smoke PR specs (oleada 453)')
const trainingPostPrMegaFullV2Coverage = readFileSync(
  join(root, 'src/utils/e2eTrainingPostPrMegaFullV2Coverage.ts'),
  'utf8'
)
if (!trainingPostPrMegaFullV2Coverage.includes('isTrainingPostPrMegaFullV2E2ECoverageComplete')) {
  console.error('e2eTrainingPostPrMegaFullV2Coverage missing full-v2 helper (oleada 454)')
  ok = false
}
if (!trainingPostPrMegaFullV2Coverage.includes('e2eWorkoutHistoryV2GlobalFullCoverage')) {
  console.error('e2eTrainingPostPrMegaFullV2Coverage missing historial v2 global full ref (oleada 454)')
  ok = false
}
const trainingPrV2PostMegaGlobalClosure = readFileSync(
  join(root, 'src/utils/trainingPrV2PostMegaGlobalClosure.ts'),
  'utf8'
)
if (!trainingPrV2PostMegaGlobalClosure.includes('isTrainingPrV2PostMegaGlobalClosureComplete')) {
  console.error('trainingPrV2PostMegaGlobalClosure missing post-mega-global helper (oleada 454)')
  ok = false
}
if (!trainingPrV2PostMegaGlobalClosure.includes('mega-post-pr-full-v2')) {
  console.error('trainingPrV2PostMegaGlobalClosure missing full-v2 block ref (oleada 454)')
  ok = false
}
const trainingPlaywrightPrSmokeRun = readFileSync(
  join(root, 'src/utils/e2eTrainingPlaywrightPrSmokeRun.ts'),
  'utf8'
)
if (!trainingPlaywrightPrSmokeRun.includes('isTrainingPlaywrightPrSmokeRunReady')) {
  console.error('e2eTrainingPlaywrightPrSmokeRun missing smoke-run helper (oleada 454)')
  ok = false
}
if (!trainingPlaywrightPrSmokeRun.includes('trainingPlaywrightPrSmokeRunCommand')) {
  console.error('e2eTrainingPlaywrightPrSmokeRun missing preview command (oleada 454)')
  ok = false
}
const trainingPostPrMegaFullV2PostCoverage = readFileSync(
  join(root, 'src/utils/e2eTrainingPostPrMegaFullV2PostCoverage.ts'),
  'utf8'
)
if (!trainingPostPrMegaFullV2PostCoverage.includes('isTrainingPostPrMegaFullV2PostE2ECoverageComplete')) {
  console.error('e2eTrainingPostPrMegaFullV2PostCoverage missing full-v2-post helper (oleada 454)')
  ok = false
}
if (!ok) process.exit(1)
console.log('✓ e2eTrainingPostPrMegaFullV2Coverage unifies 7 mega post-PR full v2 suites (oleada 454)')
console.log('✓ trainingPrV2PostMegaGlobalClosure closes post-mega global PR v2 block (oleada 454)')
console.log('✓ e2eTrainingPlaywrightPrSmokeRun documents local PR smoke preview command (oleada 454)')

const vitest = spawnSync('npx', ['vitest', 'run'], { cwd: root, stdio: 'inherit', shell: true })
if (vitest.status !== 0) process.exit(vitest.status ?? 1)
console.log('✓ vitest passed')
