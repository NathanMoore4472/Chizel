import type { EvalContext } from './context-builder'

const compiledCache = new Map<string, Function>()

function compileHandler(code: string): Function {
  if (compiledCache.has(code)) return compiledCache.get(code)!
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('ctx', 'event', `"use strict";\n${code}`)
    compiledCache.set(code, fn)
    return fn
  } catch (e) {
    const errFn = () => console.error('[Chizel] Event handler compile error:', e)
    compiledCache.set(code, errFn)
    return errFn
  }
}

export function buildEventHandlers(
  events: Record<string, string>,
  ctx: EvalContext
): Record<string, (e: Event) => void> {
  const handlers: Record<string, (e: Event) => void> = {}
  for (const [eventName, code] of Object.entries(events)) {
    if (!code.trim()) continue
    const fn = compileHandler(code)
    handlers[eventName] = (domEvent: Event) => {
      try {
        fn(ctx, domEvent)
      } catch (e) {
        console.error(`[Chizel] Event handler "${eventName}" error:`, e)
      }
    }
  }
  return handlers
}
