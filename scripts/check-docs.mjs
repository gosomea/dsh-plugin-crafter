import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import MarkdownIt from 'markdown-it'
import { parse, stringify } from 'yaml'

const markdown = new MarkdownIt({ html: true })
const root = resolve(fileURLToPath(new URL('../', import.meta.url)))

/** Compute the Git blob identity used by DSH bilingual confirmation records. */
export function blobHash(text) {
  const bytes = Buffer.from(text)
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
}

function document(text) {
  assert.match(text, /^---\n[\s\S]*?\n---\n/, 'Missing YAML metadata')
  assert.ok(text.endsWith('\n') && !text.endsWith('\n\n'), 'Use exactly one trailing newline')
  const front = text.match(/^---\n([\s\S]*?)\n---\n/)[1]
  const metadata = parse(front)
  assert.equal(typeof metadata.description, 'string', 'Missing description')
  assert.ok(metadata.description.trim(), 'Empty description')
  for (const key of ['name', 'audience', 'tags', 'i18n']) assert.ok(!(key in metadata), `Redundant metadata: ${key}`)
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, '')
  const tokens = markdown.parse(body, {})
  for (const token of tokens) {
    if (token.type === 'inline') assert.ok(!token.children.some(child => ['softbreak', 'hardbreak'].includes(child.type)), 'Keep one physical line per paragraph')
  }
  return { metadata, body, tokens }
}

function localTarget(href, source) {
  if (/^[a-z][a-z\d+.-]*:/i.test(href)) return undefined
  const [path, fragment] = decodeURIComponent(href).split('#')
  return { file: path ? resolve(dirname(source), path) : source, fragment }
}

function anchors(text) {
  const ids = [...text.matchAll(/<a id="([^"]+)"><\/a>/g)].map(match => match[1])
  for (const token of markdown.parse(text, {})) {
    if (token.type === 'inline' && token.map && /^#{1,6} /.test(text.split('\n')[token.map[0]] ?? '')) {
      ids.push(token.content.toLowerCase().replace(/[^\p{L}\p{N}_ -]/gu, '').replace(/ /g, '-'))
    }
  }
  return new Set(ids)
}

function signature(doc, source, counterpart) {
  const result = []
  const tokens = doc.tokens
  let switcherSeen = false
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]
    if (token.type === 'heading_open') result.push(['heading', token.tag])
    if (token.type === 'fence') result.push(['code', token.info, token.content])
    if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
      let count = 0
      for (let next = index + 1; next < tokens.length && tokens[next].level > token.level; next++) {
        if (tokens[next].type === 'list_item_open' && tokens[next].level === token.level + 1) count++
      }
      result.push(['list', token.type, token.attrGet('start') ?? 1, count])
    }
    if (token.type === 'tr_open') {
      let columns = 0
      for (let next = index + 1; next < tokens.length && tokens[next].type !== 'tr_close'; next++) {
        if (['th_open', 'td_open'].includes(tokens[next].type)) columns++
      }
      result.push(['table-row', columns])
    }
    for (const child of token.children ?? []) {
      if (!['link_open', 'image'].includes(child.type)) continue
      const href = child.attrGet(child.type === 'image' ? 'src' : 'href')
      if (href === basename(counterpart) && !switcherSeen) {
        switcherSeen = true
        continue
      }
      const target = localTarget(href, source)
      if (target) {
        assert.ok(target.file === root || target.file.startsWith(`${root}/`), `Link leaves package: ${href}`)
        assert.ok(existsSync(target.file), `Broken local link: ${href}`)
        if (target.fragment && target.file.endsWith('.md')) assert.ok(anchors(target.file === source ? doc.body : readFileSync(target.file, 'utf8')).has(target.fragment), `Missing anchor: ${href}`)
        const canonical = target.file.replace(/\.zh\.md$/, '.md')
        if (canonical.endsWith('.md') && existsSync(canonical.replace(/\.md$/, '.zh.md'))) {
          const chinese = source.endsWith('.zh.md')
          if (target.file !== source) assert.equal(target.file.endsWith('.zh.md'), chinese, `Wrong link locale: ${href}`)
        }
        result.push(['link', canonical, target.fragment ?? ''])
      } else result.push(['link', href])
    }
  }
  return result
}

