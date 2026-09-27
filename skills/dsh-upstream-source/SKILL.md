---
name: dsh-upstream-source
description: Find the authoritative DeepSeek Harness version, checkout, documentation, types, and neighboring implementations before changing or debugging a DSH plugin.
---

# Read the target DSH source

Find the version used by the target profile, then locate a matching installed package or `deepseek-ai/deepseek-harness` checkout. Record its package version, Git remote, commit, and whether relevant files are modified. Do not assume the current public `master` matches the user's installation. If an installed DSH and checkout differ, use the installed package as the runtime authority and name the mismatch.

Read the checkout's `AGENTS.md` before changing its own `packages/`; external plugins follow the published API and applicable host contracts, while repository-only rules remain specific to that checkout. Read `docs/architecture.md`, `docs/user/develop/`, `docs/cordis-primer.md`, package READMEs, and `lib/types` or `src` selectively for the requested extension point. Prefer the current shipped `cordis-plugin-development`, `editing-cordis-compositions`, and `cordis-composition-reference` Skills when available. For live APIs, query Cordis inspection before guessing method names.

Check the actual preset system before authoring a preset. In the 0.1.7-alpha.2 baseline, Web presets are `@deepseek-ai/dsh-agent-preset` rows in bundle patches under `packages/bundle/web-app/presets/`; the earlier `.agent-presets` directory is not read. Verify this again when targeting another version.

Keep a short source record in the plugin project's compatibility notes: target version or commit, relevant official paths, runtime entry used for validation, and any unresolved API difference. Do not paste large upstream documents into the project or model context.
