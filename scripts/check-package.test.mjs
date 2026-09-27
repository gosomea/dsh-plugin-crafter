import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const root = new URL('../', import.meta.url)
const packageJson = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'))
const patch = readFileSync(new URL('cordis.patch.yml', root), 'utf8')

test('bundle declares an installable patch and a distinct preset', () => {
  assert.equal(packageJson.dsh.bundle.patch, './cordis.patch.yml')
  assert.match(patch, /id: preset-plugin-workbench\n\s+name: '@deepseek-ai\/dsh-agent-preset'/)
  assert.match(patch, /id: plugin-workbench/)
  assert.match(patch, /resolve\('dsh-plugin-workbench\/package\.json'\)/)
  assert.match(patch, /resolve\('@deepseek-ai\/dsh-agent-preset\/package\.json'\)/)
})

test('every declared skill exists in the distributable package', () => {
  for (const name of ['dsh-plugin-workbench', 'dsh-upstream-source', 'dsh-plugin-verification']) {
    const path = fileURLToPath(new URL(`skills/${name}/SKILL.md`, root))
    assert.ok(existsSync(path), path)
    const body = readFileSync(path, 'utf8')
    assert.match(body, new RegExp(`^---\\nname: ${name}\\n`, 'm'))
    assert.match(body, /\ndescription: .+\n/)
  }
})
