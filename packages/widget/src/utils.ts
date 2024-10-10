// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assert(condition: any, message?: string | (() => string)): asserts condition {
  if (condition) {
    return
  }
  const provided = typeof message === 'function' ? message() : message
  const prefix = 'Assertion Failed'
  const value = provided ? ''.concat(prefix, ':').concat(provided) : prefix
  throw new Error(value)
}
