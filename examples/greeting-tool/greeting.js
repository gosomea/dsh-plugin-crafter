/**
 * Pure core of the `crafter_greet` example tool.
 *
 * Everything here is free of DSH imports so the package can be unit-tested
 * standalone, without a running Host: the greeting text, the model-facing tool
 * definition options, and the canonical output rendering.
 * @module dsh-crafter-example-greeting/greeting
 */

/** Greeting prefix used when the plugin row supplies no `config`. */
export const DEFAULT_GREETING = 'Hello'

/**
 * Build the canonical greeting string.
 * @param greeting - prefix from the plugin config, for example `Hello`.
 * @param name - the name to greet.
 * @returns the canonical string value, for example `Hello, Ada!`.
 */
export function greetingText(greeting, name) {
  return `${greeting}, ${name}!`
}

/**
 * Build the arguments accepted by `defineTool`.
 *
 * `defineTool` infers the model-facing parameter schema from
 * `parameters` and the canonical value from `output.schema`.
 * @param greeting - prefix from the plugin config.
 * @returns options for one `crafter_greet` tool definition.
 */
export function crafterGreetTool(greeting) {
  return {
    name: 'crafter_greet',
    description: 'Greet a person by name and return the greeting string, for example "Hello, Ada!".',
    parameters: {
      name: { type: 'string', required: true, description: 'The name of the person to greet.' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      return greetingText(greeting, args.name)
    },
  }
}
