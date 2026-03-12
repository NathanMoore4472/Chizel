type CompiledFn = (ctx: unknown) => unknown

const compiledCache = new Map<string, CompiledFn>()

export function compileExpression(expression: string): CompiledFn {
  if (compiledCache.has(expression)) {
    return compiledCache.get(expression)!
  }
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('ctx', `"use strict"; return (${expression})`) as CompiledFn
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
