import { gzipSync } from 'node:zlib'
import { access, readFile, stat } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { filesUnder } from './lib/files.mjs'

const root = resolve(import.meta.dirname, '..')
const outputRoot = join(root, '.canofold/dist')
const budgets = {
  'assets/canofold.css': 24 * 1024,
  'assets/canofold-search.js': 4 * 1024,
  'assets/canofold-plugins/kroki.js': 3 * 1024,
  'assets/canofold-plugins/mermaid.js': 6 * 1024,
  'assets/canofold-plugins/plantuml.js': 3 * 1024,
  'assets/canofold-plugins/diagrams.css': 4 * 1024,
  'assets/canofold-plugins/mermaid/mermaid.esm.min.mjs': 16 * 1024,
  'pagefind/pagefind.js': 16 * 1024,
  'pagefind/pagefind-worker.js': 20 * 1024
}
const entryBudgets = {
  'assets/canofold-demos/markdown.js': 8 * 1024,
  'assets/canofold-demos/index.js': 80 * 1024
}
const optionalPluginBudgets = new Set(
  Object.keys(budgets).filter((relativePath) => relativePath.startsWith('assets/canofold-plugins/'))
)
const pagefindTotalBudget = 4 * 1024 * 1024
const pluginRuntimeBudget = 4 * 1024 * 1024
const failures = []
const rows = []

function outputRelativePath(path) {
  return relative(outputRoot, path).split(sep).join('/')
}

async function staticJavaScriptFiles(entryPath) {
  const visited = new Set()

  async function visit(path) {
    const absolutePath = resolve(outputRoot, path)
    const relativePath = outputRelativePath(absolutePath)
    if (relativePath === '..' || relativePath.startsWith('../')) {
      throw new Error(`Static entry import escapes the generated site: ${path}`)
    }
    if (visited.has(relativePath)) return
    visited.add(relativePath)
    const source = await readFile(absolutePath, 'utf8')
    const importPattern = /\b(?:from|import)\s*["'](\.[^"']+)["']/g
    for (const match of source.matchAll(importPattern)) {
      await visit(outputRelativePath(resolve(dirname(absolutePath), match[1])))
    }
  }

  await visit(entryPath)
  return [...visited]
}

for (const [relativePath, budget] of Object.entries(budgets)) {
  let source
  try {
    source = await readFile(join(outputRoot, relativePath))
  } catch (error) {
    if (error?.code === 'ENOENT' && optionalPluginBudgets.has(relativePath)) continue
    throw error
  }
  const gzipBytes = gzipSync(source).byteLength
  rows.push({ file: relativePath, rawBytes: source.byteLength, gzipBytes, budget })
  if (gzipBytes > budget) failures.push(`${relativePath}: ${gzipBytes} gzip bytes exceeds ${budget}`)
}

for (const [entryPath, budget] of Object.entries(entryBudgets)) {
  const files = await staticJavaScriptFiles(entryPath)
  const sources = await Promise.all(files.map((path) => readFile(join(outputRoot, path))))
  const rawBytes = sources.reduce((total, source) => total + source.byteLength, 0)
  const gzipBytes = sources.reduce((total, source) => total + gzipSync(source).byteLength, 0)
  rows.push({ file: `${entryPath} (static graph)`, rawBytes, gzipBytes, budget })
  if (gzipBytes > budget) {
    failures.push(`${entryPath} static graph: ${gzipBytes} gzip bytes exceeds ${budget}`)
  }
}

const pagefindRoot = join(outputRoot, 'pagefind')
const pagefindFiles = await filesUnder(pagefindRoot)
const pagefindBytes = (await Promise.all(pagefindFiles.map(async (path) => (await stat(path)).size))).reduce(
  (total, bytes) => total + bytes,
  0
)
if (pagefindBytes > pagefindTotalBudget) {
  failures.push(`pagefind/: ${pagefindBytes} bytes exceeds ${pagefindTotalBudget}`)
}

const pluginRoot = join(outputRoot, 'assets/canofold-plugins')
const pluginFiles = await filesUnder(pluginRoot)
const pluginBytes = (await Promise.all(pluginFiles.map(async (path) => (await stat(path)).size))).reduce(
  (total, bytes) => total + bytes,
  0
)
if (pluginBytes > pluginRuntimeBudget) {
  failures.push(`assets/canofold-plugins/: ${pluginBytes} bytes exceeds ${pluginRuntimeBudget}`)
}
for (const path of pluginFiles) {
  if (path.endsWith('.map')) failures.push(`${path}: source maps must not be published to the generated site`)
}
for (const unused of [
  'pagefind-ui.js',
  'pagefind-ui.css',
  'pagefind-modular-ui.js',
  'pagefind-component-ui.js',
  'pagefind-component-ui.css',
  'pagefind-highlight.js'
]) {
  try {
    await access(join(pagefindRoot, unused))
    failures.push(`pagefind/${unused}: unused UI artifact must not be published`)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}

const aiManifest = JSON.parse(await readFile(join(outputRoot, 'ai/manifest.json'), 'utf8'))
for (const partition of aiManifest.partitions ?? []) {
  for (const shard of partition.shards ?? []) {
    if (shard.bytes > aiManifest.budgets.chunkSizeBytes) {
      failures.push(`${shard.path}: ${shard.bytes} bytes exceeds AI chunk budget`)
    }
  }
}

console.table(
  rows.map((row) => ({
    file: row.file,
    rawKB: (row.rawBytes / 1024).toFixed(2),
    gzipKB: (row.gzipBytes / 1024).toFixed(2),
    budgetKB: (row.budget / 1024).toFixed(2)
  }))
)
console.log(
  `Pagefind total: ${(pagefindBytes / 1024 / 1024).toFixed(2)} MiB / ${(pagefindTotalBudget / 1024 / 1024).toFixed(2)} MiB`
)
console.log(
  `Plugin runtime total: ${(pluginBytes / 1024 / 1024).toFixed(2)} MiB / ${(pluginRuntimeBudget / 1024 / 1024).toFixed(2)} MiB`
)

if (failures.length) {
  console.error('\nSite artifact budget failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exitCode = 1
}
