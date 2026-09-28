# dsh-crafter-example-greeting

A self-contained, installable DeepSeek Harness (DSH) example plugin bundle.
It adds an Agent preset, `crafter-example-greeting`, whose only job is to
register one model-facing tool, `crafter_greet`.

- Target: **DSH 0.1.7-alpha.2**
- Form: bundle package (`dsh.bundle`) — one npm package that ships a configuration layer
- Build step: **none**; plain ESM JavaScript
- Runtime API: `@deepseek-ai/dsh-tools` is declared as a versioned peer and
  development dependency; Schemastery is a stateless schema dependency.

## What it does

| Item | Value |
|---|---|
| Tool name | `crafter_greet` |
| Parameters | `name` — required `string` |
| Canonical output | `string`, for example `Hello, Ada!` |
| Config | `greeting` — `string`, schema default `Hello` |
| Scope | the `crafter-example-greeting` preset's Agent scope |

The tool definition uses the official `defineTool` factory from
`@deepseek-ai/dsh-tools`. `inject = ['tools']` makes Cordis wait for the tool
registry before `apply` runs. `ctx.tools.register(...)` returns the exact
disposer and binds it to the plugin's fiber, so disabling, unloading, or
hot-replacing the plugin removes the tool again — no manual cleanup code.

## Layout

```
greeting-tool/
├── package.json       # dsh.bundle -> ./cordis.patch.yml, private, explicit files/exports
├── cordis.patch.yml   # the bundle layer: one @deepseek-ai/dsh-agent-preset insert
├── index.js           # plugin entry: name, inject, Config, apply
├── greeting.js        # DSH-free core (greeting text + tool options), unit-tested
├── test/
│   └── greeting.test.js
└── README.md
```

`index.js` is the plugin module the patch row references by package name.
`greeting.js` holds the pure core so the package can be tested with no Host and
no DSH imports.

## Install

The bundle is a normal profile dependency. Install the packed artifact (or the
checkout) into a profile and boot it:

```sh
dsh plugin --profile <name> add ./dsh-crafter-example-greeting-0.1.0.tgz
dsh --profile <name> --dump-config   # shows a "# == dsh-crafter-example-greeting" layer
dsh --profile <name>
```

Inside a running DSH session, the `plugin_manager` tool installs the same
package with an absolute `path` or `tarball` spec:

```json
{ "action": "install_bundle", "target": "/absolute/path/to/greeting-tool" }
```

## Configure the prefix

The shipped row carries no `config`, so the schema default `Hello` applies.
Preset children are owned by their declaration. Override the complete preset
config in the profile's `cordis.patch.yml`, preserving its plugin list:

```yaml
- id: preset-crafter-example-greeting
  config:
    id: crafter-example-greeting
    name: Greeting Example
    description: Example preset that mounts the crafter_greet tool.
    order: 50
    plugins:
      - id: greeting-tool
        name: dsh-crafter-example-greeting
        config:
          greeting: Hi
      - id: persona
        name: '@deepseek-ai/dsh-persona'
        config:
          suffix: Your working directory is {{cwd}}.
          prefix: You are a DSH plugin example agent powered by the {{model}} model.
```

A patch replaces the declaration's whole `config`, so restate its identity,
metadata, and plugins. Validate the updated behavior in a new Session.

## Verify

Standalone (no Host, no dependencies, no build):

```sh
cd greeting-tool && npm test
```

The tests check the canonical `Hello, Ada!` value, a configured prefix, the
required-string parameter contract, the string output schema and its render,
and that the manifest and patch declare what this README claims.

Against a running Host, select the `crafter-example-greeting` preset for a new
session and call the tool:

```
crafter_greet with name "Ada"  ->  Hello, Ada!
```

## Source record

| Fact | Value |
|---|---|
| Target version | DSH `0.1.7-alpha.2` |
| Source checkout | `deepseek-ai/deepseek-harness`, commit `00102833dfaee1da9f48a3a8eae9d34005a75218` (read-only) |
| Tool API | `packages/core/tools/src/schema.ts` (`defineTool`), `packages/core/tools/src/index.ts` (`tools.register`) |
| Config API | `docs/user/develop/basic/config.md` — `Config` is a Schemastery schema with defaults on fields |
| Bundle format | `docs/user/develop/basic/publish.md` — `dsh.bundle.patch`, `files`, and profile install |
| Preset format | `packages/bundle/web-app/presets/standard.patch.yml` — one `@deepseek-ai/dsh-agent-preset` row per preset |
| Tested runtime | DSH `0.1.7-alpha.2`; revalidate before targeting a different version |

No unresolved API differences were found against this target: `defineTool`,
`tools.register`, the Schemastery `Config` export, and the
`@deepseek-ai/dsh-agent-preset` row shape all matched the documentation and the
in-tree implementations at the recorded commit.

## License

MIT
