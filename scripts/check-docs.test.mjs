import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { parse } from 'yaml'
import { checkDocuments, validatePair } from './check-docs.mjs'

const source = fileURLToPath(new URL('../README.md', import.meta.url))
const en = readFileSync(source, 'utf8')
const zh = readFileSync(source.replace('.md', '.zh.md'), 'utf8')
const record = parse(readFileSync(source.replace('.md', '.i18n.yaml'), 'utf8'))

test('the current documentation corpus passes its publication checks', () => {
  assert.ok(checkDocuments() > 0)
})

test('an unconfirmed edit cannot pass pair validation', () => {
  assert.throws(() => validatePair(source, en.replace('Develop a DSH plugin', 'Build a DSH plugin'), zh, record), /confirmation is stale/)
})

test('a bundle cannot be documented as a library', () => {
  assert.throws(() => validatePair(source, en.replace('package-bundle', 'package-library'), zh.replace('package-bundle', 'package-library'), {}, false), /kind does not match/)
})

test('a broken reader navigation link is rejected', () => {
  assert.throws(() => validatePair(source, en.replace('docs/compatibility.md', 'docs/missing.md'), zh, {}, false), /Broken local link/)
})

test('an untranslated code change is rejected', () => {
  assert.throws(() => validatePair(source, en, zh.replace('--port 3187', '--port 9999'), {}, false), /structures differ/)
})

test('locale links cannot send Chinese readers to the English counterpart', () => {
  assert.throws(() => validatePair(source, en, zh.replace('docs/compatibility.zh.md', 'docs/compatibility.md'), {}, false), /Wrong link locale/)
})

test('an overlong package Summary is rejected', () => {
  const enlarged = en.replace(/(## Summary\n\n)[^]*?(\n\n## Table of Contents)/, `$1${'word '.repeat(101).trim()}$2`)
  assert.throws(() => validatePair(source, enlarged, zh, {}, false), /Summary exceeds/)
})

test('physical line drift is rejected', () => {
  assert.throws(() => validatePair(source, `${en}\n`, zh, {}, false), /line counts differ/)
})

test('wrapped prose is rejected even if both sides have matching line counts', () => {
  const wrappedEn = en.replace('Develop a DSH plugin while', 'Develop a DSH plugin\nwhile')
  const wrappedZh = zh.replace('开发 DSH 插件时，', '开发 DSH 插件时，\n')
  assert.throws(() => validatePair(source, wrappedEn, wrappedZh, {}, false), /physical line per paragraph/)
})

test('an empty retrieval description is rejected', () => {
  assert.throws(() => validatePair(source, en.replace(/^description: .+$/m, 'description: ""'), zh, {}, false), /Empty description/)
})

test('a missing Chinese navigation anchor is rejected', () => {
  assert.throws(() => validatePair(source, en, zh.replace('<a id="use-this-package"></a>', '<!-- anchor removed -->'), {}, false), /Missing anchor/)
})

test('implementation details must remain folded in the bundle README', () => {
  assert.throws(() => validatePair(source, en.replace('## Understand the implementation\n\n<details>', '## Understand the implementation\n\n<!-- unfolded -->'), zh, {}, false), /implementation fold/)
})
