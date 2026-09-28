---
description: "Run focused checks and maintain DSH-style paired documentation for this external bundle."
---

# Contributing and documentation

English | [中文](development.zh.md)

## Summary

Develop this external bundle without changing its selected upstream checkout. Run package, registry, and documentation checks before distributing it. Maintain English and Chinese pages together. Verify instructions against real isolated environments and keep each fact with its owning page.

## Table of Contents

- [Run focused checks](#checks)
- [Apply the DSH documentation standard](#standard)
- [Maintain paired pages](#pairing)
- [Dev Note](#dev-note)

-----

<a id="checks"></a>
## Run focused checks

Use Node `^22.19` or `>=24` and Python 3.9+ from the repository root:

```sh
npm ci --ignore-scripts
npm run check
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests
npm run check:docs
npm run doc-sync
npm run pack:check
git diff --check
```

`check:docs` exercises valid documentation and rejected invalid fixtures; `doc-sync` checks the actual paired pages, metadata, paragraph wrapping, links, and confirmation records. These are this external repository's focused checks, not a claim that upstream's complete `pnpm run test:docs`, `doc-sync`, or lint suite ran here. CI executes these local checks. [Example acceptance](../examples/README.md) additionally requires a built DSH checkout.

<a id="standard"></a>
## Apply the DSH documentation standard

Follow upstream [docs/AGENTS.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/AGENTS.md). Bundle READMEs use `description` and `kind: package-bundle`, a capability-focused Summary, Table of Contents, user instructions, folded implementation, Further Exploration, Model Experience, Known Limitations, and a folded Dev Note. Keep each paragraph on one physical line. Keep each English package Summary at or below 100 words.

The root README owns capabilities and the install entry. The multi-environment guide owns the development procedure. The registry reference owns script semantics. Example READMEs own their package behavior. Compatibility owns the target version; the verification page and JSON own measured evidence. Link to the owner instead of repeating its implementation details.

<a id="pairing"></a>
## Maintain paired pages

Each user-facing page has `foo.md`, `foo.zh.md`, and `foo.i18n.yaml` siblings. Both languages have equal authority. Keep physical line count, heading depths, lists, tables, code blocks, and link targets aligned. Use stable explicit anchors in both languages. Update locale-sensitive local page links; keep code and non-paired source links identical.

After reviewing both languages for meaning, confirm only the pairs you edited:

```sh
node scripts/check-docs.mjs --write README.md docs/isolated-development.md
npm run doc-sync
```

`--write` stores each confirmed text as a Git blob and records the blob hash; it does not translate or certify meaning. A changed side without a new confirmation fails. The checker does not replace semantic review. Skills retain their invocation frontmatter and are not translated into independently invocable duplicates.

-----

<a id="dev-note"></a>
## Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
