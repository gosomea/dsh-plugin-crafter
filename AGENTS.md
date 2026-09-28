# dsh-plugin-crafter

This repository builds an external DeepSeek Harness bundle. Read `README.md` and `docs/compatibility.md` before changing its patch or Skills. The target Harness checkout is read-only for this project.

The preset patch is derived from the target checkout's `packages/bundle/web-app/presets/cordis.patch.yml` by `scripts/sync-official-preset.mjs`. Regenerate it from a chosen checkout, review the diff, and record the tested version. Do not hand-edit the copied base composition or silently claim compatibility with another DSH version.

Keep packaged Skills self-contained and relative to this package. Check every `SKILL.md` frontmatter, `npm pack` file list, profile composition, and actual Host activation before release. Use an isolated `DSH_HOME`; do not alter or restart the user's daily Host. Preserve unrelated Git changes.
