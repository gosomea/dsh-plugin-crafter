import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { test } from 'node:test'
import { apply } from './index.js'

test('route respects authentication, method, configured data, and disposal', async () => {
  let route
  let dispose
  apply({
    connection: { requestRejection: req => req.headers.cookie === 'test=allowed' ? undefined : 401 },
    effect: start => { dispose = start() },
    webServer: { register: value => { route = value; return () => { route = undefined } } },
  }, { label: 'Independent fixture' })
  const server = createServer((req, res) => {
    if (route && new URL(req.url, 'http://localhost').pathname === route.path) route.handler(req, res)
    else { res.statusCode = 404; res.end() }
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const url = `http://127.0.0.1:${server.address().port}/crafter-example/status`
  try {
    assert.equal((await fetch(url)).status, 401)
    const headers = { cookie: 'test=allowed' }
    const response = await fetch(url, { headers })
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await response.json(), { plugin: 'crafter-example-host-status', label: 'Independent fixture' })
    const deniedMethod = await fetch(url, { method: 'POST', headers })
    assert.equal(deniedMethod.status, 405)
    assert.equal(deniedMethod.headers.get('allow'), 'GET')
    dispose()
    assert.equal((await fetch(url, { headers })).status, 404)
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  }
})
