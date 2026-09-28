---
name: release-checklist
description: Review a DSH plugin release for target-version evidence, packaged entry points, actual isolated behavior, and installation instructions.
---

# Review a DSH plugin release

Read the plugin's package manifest, README, and compatibility record. Identify the tested DSH version and the intended user behavior. Check that declared exports and bundle patches exist in the packed file list and that no credentials, logs, profiles, or Session files are distributed.

Distinguish installation, configuration composition, actual Host activation, and exercised behavior. Require evidence for the layers the plugin implements; a config dump alone cannot establish runtime success. For UI contributions require a normal browser interaction. Record an absent capability as not applicable and an applicable unrun check as untested.

Report concrete defects with their owning file and observed consequence. This preset is a read-only reviewer: do not publish, install, or mutate profiles as part of the review.
