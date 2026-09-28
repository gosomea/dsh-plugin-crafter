---
description: "Install and verify the dsh-crafter-example-release-checklist DSH example bundle."
kind: "package-bundle"
---

# dsh-crafter-example-release-checklist

English | [中文](README.zh.md)

## Summary

Create a Session with Release Checklist Example to read a packaged release checklist. The dedicated preset loads the skill from its installed package and exposes filesystem tools for inspection. Add the bundle to an isolated Web profile. It does not execute or publish a release.

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

Target DSH `0.1.7-alpha.2`. In a prepared isolated Web profile:

```sh
dsh plugin --profile examples add link:/absolute/path/to/release-checklist
```

Create a Session with **Release Checklist Example** and ask it to load `release-checklist` and inspect a package in that Session’s workspace. The catalog contains only this example’s skill. Remove the layer with `dsh plugin --profile examples remove dsh-crafter-example-release-checklist` in the same home.

The bundle has no custom configuration fields or build step. Its skill root is resolved from the installed package, so tarball installation does not need this source checkout.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

[The patch](cordis.patch.yml) declares the preset and consumes the Host’s existing skill service. It loads the [checklist](skills/release-checklist/SKILL.md) through the filesystem provider. It contributes no Host JavaScript or Client UI and does not register a duplicate skill service.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

See [the example index](../README.md) for packed acceptance and [multi-environment development](../../docs/isolated-development.md) for environment selection.

-----

<a id="model-experience"></a>
## Model Experience

Indirect. The mounted skill loader exposes `release-checklist`; its [instructions](skills/release-checklist/SKILL.md) own the model-visible checklist. The bundle itself emits no tool results.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

The minimal preset has skill and filesystem tools, with no shell or publication tools. The smoke checks discovery from an installed artifact; it does not test a model’s release judgment.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
