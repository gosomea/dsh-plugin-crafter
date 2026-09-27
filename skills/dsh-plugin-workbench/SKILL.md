---
name: dsh-plugin-workbench
description: Develop or modify a DeepSeek Harness plugin from a user request, choosing the correct extension point, target version, package form, and observable acceptance checks.
---

# Build a DSH plugin

Start from the requested behavior. Determine whether it belongs in a runtime experiment, a DSH workspace package, an external installable bundle, a preset declaration, or a plain Skill. Record the target DSH version or checkout commit before using any example or package name. Load `dsh-upstream-source` to find the current authority and relevant APIs.

For a persistent external plugin, use the target checkout's `docs/user/develop/` and the shipped `cordis-plugin-development` Skill. For a preset, use `editing-cordis-compositions`. Inspect live APIs with Cordis tools when present; inspect the installed package README and exported types next; read source only for questions those sources leave open. Do not copy a historical preset directory or an old community package layout into a newer DSH installation.

Before implementing, identify the owning Host or Agent scope, services and injections, config fields, disposable registrations, model-visible effects, and one observable result. Keep deployable plugin code in a normal repository with a package manifest and appropriate build output. Make the installation path explicit: dynamic runtime, source overlay, linked checkout, packed tarball, and registry package prove different things.

Use `dsh-plugin-verification` for the appropriate layers. Check the built or packed artifact, install through the supported path in a dedicated profile, then exercise the specific runtime behavior. A config dump shows composition only. Report the DSH version, actual commands, observations, and any layer still untested.
