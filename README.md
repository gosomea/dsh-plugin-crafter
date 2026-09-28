---
description: "Develop DSH plugins in reusable isolated environments, with official-source guidance and artifact verification."
kind: "package-bundle"
---

# DSH Plugin Crafter

English | [中文](README.zh.md)

## Summary

Develop a DSH plugin while keeping development, acceptance, and daily instances separate. Plugin Crafter guides an agent through version-matched official APIs, implementation, and verification. Its shared environment registry lets later sessions find existing deployments, reuse compatible ones, or record why another environment is needed. Add the bundle to a Web profile and select Plugin Crafter. You manage the actual processes and builds; the registry records them.

## Table of Contents

- [Use this package](#use-this-package)
- [Develop with multiple environments](#multi-environment-development)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Start with a compatible DSH installation, Node `^22.19` or `>=24`, and Python 3.9+ for the registry. The tested DSH target is `0.1.7-alpha.2`; read [compatibility](docs/compatibility.md) before installing into another version.

### Install into an isolated profile

Use an absolute home outside the daily DSH store. Run the commands in the same terminal so installation and launch use the same home:

```sh
export DSH_HOME=/absolute/path/to/crafter-development-home
dsh --profile crafter --from-default-profile web --dump-config
dsh plugin --profile crafter add dsh-plugin-crafter@0.1.0 --registry=https://registry.npmjs.org
dsh --profile crafter --port 3187 --no-open
```

Open the full startup URL privately, create a Session in your plugin repository, and select **Plugin Crafter**. Ask it to develop a plugin, identify the target version, and verify one observable behavior. Provide the matching official source checkout when source inspection is needed. Configure the model route and required credentials in this isolated environment before a model task.

The install adds the `plugin-crafter` preset, the official Creator skills, and three Crafter skills. It activates no examples automatically. To remove this layer from the same home, run `dsh plugin --profile crafter remove dsh-plugin-crafter`.

<a id="multi-environment-development"></a>
### Develop with multiple environments

An environment records its own home, profile, source checkout, plugin installation, Host identity, and purpose. Each environment can retain multiple case workspaces and Session IDs. The registry persists outside temporary homes, so another conversation can find those records.

Reuse a stopped compatible environment for another case. Keep a separate environment when an acceptance Host must remain available, incompatible builds need comparison, or Hosts must run concurrently. Each concurrent Host needs a different home and port. Builds that change served DSH code need a separate checkout; a different profile or port cannot separate shared files.

Follow [the multi-environment development guide](docs/isolated-development.md) to query, register, launch, verify, and retain two environments. It explains what is isolated, what remains shared, and how to recover from stale records.

### Choose an example

The [examples](examples/README.md) cover an Agent tool, an authenticated Host route, and a configuration-only preset with a packaged skill. Copy the relevant pattern, then check its API against your chosen DSH version. [Verification evidence](docs/examples-verification.md) distinguishes model-assisted generation, deterministic Host checks, and published-package installation.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The [bundle patch](cordis.patch.yml) derives the official Creator composition from the selected source checkout and inserts a distinct `plugin-crafter` preset. The filesystem skill loader resolves this package's skills from the installed package. The [manifest](package.json) declares `dsh.bundle.patch`; the main package has no runtime JavaScript or install scripts.

The [verification skill](skills/dsh-plugin-verification/SKILL.md) selects applicable test layers. Its [registry reference](skills/dsh-plugin-verification/references/environment-registry.md) owns command and storage semantics. The registry records deployments and cases; the smoke runner owns only the Host it launches. Neither record state nor a config dump proves runtime behavior.

The preset derives from the MIT-licensed DeepSeek Harness Creator. The registry adapts the author’s `dsh-plugin-isolated-test` workflow. This is an independent project; see [LICENSE](LICENSE) for attribution.

The [contributor guide](docs/development.md) owns local checks and documentation pairing. The selected upstream checkout stays read-only unless a separate DSH change is explicitly in scope.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [Multi-environment development](docs/isolated-development.md): preserve acceptance instances while developing another build.
- [Compatibility](docs/compatibility.md): choose the DSH target and revalidate upgrades.
- [Examples](examples/README.md): installable extension patterns and their behavior.
- [Official plugin publishing guide](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.md): current upstream package conventions.

-----

<a id="model-experience"></a>
## Model Experience

Indirect. The bundle makes the official Creator skills and the three Crafter skills available to a Session using Plugin Crafter. Those skills guide implementation, source inspection, and verification. The bundle itself emits no tool results; mounted DSH plugins own their model-visible behavior. The [development trial](docs/examples-verification.md) records one guided generation run, not an unattended success guarantee.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

The registry does not provision machines, launch Hosts, lease deployments, or check task idleness and build compatibility automatically. Coordinate before two agents mutate one deployment. Separate homes are development isolation, not an operating-system security sandbox. The current runner requires a built matching DSH checkout; Windows Host identity checks are not verified. Model credentials are configured separately. The tested DSH source contains pre-existing LLM and persistence changes; see the [verification scope](docs/examples-verification.md).

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
