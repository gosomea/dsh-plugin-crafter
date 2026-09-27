# Host and browser checks

## Before launch

Confirm the target CLI, Node engine, profile, `DSH_HOME`, current Git state, and any live daily process. Use the target checkout's CLI when testing checkout-specific behavior. Put launcher flags such as `--patch` before application flags such as Web `--port`. Install into a dedicated profile using `dsh plugin --profile <profile> add link:/absolute/path` or the exact packed tarball.

Inspect the profile manifest and `--dump-config` for the bundle dependency and row. This does not mount the plugin or evaluate `!!js`. A profile patch replaces an entire row's `config`, so test overlays must restate needed fields.

## Real Host

Start a persistent Host in the isolated home. Check that the row activates without import or injection errors. Use one concrete input that triggers the plugin and observe its expected output or persisted state. For model-dependent behavior, first complete a real request on the intended route. Host processes retain the environment they started with; restart the isolated Host after changing a required key.

For DSH Web, preserve the process-specific startup URL with `?token=` privately and open it once in the test browser. A bare URL does not authenticate a new browser profile. Keep stdin open when backgrounding a Web Host; some versions exit on stdin EOF. Never record the token or credential in test reports.

## Browser UI

Use a normal action to open the plugin's UI. Compare rendered data with storage or another independent source. If a cache is expected, clear it or use a fresh context before using a blocked fetch as a negative control.

## Close

Identify PID, command, cwd, supervisor, and `DSH_HOME` before stopping a test process. Check test Sessions stayed in the test home and the daily session store did not change from the baseline. Keep the test home when it is needed for reproduction or user validation; otherwise retire the registry entry after cleanup.
