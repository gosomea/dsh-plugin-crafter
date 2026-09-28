# Packaged release-checklist Skill

This configuration-only bundle declares its own `crafter-example-release` preset. Its Skill root resolves from the installed package, so tarball users need no source checkout. It contributes no Host JavaScript or Client UI. Target: DSH `0.1.7-alpha.2`.

Install into an isolated Web profile with `dsh plugin --profile examples add link:/absolute/path/to/release-checklist`, boot the profile, and create a Session with **Release Checklist Example**. Its catalog contains `release-checklist`; ask the Agent to load that Skill and review a package in the Session workspace. The minimal preset exposes the Skill and filesystem tools but does not expose shell or publication tools.

The repository's isolated smoke runner verifies the actual preset roster and Session Skill catalog from a packed tarball. It does not treat the absence of Host code as an untested JavaScript plugin.
