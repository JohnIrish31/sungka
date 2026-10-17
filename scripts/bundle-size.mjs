import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'

const BUDGET_KB = { '.js': 70, '.css': 8 }
const root = fileURLToPath(new URL('../dist/assets', import.meta.url))

const totals = { '.js': 0, '.css': 0 }

for (const name of readdirSync(root)) {
  const extension = extname(name)
  if (!(extension in totals)) continue
  const file = join(root, name)
  const raw = statSync(file).size
  const gzipped = gzipSync(readFileSync(file)).length
  totals[extension] += gzipped
  console.log(`${name.padEnd(34)} ${(raw / 1024).toFixed(1).padStart(7)} KB raw  ${(gzipped / 1024).toFixed(1).padStart(6)} KB gzip`)
}

let failed = false
for (const [extension, limit] of Object.entries(BUDGET_KB)) {
  const used = totals[extension] / 1024
  const ok = used <= limit
  failed ||= !ok
  console.log(`${extension} total: ${used.toFixed(1)} KB gzip (budget ${limit} KB) ${ok ? 'OK' : 'OVER BUDGET'}`)
}

process.exit(failed ? 1 : 0)
