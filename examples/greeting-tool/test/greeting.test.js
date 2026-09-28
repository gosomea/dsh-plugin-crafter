/**
 * Standalone checks for the pure core of the example plugin.
 *
 * Run with `npm test` (no dependencies, no build step, no Host):
 * `node --test test/`.
 */

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { DEFAULT_GREETING, crafterGreetTool, greetingText } from '../greeting.js'

test('the declared default greeting is Hello', () => {
  assert.equal(DEFAULT_GREETING, 'Hello')
})

test('the default configuration returns the canonical example string', async () => {
  const tool = crafterGreetTool(DEFAULT_GREETING)
  assert.equal(await tool.execute({ name: 'Ada' }), 'Hello, Ada!')
})

test('a configured prefix replaces the default', async () => {
  const tool = crafterGreetTool('Hi')
  assert.equal(await tool.execute({ name: 'Ada' }), 'Hi, Ada!')
})

test('greetingText builds the canonical value', () => {
  assert.equal(greetingText('Hello', 'Ada'), 'Hello, Ada!')
  assert.equal(greetingText('Hello', ''), 'Hello, !')
})

test('the tool keeps the required identity and parameter contract', () => {
  const tool = crafterGreetTool(DEFAULT_GREETING)
  assert.equal(tool.name, 'crafter_greet')
  assert.equal(typeof tool.description, 'string')
  assert.ok(tool.description.length > 0)
  // `name` is the only parameter and it is required string.
  assert.deepEqual(Object.keys(tool.parameters), ['name'])
  assert.equal(tool.parameters.name.type, 'string')
  assert.equal(tool.parameters.name.required, true)
})

test('the canonical output is a string rendered as one text block', async () => {
  const tool = crafterGreetTool(DEFAULT_GREETING)
  assert.deepEqual(tool.output.schema, { type: 'string' })
  const value = await tool.execute({ name: 'Ada' })
  assert.equal(typeof value, 'string')
  assert.deepEqual(tool.output.render({ name: 'Ada' }, value), [{ type: 'text', text: 'Hello, Ada!' }])
})

test('the bundle manifest is private, exports the entry point, and declares the patch', async () => {
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(manifest.name, 'dsh-crafter-example-greeting')
  assert.equal(manifest.private, true)
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(manifest.exports['.'], './index.js')
  for (const file of ['index.js', 'greeting.js', 'cordis.patch.yml', 'test/', 'README.md']) {
    assert.ok(manifest.files.includes(file), `files must ship ${file}`)
  }
})

test('the patch mounts the tool and persona rows under the example preset', async () => {
  const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
  // Ignore the explanatory comment block; only the YAML rows are asserted.
  const rows = patch.split('\n').filter(line => !line.trimStart().startsWith('#')).join('\n')
  assert.match(rows, /^- insert:/m)
  assert.match(rows, /name: '@deepseek-ai\/dsh-agent-preset'/)
  assert.match(rows, /id: crafter-example-greeting/)
  assert.match(rows, /name: dsh-crafter-example-greeting/)
  assert.match(rows, /name: '@deepseek-ai\/dsh-persona'/)
  // The tool row ships without a config block, so the schema default applies.
  assert.doesNotMatch(rows, /greeting:/)
})
