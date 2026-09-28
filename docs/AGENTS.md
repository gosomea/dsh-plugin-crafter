# Documentation instructions

Follow the upstream [DSH documentation standard](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/AGENTS.md). User pages are sibling English/Chinese pairs with Git blob confirmation records. Maintain meaning, physical line count, structure, code blocks and locale links together; use one physical line per paragraph.

Root and example bundle READMEs use the bundle template. Keep runtime facts in the package owner, multi-environment procedures in `isolated-development`, registry semantics in the packaged reference, and measured evidence in `examples-verification` and `verification.json`.

Run documented operations in an isolated home, preserve existing deployments, then run `npm run check:docs`, `npm run doc-sync`, `npm run pack:check` and `git diff --check`. Confirm only reviewed pairs with `node scripts/check-docs.mjs --write <pages...>`. These external-package gates do not claim upstream corpus-wide validation.
