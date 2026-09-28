import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, openSync, readFileSync, readdirSync, realpathSync, writeFileSync, closeSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'
import { zstdDecompressSync } from 'node:zlib'

const root = realpathSync(fileURLToPath(new URL('../', import.meta.url)))
const args = process.argv.slice(2)
function option(name, fallback) {
  const i = args.indexOf(name)
  return i < 0 ? fallback : args[i + 1]
}
if (!option('--dsh-source')) throw new Error('Usage: node scripts/smoke-examples.mjs --dsh-source <checkout> [--environment <registered-id>] [--port 3187]')
const source = realpathSync(resolve(option('--dsh-source')))
const port = Number(option('--port', '3187'))
assert.ok(Number.isInteger(port) && port > 0 && port < 65536, 'Invalid test port')
const registryScript = join(root, 'skills/dsh-plugin-verification/scripts/environments.py')
function registry(...argv) {
  return JSON.parse(execFileSync('python3', [registryScript, ...argv], { encoding: 'utf8' }))
}
const idArg = option('--environment')
const existing = idArg ? registry('show', idArg) : registry('list', '--project', root).find(r => r.preferred && r.state !== 'retired')
let deployment
if (existing) {
  deployment = registry('show', existing.id)
  assert.equal(deployment.project, root, 'Deployment belongs to another project')
  assert.equal(realpathSync(deployment.source), source, 'Deployment uses another DSH checkout')
  const status = registry('check', deployment.id)
  assert.ok(['not-running', 'unrecorded'].includes(status.process), 'Existing Host must be idle and stopped before this runner changes its profile')
} else {
  const home = mkdtempSync(join(tmpdir(), 'dsh-crafter-examples-'))
  deployment = registry('register', `crafter-examples-${Date.now()}`, '--project', root,
    '--home', home, '--source', source, '--plugin', root, '--profile', 'crafter-examples',
    '--purpose', 'Packed example installation and real Host behavior', '--preferred')
}
const home = realpathSync(deployment.home)
const profile = deployment.profile
const dailyHome = resolve(process.env.HOME, '.dsh')
assert.notEqual(home, existsSync(dailyHome) ? realpathSync(dailyHome) : dailyHome, 'Refusing the daily default DSH home')
const artifacts = join(home, 'crafter-smoke', String(Date.now()))
mkdirSync(artifacts, { recursive: true, mode: 0o700 })
const previousCase = deployment.cases?.find(c => c.id === 'example-greeting' && existsSync(c.workspace) && !realpathSync(c.workspace).startsWith(`${home}/`))
const workspace = previousCase?.workspace ?? realpathSync(mkdtempSync(join(tmpdir(), 'dsh-crafter-case-')))
// Binding a probe first catches busy ports without touching a running Host.
const portProbe = createServer()
await new Promise((done, reject) => { portProbe.once('error', reject); portProbe.listen(port, '127.0.0.1', done) })
await new Promise(done => portProbe.close(done))
const env = { ...process.env, DSH_HOME: home }
const cli = ['--import', 'tsx/esm', 'apps/cli/src/bin.ts']
function dsh(...argv) {
  return execFileSync(process.execPath, [...cli, ...argv], { cwd: source, env, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 })
}
function pack(directory) {
  const info = JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', artifacts], { cwd: directory, encoding: 'utf8' }))[0]
  for (const file of info.files) assert.ok(!/(node_modules|\.credentials|session\.v\d|__pycache__|\.pyc$)/.test(file.path), file.path)
  return { ...info, tarball: join(artifacts, info.filename) }
}
const examples = ['greeting-tool', 'host-status', 'release-checklist']
const packages = [pack(root), ...examples.map(name => pack(join(root, 'examples', name)))]
const profileManifest = join(home, 'profiles', profile, 'package.json')
if (!existsSync(profileManifest)) dsh('--profile', profile, '--from-default-profile', 'web', '--dump-config')
// A test-only adapter exercises the real Agent-scoped tool pipeline without a provider key.
const probe = join(artifacts, 'probe')
mkdirSync(probe)
writeFileSync(join(probe, 'package.json'), JSON.stringify({ name: 'dsh-crafter-smoke-probe', version: '0.0.0', private: true, type: 'module', exports: { '.': './index.js' }, dsh: { bundle: { patch: './cordis.patch.yml' } } }))
writeFileSync(join(probe, 'cordis.patch.yml'), '- insert:\n    - id: crafter-smoke-probe\n      name: dsh-crafter-smoke-probe\n')
writeFileSync(join(probe, 'index.js'), `
export const inject = ['webServer', 'connection', 'agents', 'tools']
export function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({ kind: 'exact', path: '/crafter-smoke/greet', async handler(req, res) {
    const rejection = ctx.connection.requestRejection(req)
    if (rejection !== undefined) { res.statusCode = rejection; res.end(); return }
    const params = new URL(req.url, 'http://localhost').searchParams
    const agent = ctx.agents.get(params.get('sessionId'))
    if (!agent) { res.statusCode = 404; res.end(); return }
    const argumentsValue = params.has('name') ? { name: params.get('name') } : {}
    const result = await ctx.tools.execute({ callId: 'crafter-smoke-' + Date.now(), name: 'crafter_greet', arguments: argumentsValue, agent, signal: new AbortController().signal })
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ result }))
  } }))
}
`)
let child
const log = join(artifacts, 'host.log')
const report = { targetVersion: JSON.parse(readFileSync(join(source, 'packages/bundle/web-app/package.json'))).version,
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: source, encoding: 'utf8' }).trim(),
  home, profile, workspace, packages: packages.map(p => ({ name: p.name, integrity: p.integrity, files: p.entryCount })), checks: [] }
