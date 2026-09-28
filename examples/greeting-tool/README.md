---
description: "Install and verify the dsh-crafter-example-greeting DSH example bundle."
kind: "package-bundle"
---

# dsh-crafter-example-greeting

English | [中文](README.zh.md)

## Summary

Call `crafter_greet` from a Session using Greeting Example and receive a greeting string. The tool requires a string `name` and defaults to the prefix `Hello`. Add this bundle to an isolated Web profile. The tool is scoped to its dedicated preset; other presets do not gain it.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Target DSH `0.1.7-alpha.2`. Use a prepared isolated Web profile in the intended `DSH_HOME`. From this example directory, install source dependencies before linking it:

```sh
npm install --ignore-scripts
npm test
dsh plugin --profile examples add link:/absolute/path/to/greeting-tool
```

Select **Greeting Example** for a new Session. Invoke `crafter_greet` with `{"name":"Ada"}`; the canonical string is `Hello, Ada!`. Omitting `name` returns a tool error. Remove the layer with `dsh plugin --profile examples remove dsh-crafter-example-greeting` in the same home.

| Configuration | Type | Default | Behavior |
| --- | --- | --- | --- |
| `greeting` | string | `Hello` | Prefix passed to the greeting tool |

To change `greeting`, override the complete `preset-crafter-example-greeting` config in the profile patch, preserving its identity and `plugins` list from [cordis.patch.yml](cordis.patch.yml). Set the `greeting-tool` child's `config.greeting` and create a new Session. Loader overrides replace the entire row config; a partial preset declaration loses required fields.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The patch inserts one `@deepseek-ai/dsh-agent-preset` declaration. Its Agent plugin list mounts this package’s tool and the official persona. [index.js](index.js) uses the versioned `defineTool` API and registers through `tools`; the registration is bound to the plugin fiber. [greeting.js](greeting.js) owns the pure greeting behavior. The bundle is plain ESM and requires no build.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

See [the example index](../README.md) for packed acceptance and [multi-environment development](../../docs/isolated-development.md) for environment selection.

-----

<a id="model-experience"></a>
## Model Experience

Indirect through the mounted tool plugin. The tool accepts a required string `name` and returns a canonical string such as `Hello, Ada!`. Its output schema and presenter are owned by [greeting.js](greeting.js).

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

The example has no Client UI. The focused tests cover a configured prefix; live configuration reload is untested. The dedicated preset provides this tool and persona, not a full coding tool set. Revalidate against another DSH version.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
