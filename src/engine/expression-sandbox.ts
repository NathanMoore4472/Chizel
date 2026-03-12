type CompiledFn = (ctx: unknown) => unknown

const compiledCache = new Map<string, CompiledFn>()

/**
 * Decide how to wrap the user's code:
 * - If it looks like a single expression (no statements), wrap with `return (...)`
 *   so the user doesn't need to type `return`.
 * - If it contains statements (const/let/var/if/for/return etc.), treat it as a
 *   function body and compile as-is — the user must include an explicit `return`.
 */
function buildFunctionBody(code: string): string {
  const trimmed = code.trim()

  // If the code already has an explicit return, use as function body directly
  if (/\breturn\b/.test(trimmed)) {
    return `"use strict";\n${code}`
  }

  // If it contains statement keywords, it's a block — append an implicit
  // return of the last expression isn't possible, so require explicit return.
  // We detect this by looking for declaration/control-flow keywords at the
  // start of a line or after a semicolon.
  const hasStatements = /(?:^|\n|;)\s*(const|let|var|if|for|while|switch|function|class|try)\b/.test(trimmed)

  if (hasStatements) {
    // Multi-statement block — user must write `return` themselves.
    // We still return the code so it compiles; it'll return undefined if they
    // forget, which is better than a compile error.
    return `"use strict";\n${code}`
  }

  // Single expression — wrap so `return` isn't needed
  return `"use strict"; return (${code})`
}

export function compileExpression(expression: string): CompiledFn {
  if (compiledCache.has(expression)) {
    return compiledCache.get(expression)!
  }
  try {
    const body = buildFunctionBody(expression)
    // eslint-disable-next-line no-new-func
    const fn = new Function('ctx', body) as CompiledFn
    compiledCache.set(expression, fn)
    return fn
  } catch (e) {
    const errFn: CompiledFn = () => { throw e }
    compiledCache.set(expression, errFn)
    return errFn
  }
}

export function evaluateExpression(expression: string, ctx: unknown): { value: unknown; error: string | null } {
  try {
    const fn = compileExpression(expression)
    const value = fn(ctx)
    return { value, error: null }
  } catch (e) {
    return { value: undefined, error: e instanceof Error ? e.message : String(e) }
  }
}

export function clearExpressionCache(): void {
  compiledCache.clear()
}
