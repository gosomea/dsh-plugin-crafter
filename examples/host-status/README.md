# Host status route

This Web-only example injects `webServer` and `connection`, registers an exact HTTP route, and returns its disposer from a Cordis effect. It uses the Host's authentication and origin policy; it creates no additional server or credential. Target: DSH `0.1.7-alpha.2`.

From this directory, run `npm install --ignore-scripts` and `npm test`. Install the checkout into an isolated Web profile with `dsh plugin --profile examples add link:/absolute/path/to/host-status`, then boot that profile. Open the full startup URL printed by DSH to authenticate. `GET /crafter-example/status` returns `{"plugin":"crafter-example-host-status","label":"Plugin Crafter example"}`; unauthenticated requests return 401 and authenticated POST requests return 405.

Override `crafter-example-host-status` in the profile patch to change `config.label`. Loader overrides replace the complete config. Removing or disabling the bundle disposes its route. The focused test uses a controlled HTTP server; actual DSH activation is separately covered by the repository's isolated smoke runner.
