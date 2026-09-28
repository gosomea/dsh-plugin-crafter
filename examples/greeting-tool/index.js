/**
 * dsh-crafter-example-greeting — a minimal installable DSH plugin bundle.
 *
 * Registers the `crafter_greet` tool in the scope that loads this plugin. The
 * bundle's patch mounts this module as a child plugin of the
 * `crafter-example-greeting` Agent preset, so the registration lands in that
 * preset's Agent scope and is visible to every Agent created from the preset.
 *
 * Cordis owns the registration lifetime: `ctx.tools.register()` returns the
 * exact disposer and binds it to this plugin's fiber, so unloading, disabling,
 * or hot-replacing the plugin removes the tool again.
 * @module dsh-crafter-example-greeting
 */

import { defineTool } from '@deepseek-ai/dsh-tools'
import Schema from '@deepseek-ai/schemastery'
import { DEFAULT_GREETING, crafterGreetTool } from './greeting.js'

/** Stable Loader identity for the row in `cordis.patch.yml`. */
export const name = 'crafter-example-greeting'

/** The tool registry must be ready before `apply` runs. */
export const inject = ['tools']

/**
 * Plugin configuration: the greeting prefix prepended to the name.
 * The default lives on the schema, so an unconfigured row still works.
 */
export const Config = Schema.object({
  greeting: Schema.string().default(DEFAULT_GREETING),
})

/**
 * Register `crafter_greet` in this plugin's scope.
 * @param ctx - the context owning the registration; `ctx.tools` is injected.
 * @param config - configuration validated against {@link Config}, defaults applied.
 */
export function apply(ctx, config) {
  ctx.tools.register(defineTool(crafterGreetTool(config.greeting)))
}
