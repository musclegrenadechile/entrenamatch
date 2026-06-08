#!/usr/bin/env node
/**
 * Helper para implementar una fase del roadmap 31–70.
 * Uso: node scripts/implement-phase.mjs 31
 */

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const phaseNum = Number(process.argv[2])
if (!Number.isInteger(phaseNum) || phaseNum < 31 || phaseNum > 70) {
  console.error('Uso: node scripts/implement-phase.mjs <31-70>')
  process.exit(1)
}

const BASE_PATCH = 160
const patch = BASE_PATCH + (phaseNum - 30)
const version = `0.1.${patch}`
const versionCode = patch

const roadmapPath = join(ROOT, 'ROADMAP_40_FASES.md')
const roadmap = readFileSync(roadmapPath, 'utf8')
const rowMatch = roadmap.match(new RegExp(`\\| ${phaseNum} \\|([^|]+\\|){3}[^|]+\\|`))

console.log('')
console.log('═══════════════════════════════════════════')
console.log(`  EntrenaMatch — Fase ${phaseNum}`)
console.log('═══════════════════════════════════════════')
if (rowMatch) {
  console.log('  Roadmap:', rowMatch[0].replace(/\|/g, ' ').replace(/\s+/g, ' ').trim())
}
console.log('')
console.log('  Versión target:', version)
console.log('  versionCode:   ', versionCode)
console.log('')
console.log('  Archivos a bump:')
console.log('    - package.json')
console.log('    - src/constants/index.ts  (APP_VERSION)')
console.log('    - android/app/build.gradle')
console.log('')
console.log('  Comandos:')
console.log('    npm test')
console.log('    npm run qa:smoke')
console.log('    npm run build')
console.log('    firebase deploy --only hosting,functions,firestore:rules,firestore:indexes --project entrenamatch')
console.log('')
console.log('  DoD: ver SISTEMA_IMPLEMENTACION_FASES.md')
console.log(`  Marcar: | ${phaseNum} | ... | ✅ ${version} |`)
console.log('═══════════════════════════════════════════')
console.log('')
