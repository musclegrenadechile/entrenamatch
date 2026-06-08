#!/usr/bin/env node
/** Bump version to match roadmap phase N (0.1.(160 + N - 30)) */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const phase = Number(process.argv[2])
if (!Number.isInteger(phase) || phase < 31 || phase > 120) {
  console.error('Usage: node scripts/bump-version-phase.mjs <phase>')
  process.exit(1)
}

const patch = 160 + (phase - 30)
const version = `0.1.${patch}`
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

for (const [file, replacer] of [
  ['package.json', (s) => s.replace(/"version": "[^"]+"/, `"version": "${version}"`)],
  [
    'src/constants/index.ts',
    (s) => s.replace(/export const APP_VERSION = '[^']+'/, `export const APP_VERSION = '${version}'`),
  ],
  [
    'android/app/build.gradle',
    (s) =>
      s
        .replace(/versionCode \d+/, `versionCode ${patch}`)
        .replace(/versionName "[^"]+"/, `versionName "${version}"`),
  ],
]) {
  const p = join(root, file)
  writeFileSync(p, replacer(readFileSync(p, 'utf8')))
}
console.log(`Bumped to ${version} (phase ${phase})`)
