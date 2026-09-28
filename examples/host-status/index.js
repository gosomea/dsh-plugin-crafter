import Schema from '@deepseek-ai/schemastery'

export const name = 'crafter-example-host-status'
export const inject = ['webServer', 'connection']
export const Config = Schema.object({
  label: Schema.string().default('Plugin Crafter example'),
})

export function apply(ctx, config) {
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/crafter-example/status',
    handler(req, res) {
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) {
        res.statusCode = rejection
        res.end()
        return
      }
      res.setHeader('cache-control', 'no-store')
      if (req.method !== 'GET') {
        res.statusCode = 405
        res.setHeader('allow', 'GET')
        res.end()
        return
      }
      res.setHeader('content-type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ plugin: name, label: config.label }))
    },
  }), 'crafter-example: status route')
}
