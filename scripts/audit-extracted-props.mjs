/**
 * Find identifiers used in extracted components but missing from destructuring.
 */
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const reserved = new Set([
  'true', 'false', 'null', 'undefined', 'return', 'if', 'else', 'const', 'let', 'var',
  'function', 'async', 'await', 'import', 'export', 'from', 'type', 'interface',
  'new', 'typeof', 'instanceof', 'in', 'of', 'for', 'while', 'do', 'switch', 'case',
  'break', 'continue', 'try', 'catch', 'finally', 'throw', 'default', 'class',
  'extends', 'super', 'this', 'void', 'delete', 'yield', 'any', 'string', 'number',
  'boolean', 'object', 'never', 'unknown', 'as', 'key', 'div', 'span', 'button',
  'input', 'img', 'label', 'style', 'className', 'onClick', 'onChange', 'onKeyDown',
  'disabled', 'placeholder', 'type', 'value', 'title', 'maxLength', 'autoFocus',
  'initial', 'animate', 'transition', 'whileHover', 'whileTap', 'exit', 'layout',
  'key', 'ref', 'src', 'alt', 'href', 'target', 'rel', 'id', 'name', 'htmlFor',
  'rows', 'cols', 'step', 'min', 'max', 'accept', 'hidden', 'readOnly', 'autoComplete',
  'role', 'aria', 'tabIndex', 'data', 'Date', 'Math', 'JSON', 'Object', 'Array',
  'String', 'Number', 'Boolean', 'Promise', 'Set', 'Map', 'Error', 'console',
  'window', 'document', 'URL', 'Blob', 'File', 'atob', 'confirm', 'setTimeout',
  'setInterval', 'clearTimeout', 'parseFloat', 'parseInt', 'isNaN', 'encodeURIComponent',
  'decodeURIComponent', 'Intl', 'navigator', 'localStorage', 'sessionStorage',
  'fetch', 'alert', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame',
  'Event', 'CustomEvent', 'FormData', 'Headers', 'Response', 'Request', 'AbortController',
  'TextEncoder', 'TextDecoder', 'Uint8Array', 'ArrayBuffer', 'DataView',
])

function analyze(file) {
  const text = fs.readFileSync(file, 'utf8')
  const destructureMatch = text.match(/const\s*\{([^}]+)\}\s*=\s*props/s)
  if (!destructureMatch) return { file, destructured: [], missing: [] }
  const destructured = destructureMatch[1]
    .split(',')
    .map((s) => s.trim().split(':')[0].trim())
    .filter(Boolean)

  const bodyStart = text.indexOf('return (')
  const body = text.slice(bodyStart)
  const ids = new Set()
  for (const m of body.matchAll(/\b([A-Za-z_$][A-Za-z0-9_$]*)\b/g)) {
    const id = m[1]
    if (!reserved.has(id) && id[0] === id[0].toLowerCase()) ids.add(id)
  }

  const imports = new Set()
  for (const m of text.matchAll(/^import\s+(?:\{([^}]+)\}|(\w+))/gm)) {
    if (m[1]) m[1].split(',').forEach((p) => imports.add(p.trim().split(/\s+as\s+/)[0].trim()))
    if (m[2]) imports.add(m[2])
  }

  const destructuredSet = new Set(destructured)
  const locals = new Set()
  for (const m of body.matchAll(/\b(?:const|let|var)\s+(\w+)/g)) locals.add(m[1])
  for (const m of body.matchAll(/\(\s*(?:\w+\s*,\s*)*(\w+)\s*\)\s*=>/g)) locals.add(m[1])
  for (const m of body.matchAll(/\(\s*(\w+)\s*,/g)) locals.add(m[1])
  for (const m of body.matchAll(/\(\s*(\w+)\s*\)/g)) locals.add(m[1])
  for (const m of body.matchAll(/\.map\(\s*\(?\s*(\w+)/g)) locals.add(m[1])
  for (const m of body.matchAll(/\.filter\(\s*\(?\s*(\w+)/g)) locals.add(m[1])
  for (const m of body.matchAll(/\.sort\(\s*\(?\s*(\w+)/g)) locals.add(m[1])
  for (const m of body.matchAll(/\.find\(\s*\(?\s*(\w+)/g)) locals.add(m[1])
  for (const m of body.matchAll(/\.some\(\s*\(?\s*(\w+)/g)) locals.add(m[1])
  for (const m of body.matchAll(/\.forEach\(\s*\(?\s*(\w+)/g)) locals.add(m[1])
  for (const m of body.matchAll(/\.reduce\(\s*\(?\s*(\w+)/g)) locals.add(m[1])

  const missing = [...ids].filter(
    (id) => !destructuredSet.has(id) && !imports.has(id) && !locals.has(id)
  )
  return { file, missing: missing.sort() }
}

for (const f of [
  'src/components/home/HomeTab.tsx',
  'src/components/explore/ExploreLivePanel.tsx',
]) {
  const r = analyze(path.join(root, f))
  console.log('\n===', f, '===')
  console.log('Missing from props:', r.missing.join(', ') || '(none)')
}
