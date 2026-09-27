import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceArg = process.argv[3]
const mode = process.argv[2]
if (!['--check', '--write'].includes(mode) || !sourceArg) {
  console.error('Usage: node scripts/sync-official-preset.mjs --check|--write <dsh-checkout>')
  process.exit(2)
}

const sourcePath = resolve(sourceArg, 'packages/bundle/web-app/presets/cordis.patch.yml')
const destinationPath = fileURLToPath(new URL('../cordis.patch.yml', import.meta.url))
const original = readFileSync(sourcePath, 'utf8')
let result = original

function replaceOnce(before, after) {
  const start = result.indexOf(before)
  if (start < 0 || result.indexOf(before, start + before.length) >= 0) {
    throw new Error(`Expected exactly one upstream anchor: ${before.slice(0, 80)}`)
  }
  result = result.slice(0, start) + after + result.slice(start + before.length)
}

replaceOnce(
  '# Agent preset cordis: one `@deepseek-ai/dsh-agent-preset` declaration inserted\n# after the web patch. Edits saved from the Web editor override this row\'s\n# `config.plugins` by id from the profile patch.\n',
  '# Plugin Workbench follows the official cordis preset composition.\n# Regenerate and review against a target DSH checkout with scripts/sync-official-preset.mjs.\n',
)
replaceOnce('    - id: preset-cordis\n', '    - id: preset-plugin-workbench\n')
replaceOnce(
  '        id: cordis\n        order: 4\n',
  '        id: plugin-workbench\n        name: Plugin Workbench\n        description: Develop and verify DeepSeek Harness plugins against the current installation.\n        order: 5\n',
)
replaceOnce(
  '                You are a coding agent powered by the {{model}} model.\n',
  '                You are a DSH plugin development agent powered by the {{model}} model.\n',
)
const bundledSkills = "                - !!js process.getBuiltinModule('node:path').join(process.getBuiltinModule('node:path').dirname(process.getBuiltinModule('node:module').createRequire(baseUrl).resolve('@deepseek-ai/dsh-agent-preset/package.json')), 'skills')\n"
replaceOnce(
  bundledSkills,
  bundledSkills + "                - !!js process.getBuiltinModule('node:path').join(process.getBuiltinModule('node:path').dirname(process.getBuiltinModule('node:module').createRequire(baseUrl).resolve('dsh-plugin-workbench/package.json')), 'skills')\n",
)

if (mode === '--write') {
  writeFileSync(destinationPath, result)
  console.log(`Wrote ${destinationPath} from ${sourcePath}; review the diff before release.`)
} else if (readFileSync(destinationPath, 'utf8') !== result) {
  console.error('Preset differs from the selected DSH checkout. Regenerate and review before shipping.')
  process.exitCode = 1
} else {
  console.log(`Preset matches selected DSH checkout: ${sourcePath}`)
}
