---
description: "Develop and verify one DSH plugin across reusable development and acceptance environments."
---

# Multi-environment plugin development

English | [中文](isolated-development.zh.md)

## Summary

Keep a development instance available for edits and an acceptance instance pinned to the package you are testing. Register both under one plugin project so another conversation can find their homes, processes, and cases. Reuse a compatible environment for additional cases. Separate incompatible builds and concurrent Hosts before changing files or starting work.

## Table of Contents

- [Choose what to separate](#choose-what-to-separate)
- [Find existing environments](#find-existing-environments)
- [Prepare two environments](#prepare-two-environments)
- [Run and verify the Hosts](#run-and-verify-the-hosts)
- [Retain and recover](#retain-and-recover)
- [Dev Note](#dev-note)

-----

<a id="choose-what-to-separate"></a>
## Choose what to separate

An environment is a recorded deployment, not just a port. A case is a workspace and optional Session inside that deployment. Several cases can reuse one compatible Host; concurrent deployments need independent storage and listeners.

| Item | What it controls | Separation rule |
| --- | --- | --- |
| `DSH_HOME` | Profiles, installed packages, credentials, and Session storage | Use a different absolute home for each independent deployment; never use the daily home |
| Profile | Bundle dependencies and configuration inside a home | Record the exact profile; a different name in the same home does not separate the whole store |
| DSH checkout | Runtime and Client build files served by the Host | Share only an unchanged compatible build; use another checkout before rebuilding code served by another Host |
| Plugin artifact | Linked source or installed tarball/registry version | Use a source link for edits and a packed artifact for acceptance; linked copies still share edited files |
| Host process and port | The running deployment and listener | Give concurrent Hosts separate ports; record PID and fingerprint before lifecycle actions |
| Case workspace and Session | Task files and the Session's recorded cwd | Put the workspace outside the home; bind the real Session, then verify persisted cwd |
| Registry database | Discovery and handoff across conversations | Share one local registry; it records environments but does not lock or provision Hosts |

This workflow separates development state. It does not impose an operating-system security sandbox or prevent a plugin from accessing other permitted paths. The [registry reference](../skills/dsh-plugin-verification/references/environment-registry.md) owns platform checks, storage, and command semantics.

<a id="find-existing-environments"></a>
## Find existing environments

Start in this repository with the built, version-matched DSH checkout available. Point the registry at this package's script; installed users can use the same script inside their installed package. These examples use the default persistent database, not a database inside a temporary environment.

```sh
CRAFTER_PROJECT=$(pwd -P)
CRAFTER_DSH_SOURCE=/absolute/path/to/deepseek-harness
CRAFTER_REGISTRY="$CRAFTER_PROJECT/skills/dsh-plugin-verification/scripts/environments.py"
python3 "$CRAFTER_REGISTRY" list --project "$CRAFTER_PROJECT"
```

For a candidate ID, run `show` and `check` before changing it. Read the JSON conclusions: command exit 0 only means the check ran. Confirm task idleness, installed artifact, model route, and served build separately. A stopped compatible Host can be restarted in its original home; a new case does not justify another deployment.

The two-environment tutorial below intentionally keeps source development separate from packed acceptance. For another purpose, inspect the records first and supply its actual separation reason.

<a id="prepare-two-environments"></a>
## Prepare two environments

The source CLI below reads the chosen built checkout. It does not rebuild it. Run this setup in one terminal and keep its variable values for the following steps:

```sh
node --version
python3 --version
npm ci --ignore-scripts
CRAFTER_LAB=$(mktemp -d "${TMPDIR:-/tmp}/crafter-lab.XXXXXX")
CRAFTER_RUN=$(date +%s)
CRAFTER_DEV_ID="crafter-dev-$CRAFTER_RUN"
CRAFTER_ACCEPT_ID="crafter-accept-$CRAFTER_RUN"
mkdir -p "$CRAFTER_LAB/dev-home" "$CRAFTER_LAB/accept-home" "$CRAFTER_LAB/dev-case" "$CRAFTER_LAB/accept-case"
dsh() { (cd "$CRAFTER_DSH_SOURCE" && pnpm dsh "$@"); }
python3 "$CRAFTER_REGISTRY" register "$CRAFTER_DEV_ID"   --project "$CRAFTER_PROJECT" --source "$CRAFTER_DSH_SOURCE" --plugin "$CRAFTER_PROJECT"   --home "$CRAFTER_LAB/dev-home" --profile crafter-dev --purpose 'Linked-source development'   --reason 'Keep source development separate from retained artifact acceptance'
python3 "$CRAFTER_REGISTRY" register "$CRAFTER_ACCEPT_ID"   --project "$CRAFTER_PROJECT" --source "$CRAFTER_DSH_SOURCE" --plugin "$CRAFTER_PROJECT"   --home "$CRAFTER_LAB/accept-home" --profile crafter-accept --purpose 'Packed-artifact acceptance'   --reason 'Run acceptance independently while the development Host remains available'
DSH_HOME="$CRAFTER_LAB/dev-home" dsh --profile crafter-dev --from-default-profile web --dump-config
DSH_HOME="$CRAFTER_LAB/dev-home" dsh plugin --profile crafter-dev add "link:$CRAFTER_PROJECT"
npm pack --json --pack-destination "$CRAFTER_LAB" > "$CRAFTER_LAB/pack.json"
CRAFTER_TARBALL="$CRAFTER_LAB/$(node -p 'JSON.parse(require("node:fs").readFileSync(process.argv[1]))[0].filename' "$CRAFTER_LAB/pack.json")"
DSH_HOME="$CRAFTER_LAB/accept-home" dsh --profile crafter-accept --from-default-profile web --dump-config
DSH_HOME="$CRAFTER_LAB/accept-home" dsh plugin --profile crafter-accept add "$CRAFTER_TARBALL"
```

Inspect each home/profile manifest and config dump for the Crafter dependency and preset. This confirms installation and composition, not activation. Both environments may read this unchanged DSH build. Before rebuilding DSH or its Client, choose a separate checkout and update that environment's `--source`; before editing a plugin used by another linked environment, use another plugin checkout or a pinned artifact.

<a id="run-and-verify-the-hosts"></a>
## Run and verify the Hosts

Use two terminals with the setup values and `dsh` function above. Keep each Host in the foreground; its stdin must stay open. Select unused ports if 3187 or 3188 is occupied. Do not replace the process that owns an occupied port.

```sh
# Development terminal
DSH_HOME="$CRAFTER_LAB/dev-home" dsh --profile crafter-dev --port 3187 --no-open
```

```sh
# Acceptance terminal
DSH_HOME="$CRAFTER_LAB/accept-home" dsh --profile crafter-accept --port 3188 --no-open
```

In the setup terminal, obtain each actual listener PID and record it. Continue only if each lookup returns exactly one PID. The registry compares process identity, home, profile, source cwd, and port; unreadable fields remain `unknown`.

```sh
CRAFTER_DEV_PID=$(lsof -nP -iTCP:3187 -sTCP:LISTEN -t)
CRAFTER_ACCEPT_PID=$(lsof -nP -iTCP:3188 -sTCP:LISTEN -t)
python3 "$CRAFTER_REGISTRY" update "$CRAFTER_DEV_ID" --pid "$CRAFTER_DEV_PID" --url http://127.0.0.1:3187
python3 "$CRAFTER_REGISTRY" update "$CRAFTER_ACCEPT_ID" --pid "$CRAFTER_ACCEPT_PID" --url http://127.0.0.1:3188
python3 "$CRAFTER_REGISTRY" check "$CRAFTER_DEV_ID"
python3 "$CRAFTER_REGISTRY" check "$CRAFTER_ACCEPT_ID"
```

Open each full startup URL privately. Create a Plugin Crafter Session in `dev-case` on the development Host and another in `accept-case` on the acceptance Host. Record each returned Session ID with `bind --case <id> --workspace <absolute-path> --session <session-id> --purpose <purpose>`; `bind` records an existing Session and does not create it. Verify the Session cwd before a model task. Compare a real tool result, route response, or skill catalog with the expected behavior.

For repeatable example acceptance, stop the chosen test Host first and run the packaged runner against its registered ID. The runner rejects an active deployment or occupied port. It installs freshly packed main and example bundles, so it verifies current source artifacts rather than preserving a previously pinned acceptance version.

```sh
npm run smoke:examples -- --dsh-source "$CRAFTER_DSH_SOURCE" --environment "$CRAFTER_ACCEPT_ID" --port 3188
```

<a id="retain-and-recover"></a>
## Retain and recover

Stop a tutorial Host with Ctrl+C in its own terminal after its tasks complete. Confirm that only that process stopped. Preserve its home, cases, Session IDs, and private report when they are needed for user validation. Record the next task and preservation reason without credentials or startup tokens:

```sh
python3 "$CRAFTER_REGISTRY" update "$CRAFTER_DEV_ID" --state retained --note 'Development Host stopped; reuse for the next compatible case'
python3 "$CRAFTER_REGISTRY" update "$CRAFTER_ACCEPT_ID" --state retained --note 'Acceptance complete; retain the installed artifact and Sessions for review'
python3 "$CRAFTER_REGISTRY" list --project "$CRAFTER_PROJECT"
```

`active`, `retained`, and `retired` are registry states, not live process states. If a temporary directory disappears, keep its old record, confirm it is no longer usable, and mark it `retired` before registering a replacement. A stale PID, changed fingerprint, or unknown identity does not authorize stopping a process. Coordinate before concurrent agents modify the same deployment; SQLite serializes records, not Host operations.

-----

<a id="dev-note"></a>
## Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
