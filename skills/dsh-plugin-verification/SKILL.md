---
name: dsh-plugin-verification
description: Verify a DeepSeek Harness plugin through focused tests, packed-file inspection, isolated profile installation, actual Host behavior, and optional browser UI while preserving the daily DSH instance.
---

# Verify a DSH plugin

Choose only the layers that apply to the plugin, but do not claim a later layer from evidence for an earlier one. Standalone tests check logic; build and packed-file inspection check distributed files; `--dump-config` checks profile composition; a running Host checks module loading, injection, and behavior; a browser action checks contributed UI. Report unrun applicable layers as untested.

Before starting a Host, identify the daily process and its `DSH_HOME`. Query this Skill's [environment registry](references/environment-registry.md) by canonical plugin project and reuse a compatible deployment. A new case workspace does not require a new Host. Register a new deployment as soon as paths are chosen. The registry tracks identity and handoff; it does not start or stop processes.

Use a dedicated test home and profile. Install local plugin source with an absolute `link:` target; install a tarball when verifying the delivered artifact. When rebuilding DSH code or Client assets, use a separate source checkout and repoint profile links; a different port alone does not isolate files served by a daily Host. Use a separate port only for a listener.

For model-dependent tests, copy the effective provider route and required credential into the isolated launch environment without printing secret values. Prepare a disposable case workspace and bind its absolute path to the test Session through the target version's supported interface; verify the recorded Session cwd before sending a task. Exercise the plugin's actual event, request, state change, or UI interaction and collect an independent observation. Use a persistent Host or an explicit completion barrier for asynchronous work.

Read [host checks](references/host-checks.md) when setting up the real Host or browser layer. After the test, stop only the identified test process and compare the daily process and session store to the baseline. Preserve retained user-validation deployments and unrelated files.
