import fs from 'fs'

const file = 'src/components/explore/ExploreLivePanel.tsx'
const text = fs.readFileSync(file, 'utf8')
const destructured = new Set(
  [...text.matchAll(/const\s*\{([^}]+)\}\s*=\s*props/s)][0][1]
    .split(',')
    .map((s) => s.trim().split(':')[0].trim())
)
const body = text.slice(text.indexOf('return ('))
const used = new Set()
for (const m of body.matchAll(/\b([a-z][a-zA-Z0-9]*)\b/g)) used.add(m[1])
const skip = new Set([
  'div', 'span', 'button', 'input', 'select', 'option', 'img', 'label', 'motion', 'async', 'await',
  'try', 'catch', 'if', 'else', 'return', 'const', 'let', 'new', 'typeof', 'null', 'true', 'false',
  'prev', 'next', 'e', 'i', 'k', 'fn', 'pid', 'id', 'lat', 'lng', 'c', 'p', 'pp', 'x', 'u', 'user',
  'a', 'b', 'err', 'file', 'blob', 'byte', 'photo', 'payload', 'partnerData', 'minimal', 'name',
  'type', 'address', 'logoUrl', 'data', 'term', 'child', 'container', 'ref', 'doc', 'snap', 'list',
])
const missing = [...used].filter((id) => !destructured.has(id) && !skip.has(id)).sort()
console.log('Missing bindings:', missing.join(', '))