/** Validate external bundle documentation, not the entire upstream docs corpus. */
export function validatePair(source, enText, zhText, record, confirmed = true) {
  const zh = source.replace(/\.md$/, '.zh.md')
  assert.equal(enText.split('\n').length, zhText.split('\n').length, 'Pair line counts differ')
  const en = document(enText)
  const cn = document(zhText)
  assert.match(en.body, new RegExp(`^# .+\n\nEnglish \\| \\[中文\\]\\(${basename(zh).replaceAll('.', '\\.')}\\)`, 'm'), 'Missing English switcher')
  assert.match(cn.body, new RegExp(`^# .+\n\n\\[English\\]\\(${basename(source).replaceAll('.', '\\.')}\\) \\| 中文`, 'm'), 'Missing Chinese switcher')
  assert.deepEqual(signature(en, source, zh), signature(cn, zh, source), 'Pair structures differ')
  assert.equal(en.metadata.kind, cn.metadata.kind, 'Pair kinds differ')
  if (basename(source) === 'README.md') {
    const manifest = join(dirname(source), 'package.json')
    const expected = existsSync(manifest) && JSON.parse(readFileSync(manifest)).dsh?.bundle?.patch ? 'package-bundle' : 'package-group'
    assert.equal(en.metadata.kind, expected, 'README kind does not match package manifest')
    const summary = en.body.match(/## Summary\n\n([^]*?)\n\n## Table of Contents/)
    assert.ok(summary, 'Missing Summary or Table of Contents')
    assert.ok(summary[1].trim().split(/\s+/).length <= 100, 'English Summary exceeds 100 words')
    if (expected === 'package-bundle') {
      const h2s = en.tokens.filter(token => token.type === 'heading_open' && token.tag === 'h2').map(token => en.tokens[en.tokens.indexOf(token) + 1].content)
      assert.deepEqual(h2s.slice(-2), ['Model Experience', 'Known Limitations and Deferred Work'], 'Package ending sections differ')
      assert.match(en.body, /<a id="dev-note"><\/a>\n### Dev Note\n\n<details>/, 'Missing folded final Dev Note')
      assert.match(en.body, /## Understand the implementation\n\n<details>/, 'Missing implementation fold')
    }
  }
  if (confirmed) {
    assert.deepEqual(record, { [basename(source)]: blobHash(enText), [basename(zh)]: blobHash(zhText) }, 'Pair confirmation is stale')
  }
}

/** Discover paired user pages; invocation skills and agent instructions stay separate. */
export function sources() {
  const docs = readdirSync(join(root, 'docs')).filter(file => file.endsWith('.md') && !file.endsWith('.zh.md') && file !== 'AGENTS.md').map(file => `docs/${file}`)
  return ['README.md', 'examples/README.md', ...['greeting-tool', 'host-status', 'release-checklist'].map(name => `examples/${name}/README.md`), ...docs].sort()
}

/** Validate selected pairs, recording reviewed blobs only in explicit write mode. */
export function checkDocuments(selected = sources(), write = false) {
  for (const file of selected) {
    assert.ok(sources().includes(file), `Not a paired user page: ${file}`)
    const source = join(root, file)
    const zh = source.replace(/\.md$/, '.zh.md')
    const sidecar = source.replace(/\.md$/, '.i18n.yaml')
    const enText = readFileSync(source, 'utf8')
    const zhText = readFileSync(zh, 'utf8')
    if (write) {
      validatePair(source, enText, zhText, {}, false)
      for (const path of [source, zh]) {
        const hash = execFileSync('git', ['hash-object', '-w', path], { cwd: root, encoding: 'utf8' }).trim()
        execFileSync('git', ['update-ref', `refs/dsh/translation-pairing/snapshots/${hash}`, hash], { cwd: root })
      }
      writeFileSync(sidecar, stringify({ [basename(source)]: blobHash(enText), [basename(zh)]: blobHash(zhText) }))
    }
    validatePair(source, enText, zhText, parse(readFileSync(sidecar, 'utf8')))
  }
  return selected.length
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const write = args[0] === '--write'
  assert.ok(!write || args.length > 1, 'Name the reviewed pairs after --write')
  const selected = write ? args.slice(1) : args.length ? args : sources()
  console.log(`Documentation pairs checked: ${checkDocuments(selected, write)}`)
}
