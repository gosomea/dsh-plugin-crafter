---
description: "Install and verify the dsh-crafter-example-host-status DSH example bundle."
kind: "package-bundle"
---

# dsh-crafter-example-host-status

English | [中文](README.zh.md)

## Summary

Read a small status response from an authenticated DSH Web Host. Add this bundle to an isolated Web profile and request `/crafter-example/status`. The route uses the Host’s existing authentication policy and serves the configured label. It creates no additional server or credential.

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

Target DSH `0.1.7-alpha.2`. Use a prepared isolated Web profile in the intended `DSH_HOME`. From this example directory:

```sh
npm install --ignore-scripts
npm test
dsh plugin --profile examples add link:/absolute/path/to/host-status
```

Boot that profile and open its full startup URL privately to authenticate. GET `/crafter-example/status` returns `{"plugin":"crafter-example-host-status","label":"Plugin Crafter example"}`. Unauthenticated GET is 401; authenticated POST is 405. Remove the layer with `dsh plugin --profile examples remove dsh-crafter-example-host-status` in the same home.

| Configuration | Type | Default | Behavior |
| --- | --- | --- | --- |
| `label` | string | `Plugin Crafter example` | Value returned by the route |

Override the complete `crafter-example-host-status` config in the profile patch to change `label`. Registration disposal removes the route. The controlled HTTP test checks configured output and disposal; the runner separately checks actual DSH activation.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

[index.js](index.js) injects `webServer` and `connection`. It returns the exact route registration disposer from a Cordis effect. The handler checks Host request rejection before serving JSON. [The patch](cordis.patch.yml) inserts the Host row and leaves the server and credential ownership with DSH.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

See [the example index](../README.md) for packed acceptance and [multi-environment development](../../docs/isolated-development.md) for environment selection.

-----

<a id="model-experience"></a>
## Model Experience

None. The package adds an HTTP route, not a model tool or prompt. Its route responses are visible to an authenticated HTTP client.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

This is a Web Host example. It requires the existing `webServer` and `connection` services. It adds no Client UI and makes no desktop or headless-profile compatibility claim.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