function verifyWorkspace(sessionId) {
  const sessions = join(home, 'sessions')
  const directory = readdirSync(sessions).map(slug => join(sessions, slug, sessionId)).find(existsSync)
  assert.ok(directory, 'Session must be persisted in the isolated home')
  const latest = readdirSync(directory).filter(f => /^session\.v\d+\.jsonl\.zstd$/.test(f)).sort((a, b) => Number(b.match(/\.v(\d+)/)[1]) - Number(a.match(/\.v(\d+)/)[1]))[0]
  assert.ok(latest, 'Persisted Session log is missing')
  const header = JSON.parse(zstdDecompressSync(readFileSync(join(directory, latest))).toString('utf8').split('\n')[0])
  assert.equal(realpathSync(header.cwd), realpathSync(workspace), 'Persisted Session cwd must match the separate test workspace')
}

try {
  for (const pkg of [...packages, { name: 'dsh-crafter-smoke-probe', tarball: `link:${probe}` }]) {
    const manifest = JSON.parse(readFileSync(profileManifest))
    if (manifest.dependencies?.[pkg.name]) dsh('plugin', '--profile', profile, 'remove', pkg.name)
    dsh('plugin', '--profile', profile, 'add', pkg.tarball)
  }
  const config = dsh('--profile', profile, '--dump-config')
  for (const id of ['preset-plugin-crafter', 'crafter-example-host-status', 'preset-crafter-example-release', 'preset-crafter-example-greeting']) assert.ok(config.includes(id), id)
  report.checks.push('Packed manifests and composed plugin rows')
  const fd = openSync(log, 'w', 0o600)
  child = spawn(process.execPath, [...cli, '--profile', profile, '--port', String(port), '--no-open'], { cwd: source, env, stdio: ['pipe', fd, fd] })
  closeSync(fd)
  child.on('error', error => { report.launchError = error.message })
  registry('update', deployment.id, '--pid', String(child.pid), '--url', `http://127.0.0.1:${port}`, '--log', log, '--state', 'active', '--note', 'Packed example smoke runner is active')
  let startupUrl
  for (let attempt = 0; attempt < 150; attempt++) {
    startupUrl = readFileSync(log, 'utf8').match(/dsh web: (http:\/\/127\.0\.0\.1:\d+\/\?token=\S+)/)?.[1]
    if (startupUrl) break
    if (child.exitCode !== null || report.launchError) throw new Error('Host exited before ready; inspect its private log')
    await delay(200)
  }
  assert.ok(startupUrl, 'Host startup timed out; inspect its private log')
  const auth = await fetch(startupUrl, { redirect: 'manual' })
  const cookie = auth.headers.getSetCookie().map(value => value.split(';')[0]).join('; ')
  assert.ok(cookie, 'Startup login did not set a browser cookie')
  const origin = `http://127.0.0.1:${port}`
  async function rpc(endpoint, args) {
    const response = await fetch(`${origin}/api/${endpoint}`, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ type: 'client-request', rpcId: randomUUID(), method: endpoint, payload: { args } }) })
    assert.equal(response.status, 200, endpoint)
    const result = (await response.json()).result
    assert.equal(result.ok, true, JSON.stringify(result))
    return result.value
  }
  const presets = (await rpc('agentPresets/list', {})).presets
  for (const id of ['plugin-crafter', 'crafter-example-greeting', 'crafter-example-release']) assert.ok(presets.some(p => p.id === id && !p.diagnostic), id)
  const greeting = await rpc('session/create', { request: { cwd: workspace, agentPreset: 'crafter-example-greeting' } })
  const endpoint = `${origin}/crafter-smoke/greet?sessionId=${greeting.sessionId}`
  const called = await fetch(`${endpoint}&name=Ada`, { headers: { cookie } }).then(r => r.json())
  assert.equal(called.result.isError, false, JSON.stringify(called))
  assert.equal(called.result.value, 'Hello, Ada!')
  const invalid = await fetch(endpoint, { headers: { cookie } }).then(r => r.json())
  assert.equal(invalid.result.isError, true, 'Missing required name must fail')
  report.checks.push('Agent-scoped greeting: canonical Hello, Ada!; invalid arguments rejected')
  const statusUrl = `${origin}/crafter-example/status`
  assert.equal((await fetch(statusUrl)).status, 401)
  const status = await fetch(statusUrl, { headers: { cookie } })
  assert.equal(status.status, 200)
  assert.deepEqual(await status.json(), { plugin: 'crafter-example-host-status', label: 'Plugin Crafter example' })
  assert.equal((await fetch(statusUrl, { method: 'POST', headers: { cookie } })).status, 405)
  report.checks.push('Authenticated Host route: expected JSON; unauthenticated 401; POST 405')
  const release = await rpc('session/create', { request: { cwd: workspace, agentPreset: 'crafter-example-release' } })
  const skills = (await rpc('skills/list', { request: { sessionId: release.sessionId } })).skills
  assert.equal(skills.length, 1)
  assert.equal(skills[0].name, 'release-checklist')
  assert.ok(realpathSync(skills[0].path).startsWith(home), 'Skill must resolve from the installed tarball')
  report.checks.push('Configuration-only preset loads release-checklist from the installed artifact')
  const crafter = await rpc('session/create', { request: { cwd: workspace, agentPreset: 'plugin-crafter' } })
  const crafterSkills = (await rpc('skills/list', { request: { sessionId: crafter.sessionId } })).skills
  for (const name of ['dsh-plugin-crafter', 'dsh-upstream-source', 'dsh-plugin-verification']) assert.ok(crafterSkills.some(skill => skill.name === name), name)
  report.checks.push('Crafter Skills load from the packed artifact')
  for (const [caseId, session] of [['example-greeting', greeting], ['example-release', release], ['crafter-packed', crafter]]) registry('bind', deployment.id, '--case', caseId, '--workspace', workspace, '--session', session.sessionId, '--purpose', caseId)
  report.sessions = { greeting: greeting.sessionId, release: release.sessionId, crafter: crafter.sessionId }
  report.ok = true
} catch (error) {
  report.ok = false
  report.error = error.message
  process.exitCode = 1
} finally {
  if (child && child.exitCode === null) {
    // Only the child created by this runner is stopped; keep its stdin open until shutdown.
    child.kill('SIGTERM')
    await new Promise(done => {
      const force = setTimeout(() => child.kill('SIGKILL'), 10_000)
      child.once('exit', () => { clearTimeout(force); done() })
      if (child.exitCode !== null) { clearTimeout(force); done() }
    })
  }
  if (report.ok) {
    try {
      for (const sessionId of Object.values(report.sessions)) verifyWorkspace(sessionId)
      report.checks.push('All three persisted Session cwd headers match the separate test workspace after Host shutdown')
    } catch (error) { report.ok = false; report.error = error.message; process.exitCode = 1 }
  }
  const manifest = JSON.parse(readFileSync(profileManifest))
  if (manifest.dependencies?.['dsh-crafter-smoke-probe']) dsh('plugin', '--profile', profile, 'remove', 'dsh-crafter-smoke-probe')
  registry('update', deployment.id, '--state', 'retained', '--note', report.ok ? 'Packed examples passed; runner Host stopped; no model needed for deterministic smoke' : 'Example smoke failed; runner Host stopped; inspect private report and log')
  writeFileSync(join(artifacts, 'report.json'), JSON.stringify(report, null, 2), { mode: 0o600 })
  console.log(JSON.stringify(report, null, 2))
}
